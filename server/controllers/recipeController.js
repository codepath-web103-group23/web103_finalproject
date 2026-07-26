import model from '../models/recipeModel.js'

const createRecipe = async (req, res) => {
  try {
    const newRecipe = await model.createRecipe(req, res)
    res.status(201).json(newRecipe)

  } catch (err) {
    res.status(500).json({ message: err.message})
  }
}

export default {
  createRecipe,
}
