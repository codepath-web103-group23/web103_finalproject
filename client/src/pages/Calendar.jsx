import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api.jsx'
import scheduledMealsApi from '../services/scheduledMealsApi.js'
import Loading from '../components/Loading.jsx'
import Modal from '../components/Modal.jsx'
import { useToast } from '../components/Toast.jsx'
import { button, card, colors, font, heading, input, radius, space } from '../styles/theme.js'

const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack']

// Format in local time. `toISOString()` converts to UTC first, which pushed
// evening dates onto the next day for anyone west of Greenwich.
const toDateStr = (date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

const isSameDay = (a, b) => toDateStr(a) === toDateStr(b)

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  // The month on screen, tracked separately so paging months doesn't move the
  // user's selected day out from under them.
  const [viewDate, setViewDate] = useState(new Date())
  const [recipes, setRecipes] = useState([])
  const [meals, setMeals] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ recipe_id: '', meal_type: mealTypes[0] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const toast = useToast()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const recipeData = await api.getRecipes()
        setRecipes(Array.isArray(recipeData) ? recipeData : [])

        const mealData = await scheduledMealsApi.getScheduledMeals()
        setMeals(Array.isArray(mealData) ? mealData : [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const refreshMeals = async () => {
    const mealData = await scheduledMealsApi.getScheduledMeals()
    setMeals(Array.isArray(mealData) ? mealData : [])
  }

  const shiftMonth = (amount) => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + amount, 1))
  }

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7 // 0 = Monday

  const mealsByDate = meals.reduce((acc, m) => {
    const key = m.date.slice(0, 10)
    acc[key] = acc[key] || []
    acc[key].push(m)
    return acc
  }, {})

  const selectedDateStr = toDateStr(selectedDate)
  const selectedDayMeals = mealsByDate[selectedDateStr] || []
  const today = new Date()

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setFormError(null)
  }

  const openForm = () => {
    setForm({ recipe_id: '', meal_type: mealTypes[0] })
    setFormError(null)
    setShowForm(true)
  }

  const handleSchedule = async (event) => {
    event.preventDefault()

    if (!form.recipe_id) {
      setFormError('Pick a recipe to schedule.')
      return
    }

    setSaving(true)
    try {
      await scheduledMealsApi.createScheduledMeal({ ...form, date: selectedDateStr })
      await refreshMeals()
      setShowForm(false)
      setForm({ recipe_id: '', meal_type: mealTypes[0] })
      toast.success(`Meal scheduled for ${selectedDate.toLocaleDateString()}`)
    } catch (err) {
      setFormError(err.message)
      toast.error("Couldn't schedule that meal.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await scheduledMealsApi.deleteScheduledMeal(id)
      setMeals((prev) => prev.filter((m) => m.id !== id))
      toast.success('Meal removed')
    } catch (err) {
      toast.error("Couldn't remove that meal.")
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return <Loading label="Loading your calendar…" size="lg" />
  }

  if (error) {
    return (
      <div style={styles.errorBox} role="alert">
        {error}
      </div>
    )
  }

  return (
    <div>
      <header style={styles.topBox}>
        <div>
          <h1 style={styles.title}>Meal calendar</h1>
          <p style={styles.subtitle}>Plan what you’re cooking and when.</p>
        </div>

        <div style={styles.topActions}>
          <div style={styles.monthNav}>
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              style={styles.navBtn}
              className="btn"
              aria-label="Previous month"
            >
              ‹
            </button>
            <span style={styles.monthLabel}>
              {viewDate.toLocaleString('default', { month: 'long' })} {year}
            </span>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              style={styles.navBtn}
              className="btn"
              aria-label="Next month"
            >
              ›
            </button>
          </div>
          <button type="button" style={styles.scheduleBtn} className="btn" onClick={openForm}>
            Schedule meal
          </button>
        </div>
      </header>

      {showForm && (
        <Modal title={`Schedule a meal — ${selectedDate.toLocaleDateString()}`} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSchedule} style={styles.form} noValidate>
            <div style={styles.formField}>
              <label htmlFor="recipe_id" style={styles.formLabel}>Recipe</label>
              <select
                id="recipe_id"
                name="recipe_id"
                value={form.recipe_id}
                onChange={handleChange}
                style={styles.input}
                className="input"
                disabled={saving}
              >
                <option value="">Select a recipe…</option>
                {recipes.map((r) => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
            </div>

            <div style={styles.formField}>
              <label htmlFor="meal_type" style={styles.formLabel}>Meal</label>
              <select
                id="meal_type"
                name="meal_type"
                value={form.meal_type}
                onChange={handleChange}
                style={styles.input}
                className="input"
                disabled={saving}
              >
                {mealTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {formError && <p style={styles.formErrorText} role="alert">{formError}</p>}

            <div style={styles.formActions}>
              <button type="submit" style={styles.scheduleBtn} className="btn" disabled={saving}>
                {saving ? 'Scheduling…' : 'Schedule'}
              </button>
              <button
                type="button"
                style={styles.secondaryBtn}
                className="btn"
                onClick={() => setShowForm(false)}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      <div style={styles.calendarPanel}>
        <div style={styles.grid}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div key={d} style={styles.dow}>{d}</div>
          ))}

          {Array.from({ length: firstWeekday }, (_, i) => (
            <div key={`blank-${i}`} style={styles.dayBlank} />
          ))}

          {Array.from({ length: daysInMonth }, (_, i) => {
            const dayNum = i + 1
            const cellDate = new Date(year, month, dayNum)
            const cellDateStr = toDateStr(cellDate)
            const isSelected = cellDateStr === selectedDateStr
            const isToday = isSameDay(cellDate, today)
            const dayMeals = mealsByDate[cellDateStr] || []

            return (
              <button
                type="button"
                key={dayNum}
                style={{
                  ...styles.day,
                  ...(isToday ? styles.dayToday : null),
                  ...(isSelected ? styles.daySelected : null),
                }}
                // Selecting a day only selects it — it used to hard-navigate to
                // the first meal's recipe, which made picking a day impossible.
                onClick={() => setSelectedDate(cellDate)}
                aria-pressed={isSelected}
                aria-label={`${cellDate.toDateString()}, ${dayMeals.length} meals`}
              >
                <span style={styles.dayNum}>{dayNum}</span>
                {dayMeals.length > 0 && (
                  <span style={isSelected ? styles.mealCountSelected : styles.mealCount}>
                    {dayMeals.length} meal{dayMeals.length > 1 ? 's' : ''}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <section style={styles.selectedBox}>
        <h2 style={styles.selectedTitle}>{selectedDate.toDateString()}</h2>

        {selectedDayMeals.length === 0 ? (
          <div style={styles.empty}>
            <p style={styles.emptyText}>Nothing scheduled for this day.</p>
            <button type="button" style={styles.secondaryBtn} className="btn" onClick={openForm}>
              Schedule a meal
            </button>
          </div>
        ) : (
          <ul style={styles.list}>
            {selectedDayMeals.map((m) => (
              <li key={m.id} style={styles.item}>
                <div>
                  <span style={styles.mealType}>{m.meal_type}</span>
                  <Link to={`/recipe/${m.recipe_id}`} style={styles.mealTitle}>
                    {m.title}
                  </Link>
                </div>
                <button
                  type="button"
                  style={styles.deleteBtn}
                  className="btn"
                  onClick={() => handleDelete(m.id)}
                  disabled={deletingId === m.id}
                >
                  {deletingId === m.id ? 'Removing…' : 'Remove'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default Calendar

const styles = {
  topBox: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: space.md,
    marginBottom: space.lg,
  },
  title: {
    ...heading.h1,
  },
  subtitle: {
    margin: 0,
    fontSize: font.size.sm,
    color: colors.textMuted,
  },
  topActions: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: space.md,
  },
  monthNav: {
    display: 'flex',
    alignItems: 'center',
    gap: space.sm,
  },
  navBtn: {
    ...button.secondary,
    width: '38px',
    padding: 0,
    height: '38px',
    fontSize: font.size.lg,
  },
  monthLabel: {
    minWidth: '150px',
    textAlign: 'center',
    fontSize: font.size.md,
    fontWeight: font.weight.semibold,
  },
  scheduleBtn: {
    ...button.primary,
  },
  secondaryBtn: {
    ...button.secondary,
  },
  calendarPanel: {
    ...card,
    padding: space.md,
    marginBottom: space.xl,
    overflowX: 'auto',
  },
  // Equal fractions rather than a fixed 150px per column, so the month fits
  // whatever width the screen has.
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, minmax(74px, 1fr))',
    gap: space.xs,
    minWidth: '560px',
  },
  dow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.xs,
    fontSize: font.size.xs,
    fontWeight: font.weight.bold,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: colors.textMuted,
  },
  dayBlank: {
    minHeight: '84px',
  },
  day: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: space.xs,
    minHeight: '84px',
    padding: space.sm,
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.md,
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left',
  },
  dayToday: {
    borderColor: colors.borderStrong,
    borderWidth: '2px',
  },
  daySelected: {
    background: colors.ink,
    borderColor: colors.ink,
    color: '#ffffff',
  },
  dayNum: {
    fontSize: font.size.sm,
    fontWeight: font.weight.semibold,
  },
  mealCount: {
    fontSize: font.size.xs,
    color: colors.textMuted,
  },
  mealCountSelected: {
    fontSize: font.size.xs,
    color: '#ffffff',
    opacity: 0.85,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.md,
  },
  formField: {
    display: 'flex',
    flexDirection: 'column',
  },
  formLabel: {
    fontSize: font.size.sm,
    fontWeight: font.weight.semibold,
    marginBottom: space.xs,
  },
  input: {
    ...input,
    cursor: 'pointer',
  },
  formErrorText: {
    margin: 0,
    fontSize: font.size.xs,
    fontWeight: font.weight.semibold,
    color: colors.ink,
  },
  formActions: {
    display: 'flex',
    gap: space.sm,
    flexWrap: 'wrap',
  },
  selectedBox: {
    maxWidth: '760px',
  },
  selectedTitle: {
    ...heading.h2,
    marginBottom: space.md,
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: space.sm,
  },
  item: {
    ...card,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    padding: `${space.md} ${space.lg}`,
  },
  mealType: {
    display: 'block',
    fontSize: font.size.xs,
    fontWeight: font.weight.bold,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: colors.textMuted,
    marginBottom: '2px',
  },
  mealTitle: {
    fontSize: font.size.md,
    fontWeight: font.weight.semibold,
    color: colors.text,
    textDecoration: 'none',
  },
  deleteBtn: {
    ...button.danger,
    ...button.small,
  },
  empty: {
    ...card,
    textAlign: 'center',
    padding: `${space.xl} ${space.md}`,
    borderStyle: 'dashed',
  },
  emptyText: {
    margin: `0 0 ${space.md}`,
    fontSize: font.size.sm,
    color: colors.textMuted,
  },
  errorBox: {
    ...card,
    padding: space.lg,
    border: `2px solid ${colors.ink}`,
    background: colors.surfaceAlt,
    fontSize: font.size.sm,
  },
}
