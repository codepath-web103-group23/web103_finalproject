import { request } from './http.js'

const createFavorite = (recipe_id) =>
  request('/create/favorite', { method: 'POST', body: { recipe_id } })

const getFavorites = () => request('/favorites')

const deleteFavorite = (id) =>
  request(`/delete/favorite/${id}`, { method: 'DELETE' })

export default {
  createFavorite,
  getFavorites,
  deleteFavorite,
}
