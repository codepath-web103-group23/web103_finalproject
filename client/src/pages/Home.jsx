import { useEffect, useMemo, useState } from 'react'
import Card from '../components/Card.jsx'
import Search from '../components/SearchBar.jsx'
import api from "../services/api.jsx"
import favoritesApi from '../services/favoritesApi.js'
import Loading from '../components/Loading.jsx'
import { useToast } from '../components/Toast.jsx'
import { button, colors, font, heading, input, radius, space } from '../styles/theme.js'

const Home = ({ user }) => {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [favIds, setFavIds] = useState([])
  const toast = useToast()

  // filter / sort controls
  const [query, setQuery] = useState("")
  const [minRating, setMinRating] = useState("all")
  const [sortOrder, setSortOrder] = useState("newest")

  const loggedIn = !!user?.id

  useEffect(() => {
    const loadRecipes = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await api.getRecipes()
        setRecipes(Array.isArray(data) ? data : [])

        // Favorites are a per-user endpoint — asking as a guest just 401s.
        if (loggedIn) {
          const favs = await favoritesApi.getFavorites()
          setFavIds(Array.isArray(favs) ? favs.map(f => f.recipe_id) : [])
        } else {
          setFavIds([])
        }
      } catch (err) {
        setError("We couldn't load recipes. Check your connection and try again.")
      } finally {
        setLoading(false)
      }
    }
    loadRecipes()
  }, [loggedIn])

  const toggleFavorite = async (recipeId, isFav) => {
    // Optimistic: flip the heart now, roll back if the request fails.
    setFavIds(prev =>
      isFav ? prev.filter(x => x !== recipeId) : [...prev, recipeId]
    )
    try {
      if (isFav) {
        await favoritesApi.deleteFavorite(recipeId)
        toast.success('Removed from favorites')
      } else {
        await favoritesApi.createFavorite(recipeId)
        toast.success('Saved to favorites')
      }
    } catch (err) {
      setFavIds(prev =>
        isFav ? [...prev, recipeId] : prev.filter(x => x !== recipeId)
      )
      toast.error("Couldn't update your favorites. Please try again.")
    }
  }

  // Derive the visible list from `recipes` + the controls. We never mutate
  // `recipes` itself, so clearing a filter always brings every recipe back.
  const visibleRecipes = useMemo(() => {
    const search = query.trim().toLowerCase()

    const filtered = recipes.filter((r) => {
      const matchesSearch =
        search === "" || (r.title ?? "").toLowerCase().includes(search)

      // pg returns NUMERIC columns as strings, so coerce before comparing
      const matchesRating =
        minRating === "all" || Number(r.avg_rating ?? 0) >= Number(minRating)

      return matchesSearch && matchesRating
    })

    // The recipes table has no date column, so `id` (SERIAL) stands in for
    // insertion order: a higher id was added later.
    return [...filtered].sort((a, b) =>
      sortOrder === "newest" ? b.id - a.id : a.id - b.id
    )
  }, [recipes, query, minRating, sortOrder])

  const filtersActive = query.trim() !== "" || minRating !== "all"

  const clearFilters = () => {
    setQuery("")
    setMinRating("all")
  }

  return (
    <div>
      <header style={styles.header}>
        <h1 style={styles.title}>Browse recipes</h1>
        <p style={styles.subtitle}>
          {loading
            ? 'Finding recipes…'
            : `${visibleRecipes.length} ${visibleRecipes.length === 1 ? 'recipe' : 'recipes'}`}
          {!loading && filtersActive && ` of ${recipes.length}`}
        </p>
      </header>

      <div style={styles.filterBox}>
        <Search
          value={query}
          onChange={setQuery}
          placeholder="Search recipes..."
        />

        <div style={styles.dropdownBox}>
          <div style={styles.dropdown}>
            <label style={styles.label} htmlFor="rating-filter">Min rating</label>
            <select
              id="rating-filter"
              className="input"
              style={styles.select}
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
            >
              <option value="all">All ratings</option>
              <option value="1">1+ stars</option>
              <option value="2">2+ stars</option>
              <option value="3">3+ stars</option>
              <option value="4">4+ stars</option>
            </select>
          </div>
          <div style={styles.dropdown}>
            <label style={styles.label} htmlFor="date-sort">Sort by</label>
            <select
              id="date-sort"
              className="input"
              style={styles.select}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>
      </div>

      {loading && <Loading label="Loading recipes…" size="lg" />}

      {!loading && error && (
        <div style={styles.errorBox} role="alert">
          <p style={styles.errorText}>{error}</p>
          <button
            type="button"
            className="btn"
            style={styles.retryBtn}
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && visibleRecipes.length > 0 && (
        <div style={styles.feed}>
          {visibleRecipes.map((r) => (
            <Card
              key={r.id}
              id={r.id}
              title={r.title}
              image_url={r.image_url}
              avg_rating={r.avg_rating}
              isFavorited={favIds.includes(r.id)}
              onToggle={toggleFavorite}
              loggedIn={loggedIn}
            />
          ))}
        </div>
      )}

      {!loading && !error && visibleRecipes.length === 0 && (
        <div style={styles.empty}>
          <p style={styles.emptyTitle}>
            {recipes.length === 0
              ? 'No recipes yet'
              : 'No recipes match your filters'}
          </p>
          <p style={styles.emptyText}>
            {recipes.length === 0
              ? 'Once recipes are added they’ll show up here.'
              : 'Try a different search term or lower the minimum rating.'}
          </p>
          {filtersActive && recipes.length > 0 && (
            <button type="button" className="btn" style={styles.clearBtn} onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default Home;

const styles = {
  header: {
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
  filterBox: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: space.md,
    padding: space.md,
    marginBottom: space.lg,
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.lg,
  },
  dropdownBox: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: space.md,
  },
  dropdown: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: font.size.xs,
    fontWeight: font.weight.semibold,
    color: colors.textMuted,
    marginBottom: space.xs,
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  select: {
    ...input,
    width: 'auto',
    minWidth: '150px',
    cursor: 'pointer',
  },
  // Fluid grid: cards size themselves to the row instead of every card being a
  // hard 240px, so there's no ragged gap at the right edge. The 320px floor
  // keeps them substantial now that the page runs full width.
  feed: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: space.lg,
    alignItems: 'stretch',
  },
  empty: {
    textAlign: 'center',
    padding: `${space.xxl} ${space.md}`,
    background: colors.surface,
    border: `1px dashed ${colors.borderStrong}`,
    borderRadius: radius.lg,
  },
  emptyTitle: {
    margin: `0 0 ${space.xs}`,
    fontSize: font.size.lg,
    fontWeight: font.weight.semibold,
    color: colors.text,
  },
  emptyText: {
    margin: `0 0 ${space.md}`,
    fontSize: font.size.sm,
    color: colors.textMuted,
  },
  clearBtn: {
    ...button.secondary,
    ...button.small,
  },
  errorBox: {
    textAlign: 'center',
    padding: `${space.xl} ${space.md}`,
    background: colors.surfaceAlt,
    border: `2px solid ${colors.ink}`,
    borderRadius: radius.lg,
  },
  errorText: {
    margin: `0 0 ${space.md}`,
    color: colors.text,
    fontSize: font.size.sm,
  },
  retryBtn: {
    ...button.secondary,
    ...button.small,
  },
}
