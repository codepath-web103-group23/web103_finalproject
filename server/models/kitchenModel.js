import { pool } from '../db/dbpool.js'

const getKitchen = async (req, res) => {
  const userId = req.user.id
  const result = await pool.query(`
    SELECT kitchen.id, kitchen.quantity, kitchen.unit,
           ingredients.id AS ingredient_id, ingredients.name,
           ingredients.category, ingredients.calories, ingredients.dietary_tags
    FROM kitchen
    JOIN ingredients ON ingredients.id = kitchen.ingredient_id
    WHERE kitchen.user_id=$1`, [userId])
  return result.rows
}

const addToKitchen = async (req, res) => {
  const userId = req.user.id
  const { ingredient_id, name, category, calories, dietary_tags, quantity, unit } = req.body

  // Two ways in:
  //  - `ingredient_id` — the user picked something from the shared catalog.
  //  - name/category/… — they're creating an ingredient that doesn't exist yet.
  //
  // Previously this always INSERTed a new ingredients row, so picking an
  // existing one was impossible and the catalog filled up with duplicates
  // ("Tomato" twice, "Chicken Breast" twice) every time someone stocked
  // their kitchen.
  let ingredient

  if (ingredient_id) {
    const existing = await pool.query(
      'SELECT * FROM ingredients WHERE id=$1', [ingredient_id])

    if (existing.rows.length === 0) {
      const err = new Error('That ingredient no longer exists.')
      err.status = 404
      throw err
    }
    ingredient = existing.rows[0]

    // removeFromKitchen deletes by (user_id, ingredient_id), so a second row
    // for the same pair would be unreachable from the UI.
    const already = await pool.query(
      'SELECT id FROM kitchen WHERE user_id=$1 AND ingredient_id=$2',
      [userId, ingredient_id])

    if (already.rows.length > 0) {
      const err = new Error(`${ingredient.name} is already in your kitchen.`)
      err.status = 409
      throw err
    }
  } else {
    const ingredientResult = await pool.query(`
      INSERT INTO ingredients (name, category, calories, dietary_tags)
      VALUES ($1, $2, $3, $4)
      RETURNING *`, [name, category, calories, dietary_tags])
    ingredient = ingredientResult.rows[0]
  }

  const kitchenResult = await pool.query(`
    INSERT INTO kitchen (user_id, ingredient_id, quantity, unit)
    VALUES ($1, $2, $3, $4)
    RETURNING *`, [userId, ingredient.id, quantity || null, unit || null])

  return { ...ingredient, ...kitchenResult.rows[0] }
}

const removeFromKitchen = async (req, res) => {
  const { ingredientId } = req.params
  const userId = req.user.id
  const result = await pool.query(`
    DELETE FROM kitchen
    WHERE user_id=$1 AND ingredient_id=$2
    RETURNING *`, [userId, ingredientId])
  return result.rows[0]
}

export default {
  getKitchen,
  addToKitchen,
  removeFromKitchen,
}
