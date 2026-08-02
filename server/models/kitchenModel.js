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
  const { name, category, calories, dietary_tags, quantity, unit } = req.body

  const ingredientResult = await pool.query(`
    INSERT INTO ingredients (name, category, calories, dietary_tags)
    VALUES ($1, $2, $3, $4)
    RETURNING *`, [name, category, calories, dietary_tags])
  const ingredient = ingredientResult.rows[0]

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
