import { request } from './http.js'

const getScheduledMeals = () => request('/scheduled-meals')

const createScheduledMeal = (meal) =>
  request('/create/scheduled-meal', { method: 'POST', body: meal })

const deleteScheduledMeal = (id) =>
  request(`/delete/scheduled-meal/${id}`, { method: 'DELETE' })

export default {
  getScheduledMeals,
  createScheduledMeal,
  deleteScheduledMeal,
}
