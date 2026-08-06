import { pool } from '../db/dbpool.js'

const getScheduledMeals = async (req, res) => {
  const userId = req.user.id
  // `date` is returned as a plain YYYY-MM-DD string rather than a DATE.
  //
  // node-postgres turns a DATE into a JS Date at the *server's* local midnight,
  // which JSON then serialises as UTC ("2026-08-02T04:00:00.000Z"). The client
  // built its calendar keys from local date parts, so the two disagreed
  // whenever the server and browser were in different timezones and meals
  // landed on the wrong day. A bare string has no timezone to shift.
  const result = await pool.query(`
    SELECT scheduled_meals.id, scheduled_meals.user_id, scheduled_meals.recipe_id,
           scheduled_meals.meal_type,
           to_char(scheduled_meals.date, 'YYYY-MM-DD') AS date,
           recipes.title, recipes.image_url
    FROM scheduled_meals
    JOIN recipes ON recipes.id = scheduled_meals.recipe_id
    WHERE scheduled_meals.user_id=$1
    ORDER BY scheduled_meals.date ASC`, [userId])
  return result.rows
}

const createScheduledMeal = async (req, res) => {
  const userId = req.user.id
  const { recipe_id, date, meal_type } = req.body
  const result = await pool.query(`
    INSERT INTO scheduled_meals (user_id, recipe_id, date, meal_type)
    VALUES ($1, $2, $3, $4)
    RETURNING *`, [userId, recipe_id, date, meal_type])
  return result.rows[0]
}

const deleteScheduledMeal = async (req, res) => {
  const { id } = req.params
  const userId = req.user.id
  const result = await pool.query(`
    DELETE FROM scheduled_meals
    WHERE id=$1 AND user_id=$2
    RETURNING *`, [id, userId])
  return result.rows[0]
}

export default {
  getScheduledMeals,
  createScheduledMeal,
  deleteScheduledMeal,
}
