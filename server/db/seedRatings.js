import { pool } from './dbpool.js'

// Populates the `ratings` join table and recalculates recipes.avg_rating from
// it.
//
// The ratings table was empty, yet two recipes carried a hand-set avg_rating
// (4.90, 4.50) with nothing behind it and nine more were null. This makes the
// column mean what it says: every avg_rating below is the actual average of
// that recipe's rows in `ratings`.
//
// Ratings are attributed to the existing user accounts because ratings.user_id
// is a foreign key to users and the table has a UNIQUE (user_id, recipe_id)
// constraint — there is nowhere else to hang them. This is demo data, not real
// opinions held by those accounts.
//
// Idempotent: ON CONFLICT DO NOTHING on the unique pair, so re-running neither
// duplicates nor changes an existing score. Recipes that already have real
// ratings are left alone.
//
//   cd server && node db/seedRatings.js

// Deterministic, so a re-run on a fresh database produces the same spread
// rather than a different random one.
const scoreFor = (recipeId, index) => {
  const spread = [5, 4, 5, 3, 4, 5, 4, 3, 5, 4]
  return spread[(recipeId * 3 + index * 7) % spread.length]
}

const seed = async () => {
  const { rows: users } = await pool.query('SELECT id FROM users ORDER BY id')
  const { rows: recipes } = await pool.query('SELECT id FROM recipes ORDER BY id')

  if (users.length === 0) {
    console.error('No users in the database — ratings need a user to hang off.')
    process.exit(1)
  }

  let inserted = 0

  for (const recipe of recipes) {
    // Two to four raters per recipe, varying by id so the averages differ.
    const raterCount = 2 + (recipe.id % 3)

    for (let i = 0; i < raterCount && i < users.length; i++) {
      const user = users[(recipe.id + i) % users.length]
      const stars = scoreFor(recipe.id, i)

      const result = await pool.query(
        `INSERT INTO ratings (user_id, recipe_id, stars)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, recipe_id) DO NOTHING
         RETURNING id`,
        [user.id, recipe.id, stars])

      inserted += result.rowCount
    }
  }

  // Recalculate every average from the join table. This is the calculation
  // that has never existed anywhere in the app (see issue #55).
  const updated = await pool.query(`
    UPDATE recipes r
    SET avg_rating = sub.avg
    FROM (
      SELECT recipe_id, ROUND(AVG(stars)::numeric, 2) AS avg
      FROM ratings GROUP BY recipe_id
    ) sub
    WHERE r.id = sub.recipe_id
      AND r.avg_rating IS DISTINCT FROM sub.avg`)

  console.log(`Ratings: ${inserted} inserted. avg_rating recalculated on ${updated.rowCount} recipes.`)
  await pool.end()
}

seed().catch((err) => {
  console.error('Seeding failed:', err)
  process.exit(1)
})
