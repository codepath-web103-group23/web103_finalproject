import api from "../services/api.jsx"
import toSteps from "../utils/steps.js"
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Loading from '../components/Loading.jsx'
import { button, card, colors, font, heading, radius, space } from '../styles/theme.js'

const Instructions = () => {
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // Cook mode: ticking a step off keeps your place while your hands are busy.
  const [done, setDone] = useState([])
  const params = useParams()

  useEffect(() => {
    const loadRecipe = async () => {
      setLoading(true)
      try {
        const data = await api.getRecipe(params.id)
        setRecipe(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadRecipe()
  }, [params.id])

  const steps = toSteps(recipe?.instructions)

  const toggleStep = (index) => {
    setDone((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    )
  }

  if (loading) {
    return <Loading label="Loading instructions…" size="lg" />
  }

  if (error || !recipe) {
    return (
      <div style={styles.errorBox} role="alert">
        <p style={styles.errorTitle}>We couldn’t load these instructions</p>
        <p style={styles.errorText}>{error ?? 'The recipe may have been removed.'}</p>
        <Link to="/" className="btn" style={styles.secondaryBtn}>Back to recipes</Link>
      </div>
    )
  }

  const progress = steps.length === 0 ? 0 : Math.round((done.length / steps.length) * 100)

  return (
    <div style={styles.wrap}>
      <Link to={`/recipe/${params.id}`} style={styles.backLink} className="nav-link">
        ← Back to recipe
      </Link>

      <header style={styles.header}>
        <h1 style={styles.title}>{recipe.title}</h1>
        <p style={styles.subtitle}>
          {done.length} of {steps.length} steps done
        </p>
        <div
          style={styles.progressTrack}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Cooking progress"
        >
          <div style={{ ...styles.progressFill, width: `${progress}%` }} />
        </div>
      </header>

      <div style={styles.panel}>
        {steps.length === 0 ? (
          <p style={styles.empty}>No instructions listed for this recipe.</p>
        ) : (
          <ol style={styles.list}>
            {steps.map((step, index) => {
              const checked = done.includes(index)
              return (
                <li key={index} style={styles.step}>
                  <label style={styles.stepLabel}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleStep(index)}
                      style={styles.checkbox}
                    />
                    <span style={styles.stepNumber} aria-hidden="true">{index + 1}</span>
                    <span style={checked ? { ...styles.stepText, ...styles.stepDone } : styles.stepText}>
                      {step}
                    </span>
                  </label>
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </div>
  )
}

export default Instructions

const styles = {
  wrap: {
    maxWidth: '820px',
  },
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
  header: {
    marginBottom: space.lg,
  },
  title: {
    ...heading.h1,
  },
  subtitle: {
    margin: `0 0 ${space.sm}`,
    fontSize: font.size.sm,
    color: colors.textMuted,
  },
  progressTrack: {
    height: '6px',
    width: '100%',
    background: colors.surfaceSunken,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: colors.ink,
    transition: 'width 200ms ease',
  },
  panel: {
    ...card,
    padding: space.lg,
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  step: {
    borderBottom: `1px solid ${colors.border}`,
  },
  stepLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: space.md,
    padding: `${space.md} 0`,
    cursor: 'pointer',
  },
  checkbox: {
    marginTop: '5px',
    width: '18px',
    height: '18px',
    accentColor: colors.ink,
    flexShrink: 0,
    cursor: 'pointer',
  },
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
  stepDone: {
    textDecoration: 'line-through',
    color: colors.textFaint,
  },
  empty: {
    margin: 0,
    fontSize: font.size.sm,
    color: colors.textFaint,
  },
  secondaryBtn: {
    ...button.secondary,
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
