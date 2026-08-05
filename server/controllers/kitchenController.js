import model from '../models/kitchenModel.js'

const getKitchen = async (req, res) => {
  try {
    const results = await model.getKitchen(req, res)
    res.status(200).json(results)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const addToKitchen = async (req, res) => {
  try {
    const result = await model.addToKitchen(req, res)
    res.status(201).json(result)
  } catch (err) {
    // The model tags expected failures (duplicate, missing ingredient) with a
    // status so the client can show the real reason instead of a blanket 500.
    res.status(err.status || 500).json({ message: err.message })
  }
}

const removeFromKitchen = async (req, res) => {
  try {
    const result = await model.removeFromKitchen(req, res)
    res.status(200).json(result)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const cookRecipe = async (req, res) => {
  try {
    const result = await model.cookRecipe(req, res)
    res.status(200).json(result)
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message })
  }
}

export default {
  getKitchen,
  addToKitchen,
  removeFromKitchen,
  cookRecipe,
}
