import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import EditPreferences from './EditPreferences.jsx'
import preferenceApi from '../services/preferenceApi.js'
import favoritesApi from '../services/favoritesApi.js'
import api from "../services/api.jsx"
import ProfileIngrCard from '../components/ProfileIngrCard.jsx'
import Loading from '../components/Loading.jsx'
import { useToast } from '../components/Toast.jsx'
import { button, card, colors, font, heading, radius, space } from '../styles/theme.js'

const Profile = ({ user }) => {
  const [editBox, setEditBox] = useState(false)
  const [preferences, setPreferences] = useState([])
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const toast = useToast()

  const toggle = () => setEditBox((open) => !open)

  const handleInsertRefresh = (data) => {
    setPreferences(prev => [...prev, data])
  }

  const handleDeleteRefresh = (id, type) => {
    if (type === 'fav') {
      setRecipes(prev => prev.filter(recipe => recipe.id !== id))
    }
    if (type === 'pref') {
      setPreferences(prev => prev.filter(preference => preference.id !== id))
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Preferences and favorites are unrelated, so fetch them together —
        // favorites used to sit waiting on the preferences response.
        const [dataP, dataF] = await Promise.all([
          preferenceApi.getPreferences(),
          favoritesApi.getFavorites(),
        ])

        setPreferences(Array.isArray(dataP) ? dataP : [])

        const favorites = Array.isArray(dataF) ? dataF : []
        const recipeData = await Promise.all(
          favorites.map((favorite) => api.getRecipe(favorite.recipe_id))
        )

        setRecipes(recipeData.filter(Boolean))
      } catch (err) {
        // A toast alone left the page looking like an empty profile rather
        // than a failed one.
        setError(err.message)
        toast.error("Couldn't load your profile.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      {editBox && (
        <EditPreferences
          delRefresh={handleDeleteRefresh}
          inRefresh={handleInsertRefresh}
          toggle={toggle}
        />
      )}

      <header style={styles.info}>
        {user.avatarurl ? (
          <img src={user.avatarurl} alt="" style={styles.infoImg} />
        ) : (
          <span style={{ ...styles.infoImg, ...styles.avatarFallback }}>
            {(user.username ?? '?').charAt(0).toUpperCase()}
          </span>
        )}
        <div>
          <h1 style={styles.username}>{user.username}</h1>
          {user.is_admin && <span style={styles.roleChip}>Admin</span>}
        </div>
      </header>

      {error && (
        <div style={styles.errorBox} role="alert">
          We couldn’t load your profile. {error}
        </div>
      )}

      <section style={styles.panel}>
        <div style={styles.panelHeader}>
          <h2 style={styles.panelTitle}>Dietary preferences</h2>
          <button type="button" onClick={toggle} className="btn" style={styles.secondaryBtn}>
            Edit preferences
          </button>
        </div>

        {loading ? (
          <Loading label="Loading preferences…" />
        ) : preferences.length === 0 ? (
          <p style={styles.empty}>No preferences set yet.</p>
        ) : (
          <div style={styles.prefs}>
            {preferences.map((p, index) => (
              <span key={p.id ?? index} style={styles.itemPref}>{p.preference}</span>
            ))}
          </div>
        )}
      </section>

      <Link to="/kitchen" style={styles.kitchenBox} className="card">
        <div>
          <h2 style={styles.panelTitle}>My kitchen</h2>
          <p style={styles.kitchenHint}>See and manage the ingredients you have on hand.</p>
        </div>
        <span style={styles.kitchenLink} aria-hidden="true">→</span>
      </Link>

      <section style={styles.favSection}>
        <h2 style={styles.panelTitle}>Favorite recipes</h2>

        {loading ? (
          <Loading label="Loading favorites…" />
        ) : recipes.length === 0 ? (
          <div style={styles.emptyBox}>
            <p style={styles.emptyTitle}>No favorites yet</p>
            <p style={styles.emptyText}>Tap the heart on a recipe to save it here.</p>
            <Link to="/" className="btn" style={styles.secondaryBtn}>Browse recipes</Link>
          </div>
        ) : (
          <div style={styles.favBox}>
            {recipes.map((r) => (
              <ProfileIngrCard
                key={r.id}
                id={r.id}
                title={r.title}
                image_url={r.image_url}
                avg_rating={r.avg_rating}
                refresh={handleDeleteRefresh}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Profile

const styles = {
  info: {
    display: 'flex',
    alignItems: 'center',
    gap: space.lg,
    marginBottom: space.xl,
  },
  infoImg: {
    display: 'block',
    width: '84px',
    height: '84px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: `1px solid ${colors.border}`,
    background: colors.surfaceAlt,
    flexShrink: 0,
  },
  avatarFallback: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: font.size.xxl,
    fontWeight: font.weight.bold,
    color: colors.textMuted,
  },
  username: {
    ...heading.h1,
    margin: 0,
  },
  roleChip: {
    display: 'inline-block',
    marginTop: space.xs,
    padding: '2px 8px',
    fontSize: font.size.xs,
    fontWeight: font.weight.semibold,
    color: '#ffffff',
    background: colors.ink,
    borderRadius: radius.sm,
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  panel: {
    ...card,
    padding: space.lg,
    marginBottom: space.lg,
  },
  panelHeader: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    marginBottom: space.md,
  },
  panelTitle: {
    ...heading.h2,
    margin: 0,
  },
  secondaryBtn: {
    ...button.secondary,
    ...button.small,
  },
  prefs: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  itemPref: {
    display: 'inline-block',
    padding: `${space.xs} ${space.md}`,
    background: colors.surfaceAlt,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.pill,
    fontSize: font.size.sm,
    fontWeight: font.weight.medium,
  },
  kitchenBox: {
    ...card,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    padding: space.lg,
    marginBottom: space.xl,
    textDecoration: 'none',
    color: 'inherit',
  },
  kitchenHint: {
    margin: `${space.xs} 0 0`,
    fontSize: font.size.sm,
    color: colors.textMuted,
  },
  kitchenLink: {
    fontSize: font.size.xl,
    color: colors.textMuted,
  },
  favSection: {
    marginBottom: space.xl,
  },
  favBox: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: space.lg,
    marginTop: space.md,
    alignItems: 'stretch',
  },
  empty: {
    margin: 0,
    fontSize: font.size.sm,
    color: colors.textFaint,
  },
  emptyBox: {
    ...card,
    marginTop: space.md,
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
    marginBottom: space.lg,
    border: `2px solid ${colors.ink}`,
    background: colors.surfaceAlt,
    fontSize: font.size.sm,
  },
}
