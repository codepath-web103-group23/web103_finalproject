const API_URL = "http://localhost:3000/api"

const addIngredient = async (options) => {
  try {
    const response = await fetch(`${API_URL}/create/ingredient`,options)
    window.location = '/kitchen'
    return data
  } catch (err) {
    console.error(err)
  }
}

export default {
  addIngredient,
}
