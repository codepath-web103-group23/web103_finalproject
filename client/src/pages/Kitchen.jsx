import api from '../services/api.jsx'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Loading from '../components/Loading.jsx'
import { useToast } from '../components/Toast.jsx'
import { button, card, colors, font, heading, radius, space } from '../styles/theme.js'

const Kitchen = () => {
  const [ingredients, setIngredients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // ids currently being removed — keeps the row's button disabled so a slow
  // delete can't be fired twice.
  const [removing, setRemoving] = useState([])

  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await api.getKitchen()
        setIngredients(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleRemove = async (ingredientId, name) => {
    setRemoving((prev) => [...prev, ingredientId])
    try {
      await api.removeFromKitchen(ingredientId)
      setIngredients((prev) => prev.filter((i) => i.ingredient_id !== ingredientId))
      toast.success(`${name} removed from your kitchen`)
    } catch (err) {
      toast.error("Couldn't remove that ingredient.")
    } finally {
      setRemoving((prev) => prev.filter((x) => x !== ingredientId))
    }
  }

  return (
    <div>
      <header style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>My kitchen</h1>
          <p style={styles.subtitle}>
            {loading
              ? 'Loading your inventory…'
              : `${ingredients.length} ${ingredients.length === 1 ? 'ingredient' : 'ingredients'} on hand`}
          </p>
        </div>
        <div style={styles.headerActions}>
          <button
            type="button"
            className="btn"
            style={styles.secondaryBtn}
            onClick={() => navigate('/addRecipe')}
          >
            Add recipe
          </button>
          <button
            type="button"
            className="btn"
            style={styles.primaryBtn}
            onClick={() => navigate('/addIngredient')}
          >
            Add ingredient
          </button>
        </div>
      </header>

      {loading && <Loading label="Loading your kitchen…" size="lg" />}

      {!loading && error && (
        <div style={styles.errorBox} role="alert">
          {error}
        </div>
      )}

      {!loading && !error && ingredients.length === 0 && (
        <div style={styles.empty}>
          <p style={styles.emptyTitle}>Your kitchen is empty</p>
          <p style={styles.emptyText}>
            This list is yours alone — the shared ingredient catalog can be full while your
            kitchen is still empty. Pick what you actually have on hand and recipes can match
            against it.
          </p>
          <button
            type="button"
            className="btn"
            style={styles.primaryBtn}
            onClick={() => navigate('/addIngredient')}
          >
            Stock your kitchen
          </button>
        </div>
      )}

      {!loading && !error && ingredients.length > 0 && (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Ingredient</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Calories</th>
                <th style={styles.th}>Dietary facts</th>
                <th style={styles.th}>Quantity</th>
                <th style={{ ...styles.th, ...styles.actionsCol }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((ingredient) => {
                const isRemoving = removing.includes(ingredient.ingredient_id)
                return (
                  <tr key={ingredient.id}>
                    <td style={{ ...styles.cell, ...styles.nameCell }}>{ingredient.name}</td>
                    <td style={styles.cell}>{ingredient.category || '—'}</td>
                    <td style={styles.cell}>{ingredient.calories ?? '—'}</td>
                    <td style={styles.cell}>{ingredient.dietary_tags || '—'}</td>
                    <td style={styles.cell}>
                      {ingredient.quantity
                        ? `${ingredient.quantity} ${ingredient.unit || ''}`.trim()
                        : '—'}
                    </td>
                    <td style={{ ...styles.cell, ...styles.actionsCol }}>
                      <div style={styles.rowActions}>
                        <button
                          type="button"
                          className="btn"
                          style={styles.rowBtn}
                          disabled={isRemoving}
                          onClick={() => navigate(`/editIngredient/${ingredient.ingredient_id}`)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn"
                          style={styles.rowBtnDanger}
                          disabled={isRemoving}
                          onClick={() => handleRemove(ingredient.ingredient_id, ingredient.name)}
                        >
                          {isRemoving ? 'Removing…' : 'Remove'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Kitchen

const styles = {
  header: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: space.md,
    marginBottom: space.lg,
  },
  pageTitle: {
    ...heading.h1,
  },
  subtitle: {
    margin: 0,
    fontSize: font.size.sm,
    color: colors.textMuted,
  },
  headerActions: {
    display: 'flex',
    gap: space.sm,
    flexWrap: 'wrap',
  },
  primaryBtn: {
    ...button.primary,
  },
  secondaryBtn: {
    ...button.secondary,
  },
  // Wide tables scroll inside their own box rather than pushing the page out.
  tableWrap: {
    ...card,
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: font.size.sm,
  },
  th: {
    padding: `${space.sm} ${space.md}`,
    textAlign: 'left',
    fontSize: font.size.xs,
    fontWeight: font.weight.bold,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: colors.textMuted,
    background: colors.surfaceAlt,
    borderBottom: `1px solid ${colors.border}`,
    whiteSpace: 'nowrap',
  },
  cell: {
    padding: `${space.md}`,
    borderBottom: `1px solid ${colors.border}`,
    color: colors.text,
    verticalAlign: 'middle',
  },
  nameCell: {
    fontWeight: font.weight.semibold,
  },
  actionsCol: {
    textAlign: 'right',
    whiteSpace: 'nowrap',
  },
  rowActions: {
    display: 'inline-flex',
    gap: space.xs,
  },
  rowBtn: {
    ...button.secondary,
    ...button.small,
  },
  rowBtnDanger: {
    ...button.danger,
    ...button.small,
  },
  empty: {
    ...card,
    textAlign: 'center',
    padding: `${space.xxl} ${space.md}`,
    borderStyle: 'dashed',
  },
  emptyTitle: {
    margin: `0 0 ${space.xs}`,
    fontSize: font.size.lg,
    fontWeight: font.weight.semibold,
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
