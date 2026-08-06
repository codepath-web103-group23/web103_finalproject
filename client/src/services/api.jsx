import { request } from './http.js'

// Every call throws an ApiError on a non-2xx response instead of swallowing it,
// so pages can render an error state or fire a toast. Navigation used to happen
// inside these functions (`window.location = '/kitchen'`), which forced a full
// page reload and destroyed any feedback the page had just shown — callers now
// navigate themselves with `useNavigate`.

const addIngredient = (ingredient) =>
  request('/create/ingredient', { method: 'POST', body: ingredient })

const getIngredients = () => request('/ingredients')

const getIngredient = (id) => request(`/ingredient/${id}`)

const updateIngredient = (id, ingredient) =>
  request(`/ingredient/${id}`, { method: 'PATCH', body: ingredient })

const getKitchen = () => request('/kitchen')

const addToKitchen = (ingredient) =>
  request('/create/kitchen-item', { method: 'POST', body: ingredient })

const removeFromKitchen = (ingredientId) =>
  request(`/delete/kitchen-item/${ingredientId}`, { method: 'DELETE' })

// Consumes a recipe's ingredients out of the signed-in user's kitchen.
const cookRecipe = (recipeId) =>
  request(`/kitchen/cook/${recipeId}`, { method: 'POST' })

const getRecipes = () => request('/recipes')

const getRecipe = (id) => request(`/recipe/${id}`)

const createRecipe = (payload) =>
  request('/create/recipe', { method: 'POST', body: payload })

const patchRecipe = (id, recipe) =>
  request(`/patch/recipe/${id}`, { method: 'PATCH', body: recipe })

const deleteRecipe = (id) =>
  request(`/delete/recipe/${id}`, { method: 'DELETE' })

const getRecipeIngredients = (id) => request(`/recipe/${id}/ingredients`)

const patchRecipeIngredients = (id, ingredients) =>
  request(`/patch/recipe/${id}/ingredients`, {
    method: 'PATCH',
    body: { ingredients },
  })

const createRecipeIngredient = (recipeIngredient) =>
  request('/create/recipe/ingredient', {
    method: 'POST',
    body: recipeIngredient,
  })

export default {
  addIngredient,
  getIngredients,
  getIngredient,
  updateIngredient,
  createRecipeIngredient,

  getKitchen,
  addToKitchen,
  removeFromKitchen,
  cookRecipe,

  getRecipes,
  getRecipe,
  getRecipeIngredients,
  patchRecipeIngredients,
  createRecipe,
  patchRecipe,
  deleteRecipe,
}
