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

// Cooking a recipe draws its ingredients out of the user's kitchen.
//
// Quantities are only deducted when the recipe and the kitchen agree on the
// unit — a recipe asking for "400 g" cannot be subtracted from a kitchen row
// measured in "pcs" without inventing a conversion. Anything we cannot deduct
// with confidence is left untouched and reported back, so the caller can tell
// the user rather than silently corrupting their inventory.
const cookRecipe = async (req, res) => {
  const userId = req.user.id
  const { recipeId } = req.params

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const { rows: required } = await client.query(`
      SELECT ri.ingredient_id, ri.quantity, ri.unit, i.name
      FROM recipe_ingredients ri
      JOIN ingredients i ON i.id = ri.ingredient_id
      WHERE ri.recipe_id = $1`, [recipeId])

    if (required.length === 0) {
      const err = new Error('That recipe has no ingredients listed.')
      err.status = 400
      throw err
    }

    const used = []
    const missing = []
    const skipped = []

    for (const item of required) {
      const { rows: held } = await client.query(
        'SELECT id, quantity, unit FROM kitchen WHERE user_id=$1 AND ingredient_id=$2',
        [userId, item.ingredient_id])

      if (held.length === 0) {
        missing.push(item.name)
        continue
      }

      const stock = held[0]
      const sameUnit =
        (stock.unit ?? '').trim().toLowerCase() === (item.unit ?? '').trim().toLowerCase()

      // No quantity recorded, or units disagree: mark it used but leave the
      // row alone rather than guessing.
      if (stock.quantity === null || !sameUnit) {
        skipped.push({ name: item.name, reason: sameUnit ? 'no quantity recorded' : 'different unit' })
        continue
      }

      const remaining = Number(stock.quantity) - Number(item.quantity ?? 0)

      if (remaining > 0) {
        await client.query('UPDATE kitchen SET quantity=$1 WHERE id=$2', [remaining, stock.id])
        used.push({ name: item.name, remaining })
      } else {
        // Fully consumed — drop it out of the kitchen entirely.
        await client.query('DELETE FROM kitchen WHERE id=$1', [stock.id])
        used.push({ name: item.name, remaining: 0 })
      }
    }

    await client.query('COMMIT')

    return { used, missing, skipped, total: required.length }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export default {
  getKitchen,
  addToKitchen,
  removeFromKitchen,
  cookRecipe,
}
