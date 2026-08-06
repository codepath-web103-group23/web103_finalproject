import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api.jsx'
import Loading from '../components/Loading.jsx'
import Modal from '../components/Modal.jsx'
import { useToast } from '../components/Toast.jsx'
import { button, card, colors, font, heading, space } from '../styles/theme.js'

const Admin = () => {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // The recipe queued for deletion — deleting is destructive, so it goes
  // through a confirm dialog rather than firing straight off the button.
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await api.getRecipes()
        setRecipes(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      // Was a raw fetch() in the component — the only place that bypassed the
      // services layer.
      await api.deleteRecipe(pendingDelete.id)
      setRecipes((prev) => prev.filter((r) => r.id !== pendingDelete.id))
      toast.success(`"${pendingDelete.title}" deleted`)
      setPendingDelete(null)
    } catch (err) {
      toast.error("Couldn't delete that recipe.")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Admin</h1>
          <p style={styles.subtitle}>
            {loading ? 'Loading recipes…' : `${recipes.length} recipes in the catalog`}
          </p>
        </div>
        <button
          type="button"
          className="btn"
          style={styles.primaryBtn}
          onClick={() => navigate('/addRecipe')}
        >
          Add recipe
        </button>
      </header>

      {loading && <Loading label="Loading recipes…" size="lg" />}

      {!loading && error && (
        <div style={styles.errorBox} role="alert">{error}</div>
      )}

      {!loading && !error && recipes.length === 0 && (
        <div style={styles.empty}>
          <p style={styles.emptyTitle}>No recipes yet</p>
          <p style={styles.emptyText}>Add the first one to get started.</p>
        </div>
      )}

      {!loading && !error && recipes.length > 0 && (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>Avg rating</th>
                <th style={{ ...styles.th, ...styles.actionsCol }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map((r) => {
                const rating = r.avg_rating == null ? null : Number(r.avg_rating)
                return (
                  <tr key={r.id}>
                    <td style={{ ...styles.cell, ...styles.nameCell }}>{r.title}</td>
                    <td style={styles.cell}>
                      {rating != null && !Number.isNaN(rating) ? rating.toFixed(1) : '—'}
                    </td>
                    <td style={{ ...styles.cell, ...styles.actionsCol }}>
                      <div style={styles.btnBox}>
                        <button
                          type="button"
                          className="btn"
                          style={styles.rowBtn}
                          onClick={() => navigate(`/edit/recipe/${r.id}`)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn"
                          style={styles.rowBtnDanger}
                          onClick={() => setPendingDelete(r)}
                        >
                          Delete
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

      {pendingDelete && (
        <Modal
          title="Delete recipe?"
          onClose={() => !deleting && setPendingDelete(null)}
          footer={
            <>
              <button
                type="button"
                className="btn"
                style={styles.secondaryBtn}
                onClick={() => setPendingDelete(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn"
                style={styles.confirmDeleteBtn}
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Delete recipe'}
              </button>
            </>
          }
        >
          <p style={styles.confirmText}>
            <strong>{pendingDelete.title}</strong> will be removed for everyone. This can’t be
            undone.
          </p>
        </Modal>
      )}
    </div>
  )
}

export default Admin

const styles = {
  header: {
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
  primaryBtn: {
    ...button.primary,
  },
  secondaryBtn: {
    ...button.secondary,
  },
  confirmDeleteBtn: {
    ...button.primary,
  },
  confirmText: {
    margin: 0,
    fontSize: font.size.sm,
    lineHeight: 1.6,
  },
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
    padding: space.md,
    borderBottom: `1px solid ${colors.border}`,
    verticalAlign: 'middle',
  },
  nameCell: {
    fontWeight: font.weight.semibold,
  },
  actionsCol: {
    textAlign: 'right',
    whiteSpace: 'nowrap',
  },
  btnBox: {
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
    margin: 0,
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
