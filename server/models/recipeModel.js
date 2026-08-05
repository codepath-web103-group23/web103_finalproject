import { pool } from '../db/dbpool.js'

const createRecipe = async (req, res) => {
  const { recipe, ingredients = [] } = req.body
  const { title, description, instructions, image_url } = recipe

  // Both tables have to be written together, so grab ONE connection and run a
  // transaction on it. pool.query() would hand each statement a different
  // connection, and BEGIN only applies to the connection that ran it.
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const result = await client.query(
      `
        INSERT INTO recipes
        (title, description, instructions, image_url)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `,
      [title, description, instructions, image_url]
    )

    // postgres assigns the id, so we only learn it here - the ingredient rows
    // cannot be written before this point
    const newRecipe = result.rows[0]

    for (const row of ingredients) {
      await client.query(
        `
          INSERT INTO recipe_ingredients
          (recipe_id, ingredient_id, quantity, unit)
          VALUES ($1, $2, $3, $4)
        `,
        [newRecipe.id, row.ingredient_id, row.quantity || null, row.unit || null]
      )
    }

    await client.query('COMMIT')
    return newRecipe

  } catch (err) {
    // any failure undoes the whole thing - no half-saved recipes
    await client.query('ROLLBACK')
    throw err

  } finally {
    client.release()
  }
}

const getRecipes = async (req, res) => {
  const query = `SELECT * FROM recipes`
  const data = await pool.query(query)
  return data.rows
}

const getRecipe = async (req, res) => {
  const { id } = req.params
  const query = `SELECT * FROM recipes WHERE id=$1`
  const data = await pool.query(query, [id])
  return data.rows[0]
}

const getRecipeIngredients = async (req, res) => {
  const { id } = req.params
  const query = `
    SELECT
      ri.id,
      ri.quantity,
      ri.unit,
      i.id AS ingredient_id,
      i.name,
      i.category,
      i.calories,
      i.dietary_tags
    FROM recipe_ingredients ri
    JOIN ingredients i ON i.id = ri.ingredient_id
    WHERE ri.recipe_id=$1
    ORDER BY i.name
  `
  const data = await pool.query(query, [id])
  return data.rows
}

const patchRecipeIngredients = async (req, res) => {
  const { id } = req.params
  const { ingredients } = req.body

  try {
    // remove existing ingredients for this recipe
    await pool.query(
      `
      DELETE FROM recipe_ingredients
      WHERE recipe_id = $1
      `,
      [id]
    )

    // insert updated ingredients
    for (const ingredient of ingredients) {
      await pool.query(
        `
        INSERT INTO recipe_ingredients
        (recipe_id, ingredient_id, quantity, unit)
        VALUES ($1, $2, $3, $4)
        `,
        [
          id,
          ingredient.ingredient_id,
          ingredient.quantity,
          ingredient.unit
        ]
      )
    }

    const result = await pool.query(
      `
      SELECT ingredient_id, quantity, unit
      FROM recipe_ingredients
      WHERE recipe_id = $1
      `,
      [id]
    )

    return result.rows
  } catch (err) {
    throw err
  }
}

const createRecipeIngredient = async (req, res) => {
  const { recipe_id, ingredient_id, quantity, unit } = req.body

  const result = await pool.query(
    `
    INSERT INTO recipe_ingredients
    (recipe_id, ingredient_id, quantity, unit)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [
      recipe_id,
      ingredient_id,
      quantity,
      unit
    ]
  )

  return result.rows[0]
}

// const updateRecipe = async (req, res) => {
//   const { id } = req.params
//   const data = req.body
//   const { title, description, instructions, image_url, avg_rating } = data 
//   const result = await pool.query(`
//     UPDATE recipes
//     SET title=$1, description=$2, instructions=$3, image_url=$4, avg_rating=$5
//     RETURNING *`,
//     [title, description, instructions, image_url, avg_rating]
//   );
//   return result.rows[0]
// }

const updateRecipe = async (req, res) => {
  const { id } = req.params
  const data = req.body
  const { title, description, instructions, image_url, avg_rating } = data

  const result = await pool.query(
    `
    UPDATE recipes
    SET title=$1,
        description=$2,
        instructions=$3,
        image_url=$4,
        avg_rating=$5
    WHERE id=$6
    RETURNING *
    `,
    [title, description, instructions, image_url, avg_rating, id]
  )

  return result.rows[0]
}

const deleteRecipe = async (req, res) => {
  const { id } = req.params
  const result = await pool.query(`
    DELETE FROM recipes WHERE id=$1
    RETURNING *`, [id]
  );
  return result.rows[0]
}

export default {
  createRecipe,
  getRecipes,
  getRecipe,
  getRecipeIngredients,
  createRecipeIngredient, 
  updateRecipe,
  deleteRecipe
}
