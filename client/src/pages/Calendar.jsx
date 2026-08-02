import { useState, useEffect } from 'react'
import api from '../services/api.jsx'
import scheduledMealsApi from '../services/scheduledMealsApi.js'

const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack']

const todayStr = () => new Date().toISOString().slice(0, 10)

const Calendar = () => {
  const [recipes, setRecipes] = useState([])
  const [meals, setMeals] = useState([])
  const [form, setForm] = useState({ recipe_id: '', date: todayStr(), meal_type: mealTypes[0] })

  useEffect(() => {
    const load = async () => {
      const recipeData = await api.getRecipes()
      setRecipes(recipeData || [])

      const mealData = await scheduledMealsApi.getScheduledMeals()
      setMeals(Array.isArray(mealData) ? mealData : [])
    }
    load()
  }, [])

  const refreshMeals = async () => {
    const mealData = await scheduledMealsApi.getScheduledMeals()
    setMeals(Array.isArray(mealData) ? mealData : [])
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSchedule = async (event) => {
    event.preventDefault()
    if (!form.recipe_id) return
    await scheduledMealsApi.createScheduledMeal(form)
    refreshMeals()
  }

  const handleDelete = async (id) => {
    await scheduledMealsApi.deleteScheduledMeal(id)
    setMeals((prev) => prev.filter((m) => m.id !== id))
  }

  const today = todayStr()
  const upcoming = meals.filter((m) => m.date.slice(0, 10) >= today)
  const history = meals.filter((m) => m.date.slice(0, 10) < today)

  return (
    <div>
      <h1 style={styles.title}>Meal Calendar</h1>

      <form style={styles.form} onSubmit={handleSchedule}>
        <select name="recipe_id" value={form.recipe_id} onChange={handleChange} style={styles.input}>
          <option value="">Select a recipe</option>
          {recipes.map((r) => (
            <option key={r.id} value={r.id}>{r.title}</option>
          ))}
        </select>
        <input type="date" name="date" value={form.date} onChange={handleChange} style={styles.input} />
        <select name="meal_type" value={form.meal_type} onChange={handleChange} style={styles.input}>
          {mealTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <button type="submit" style={styles.btn}>Schedule</button>
      </form>

      <h2 style={styles.sectionTitle}>Upcoming</h2>
      <ul style={styles.list}>
        {upcoming.map((m) => (
          <li key={m.id} style={styles.item}>
            {m.date.slice(0, 10)} — {m.meal_type} — {m.title}
            <button style={styles.deleteBtn} onClick={() => handleDelete(m.id)}>Remove</button>
          </li>
        ))}
      </ul>

      <h2 style={styles.sectionTitle}>History</h2>
      <ul style={styles.list}>
        {history.map((m) => (
          <li key={m.id} style={styles.item}>
            {m.date.slice(0, 10)} — {m.meal_type} — {m.title}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Calendar

const styles = {
  title: {
    marginLeft: '10px',
  },
  sectionTitle: {
    marginLeft: '10px',
    marginTop: '30px',
  },
  form: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    padding: '10px',
  },
  input: {
    height: '35px',
    borderRadius: '5px',
  },
  btn: {
    cursor: 'pointer',
    height: '35px',
    border: 'solid black',
    borderWidth: '1px',
    borderRadius: '5px',
    padding: '0 15px',
  },
  list: {
    listStyle: 'none',
    padding: '10px',
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    border: 'solid black',
    borderWidth: '1px',
    borderRadius: '10px',
    padding: '10px',
    marginBottom: '10px',
    maxWidth: '500px',
  },
  deleteBtn: {
    cursor: 'pointer',
  },
}
