import api from "../services/api.jsx"
import toSteps from "../utils/steps.js"
import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import Loading from '../components/Loading.jsx'
import { useToast } from '../components/Toast.jsx'
import { button, card, colors, font, heading, radius, space } from '../styles/theme.js'

// pg returns NUMERIC columns as strings ("2.00"), so trim the trailing zeros
const formatQuantity = (quantity) => {
  if (quantity === null || quantity === undefined) return ''
  return String(Number(quantity))
}

const Recipe = () => {
  const [recipe, setRecipe] = useState(null)
  const [ingredients, setIngredients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [imgFailed, setImgFailed] = useState(false)
  const params = useParams()
  const toast = useToast()

  useEffect(() => {
    const loadRecipe = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await api.getRecipe(params.id)
        setRecipe(data)

        const recipeIngredients = await api.getRecipeIngredients(params.id)
        setIngredients(Array.isArray(recipeIngredients) ? recipeIngredients : [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadRecipe()
  }, [params.id])

  const steps = toSteps(recipe?.instructions)

  const copyInstructions = async () => {
    // number the steps so they stay readable once pasted somewhere else
    const text = steps.map((step, index) => `${index + 1}. ${step}`).join('\n')

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error("Couldn't copy to your clipboard.")
    }
  }

  if (loading) {
    return <Loading label="Loading recipe…" size="lg" />
  }

  if (error || !recipe) {
    return (
      <div style={styles.errorBox} role="alert">
        <p style={styles.errorTitle}>We couldn’t load this recipe</p>
        <p style={styles.errorText}>{error ?? 'It may have been removed.'}</p>
        <Link to="/" className="btn" style={styles.secondaryBtn}>
          Back to recipes
        </Link>
      </div>
    )
  }

  const rating = recipe.avg_rating == null ? null : Number(recipe.avg_rating)
  const hasRating = rating != null && !Number.isNaN(rating)
  const showImage = recipe.image_url && !imgFailed

  return (
    <article>
      <Link to="/" style={styles.backLink} className="nav-link">
        ← All recipes
      </Link>

      {/* Hero: image and the recipe's identity side by side, stacking on
          narrow screens via flex-wrap. */}
      <header style={styles.hero}>
        <div style={styles.heroMedia}>
          {showImage ? (
            <img
              src={recipe.image_url}
              alt={recipe.title}
              style={styles.img}
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div style={styles.imgFallback} role="img" aria-label="No photo available">
              <span style={styles.fallbackMark} aria-hidden="true">🍽️</span>
              <span style={styles.fallbackText}>No photo yet</span>
            </div>
          )}
        </div>

        <div style={styles.heroBody}>
          <h1 style={styles.title}>{recipe.title}</h1>

          <div style={styles.metaRow}>
            {hasRating ? (
              <span style={styles.rating}>
                <span aria-hidden="true">★</span> {rating.toFixed(1)}
              </span>
            ) : (
              <span style={styles.metaMuted}>Not rated yet</span>
            )}
            <span style={styles.metaDot} aria-hidden="true">·</span>
            <span style={styles.metaMuted}>
              {ingredients.length} {ingredients.length === 1 ? 'ingredient' : 'ingredients'}
            </span>
            <span style={styles.metaDot} aria-hidden="true">·</span>
            <span style={styles.metaMuted}>
              {steps.length} {steps.length === 1 ? 'step' : 'steps'}
            </span>
          </div>

          {recipe.description && <p style={styles.description}>{recipe.description}</p>}

          <div style={styles.heroActions}>
            <Link
              to={`/recipe/${params.id}/instructions`}
              className="btn"
              style={styles.primaryBtn}
            >
              Start cooking
            </Link>
            <Link to={`/edit/recipe/${params.id}`} className="btn" style={styles.secondaryBtn}>
              Edit recipe
            </Link>
          </div>
        </div>
      </header>

      <div style={styles.columns}>
        <section style={styles.panel}>
          <h2 style={styles.panelTitle}>Ingredients</h2>
          {ingredients.length === 0 ? (
            <p style={styles.empty}>No ingredients listed for this recipe.</p>
          ) : (
            <ul style={styles.ingrList}>
              {ingredients.map((ingredient) => (
                <li key={ingredient.id} style={styles.ingrRow}>
                  <span>{ingredient.name}</span>
                  <span style={styles.amount}>
                    {formatQuantity(ingredient.quantity)} {ingredient.unit}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <h2 style={styles.panelTitle}>Directions</h2>
            {steps.length > 0 && (
              <button
                type="button"
                onClick={copyInstructions}
                className="btn"
                style={styles.copyBtn}
                aria-label="Copy instructions"
              >
                <svg
                  viewBox="0 0 24 24"
                  style={styles.copyIcon}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {copied ? (
                    <path d="M20 6 9 17l-5-5" />
                  ) : (
                    <>
                      <rect x="9" y="9" width="11" height="11" rx="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </>
                  )}
                </svg>
                {copied ? 'Copied' : 'Copy'}
              </button>
            )}
          </div>

          {steps.length === 0 ? (
            <p style={styles.empty}>No instructions listed for this recipe.</p>
          ) : (
            <ol style={styles.list}>
              {steps.map((step, index) => (
                <li key={index} style={styles.step}>
                  <span style={styles.stepNumber} aria-hidden="true">{index + 1}</span>
                  <span style={styles.stepText}>{step}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </article>
  )
}

export default Recipe

const styles = {
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    marginBottom: space.md,
    marginLeft: `-${space.sm}`,
    padding: `${space.xs} ${space.sm}`,
    fontSize: font.size.sm,
    fontWeight: font.weight.semibold,
    color: colors.textMuted,
    textDecoration: 'none',
    borderRadius: radius.sm,
  },
  hero: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: space.xl,
    marginBottom: space.xl,
  },
  heroMedia: {
    flex: '1 1 320px',
    maxWidth: '460px',
  },
  img: {
    display: 'block',
    width: '100%',
    height: '320px',
    objectFit: 'cover',
    borderRadius: radius.lg,
    border: `1px solid ${colors.border}`,
    background: colors.surfaceAlt,
  },
  imgFallback: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
    width: '100%',
    height: '320px',
    borderRadius: radius.lg,
    border: `1px solid ${colors.border}`,
    background: colors.surfaceAlt,
    color: colors.textFaint,
  },
  fallbackMark: {
    fontSize: '40px',
    opacity: 0.7,
  },
  fallbackText: {
    fontSize: font.size.sm,
  },
  heroBody: {
    flex: '1 1 360px',
    minWidth: 0,
  },
  title: {
    ...heading.h1,
    marginBottom: space.sm,
  },
  metaRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: space.sm,
    marginBottom: space.md,
    fontSize: font.size.sm,
  },
  rating: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: space.xs,
    fontWeight: font.weight.bold,
    color: colors.ink,
  },
  metaMuted: {
    color: colors.textMuted,
  },
  metaDot: {
    color: colors.textFaint,
  },
  description: {
    margin: `0 0 ${space.lg}`,
    fontSize: font.size.md,
    lineHeight: 1.6,
    color: colors.textMuted,
    maxWidth: '60ch',
  },
  heroActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  primaryBtn: {
    ...button.primary,
  },
  secondaryBtn: {
    ...button.secondary,
  },
  // Two equal columns that collapse to one when there isn't room.
  columns: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: space.lg,
    alignItems: 'start',
  },
  panel: {
    ...card,
    padding: space.lg,
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
    marginBottom: space.md,
  },
  panelTitle: {
    ...heading.h2,
    margin: 0,
  },
  ingrList: {
    listStyle: 'none',
    margin: `${space.md} 0 0`,
    padding: 0,
  },
  ingrRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: space.md,
    fontSize: font.size.md,
    padding: `${space.sm} 0`,
    borderBottom: `1px solid ${colors.border}`,
  },
  amount: {
    fontWeight: font.weight.bold,
    whiteSpace: 'nowrap',
  },
  copyBtn: {
    ...button.secondary,
    ...button.small,
  },
  copyIcon: {
    width: '16px',
    height: '16px',
    display: 'block',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  step: {
    display: 'flex',
    gap: space.md,
    padding: `${space.sm} 0`,
    borderBottom: `1px solid ${colors.border}`,
  },
  // Ink-filled numeral instead of a default marker — reads as a checklist.
  stepNumber: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    background: colors.ink,
    color: '#ffffff',
    fontSize: font.size.xs,
    fontWeight: font.weight.bold,
  },
  stepText: {
    fontSize: font.size.md,
    lineHeight: 1.6,
  },
  empty: {
    margin: `${space.md} 0 0`,
    fontSize: font.size.sm,
    color: colors.textFaint,
  },
  errorBox: {
    ...card,
    textAlign: 'center',
    padding: `${space.xxl} ${space.md}`,
    border: `2px solid ${colors.ink}`,
  },
  errorTitle: {
    margin: `0 0 ${space.xs}`,
    fontSize: font.size.lg,
    fontWeight: font.weight.semibold,
  },
  errorText: {
    margin: `0 0 ${space.md}`,
    fontSize: font.size.sm,
    color: colors.textMuted,
  },
}
