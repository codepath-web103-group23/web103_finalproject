import { pool } from '../db/dbpool.js'

const createRecipe = async (req, res) => {
  const { id, title, description, instructions, image_url, avg_rating } = req.body 

  const result = await pool.query(
    `
      INSERT INTO recipes
      (title, description, instructions, image_url, avg_rating)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
    [title, description, instructions, image_url, avg_rating]
  )
  return result.rows[0]
}

export default {
  createRecipe,
}
