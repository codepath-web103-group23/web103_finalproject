const API_URL = `${import.meta.env.VITE_API_URL}/api`

const getScheduledMeals = async () => {
  const response = await fetch(`${API_URL}/scheduled-meals`, { credentials: 'include' })
  return await response.json()
}

const createScheduledMeal = async (meal) => {
  const response = await fetch(`${API_URL}/create/scheduled-meal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(meal)
  })
  return await response.json()
}

const deleteScheduledMeal = async (id) => {
  const response = await fetch(`${API_URL}/delete/scheduled-meal/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  })
  return await response.json()
}

export default {
  getScheduledMeals,
  createScheduledMeal,
  deleteScheduledMeal,
}
