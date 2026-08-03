const API_URL = `${import.meta.env.VITE_API_URL}/api`

const addIngredient = async (options) => {
  try {
    const response = await fetch(`${API_URL}/create/ingredient`,options)
    window.location = '/kitchen'
  } catch (err) {
    console.error(err)
  }
}

const editIngredient = async (id, options) => {
  const response = await fetch(`${API_URL}/edit/ingredient`, options)
  const data = await response.json()
  window.location = '/kitchen'
  return data
}

const getIngredients = async () => {
  try {
    const response = await fetch(`${API_URL}/ingredients`)
    const data = await response.json()
    return data
  } catch(err) {
    console.error(err)
  }
}

const getIngredient = async (id) => {
  try {
    const response = await fetch(`${API_URL}/ingredient/${id}`)
    const data = await response.json()
    return data
  } catch(err) {
    console.error(err)
  }
}

const updateIngredient = async (id, options) => {
  try {
    const response = await fetch(`${API_URL}/ingredient/${id}`, options)
    const data = await response.json()
    window.location = '/kitchen'
    return data
  } catch (err) {
    console.error(err)
  }
}

const getKitchen = async () => {
  try {
    const response = await fetch(`${API_URL}/kitchen`, { credentials: 'include' })
    const data = await response.json()
    return data
  } catch (err) {
    console.error(err)
  }
}

const addToKitchen = async (ingredient) => {
  try {
    const response = await fetch(`${API_URL}/create/kitchen-item`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(ingredient)
    })
    window.location = '/kitchen'
    return await response.json()
  } catch (err) {
    console.error(err)
  }
}

const removeFromKitchen = async (ingredientId) => {
  try {
    const response = await fetch(`${API_URL}/delete/kitchen-item/${ingredientId}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    return await response.json()
  } catch (err) {
    console.error(err)
  }
}

const getRecipes = async () => {
  try {
    const response = await fetch(`${API_URL}/recipes`)
    const data = await response.json()
    return data
  } catch (err) {
    console.log(err)
  }
}

const getRecipe = async (id) => {
  try {
    const response = await fetch(`${API_URL}/recipe/${id}`)
    const data = await response.json()
    return data
  } catch (err) {
    console.log(err)
  }
}

export default {
  addIngredient,
  getIngredients,
  getIngredient,
  editIngredient,
  updateIngredient,

  getKitchen,
  addToKitchen,
  removeFromKitchen,

  getRecipes,
  getRecipe
}
