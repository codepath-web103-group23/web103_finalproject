import api from "../services/api.jsx"
import toSteps from "../utils/steps.js"
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Loading from '../components/Loading.jsx'
import Modal from '../components/Modal.jsx'
import { useToast } from '../components/Toast.jsx'
import { button, card, colors, font, heading, radius, space } from '../styles/theme.js'

const Instructions = () => {
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // Cook mode: ticking a step off keeps your place while your hands are busy.
  const [done, setDone] = useState([])
  // Finishing a recipe takes its ingredients out of your kitchen, so it goes
  // through a confirm step and reports back exactly what it used.
  const [confirming, setConfirming] = useState(false)
  const [cooking, setCooking] = useState(false)
  const [result, setResult] = useState(null)
  const params = useParams()
  const toast = useToast()

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

  const finishCooking = async () => {
    setCooking(true)
    try {
      const summary = await api.cookRecipe(params.id)
      setResult(summary)
      setConfirming(false)
      toast.success(`${recipe.title} cooked — kitchen updated`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setCooking(false)
    }
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

      {steps.length > 0 && (
        <div style={styles.finishBar}>
          <p style={styles.finishHint}>
            {done.length === steps.length
              ? 'All done — take the ingredients out of your kitchen?'
              : 'Finished early? You can update your kitchen at any point.'}
          </p>
          <button
            type="button"
            className="btn"
            style={styles.finishBtn}
            onClick={() => setConfirming(true)}
          >
            I cooked this
          </button>
        </div>
      )}

      {confirming && (
        <Modal
          title="Update your kitchen?"
          onClose={() => !cooking && setConfirming(false)}
          footer={
            <>
              <button
                type="button"
                className="btn"
                style={styles.secondaryBtn}
                onClick={() => setConfirming(false)}
                disabled={cooking}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn"
                style={styles.finishBtn}
                onClick={finishCooking}
                disabled={cooking}
              >
                {cooking ? 'Updating…' : 'Yes, I cooked it'}
              </button>
            </>
          }
        >
          <p style={styles.modalText}>
            This subtracts <strong>{recipe.title}</strong>’s ingredients from your kitchen.
            Anything you run out of is removed from the list.
          </p>
        </Modal>
      )}

      {result && (
        <Modal title="Kitchen updated" onClose={() => setResult(null)}>
          {result.used.length > 0 && (
            <>
              <p style={styles.resultHeading}>Used from your kitchen</p>
              <ul style={styles.resultList}>
                {result.used.map((item) => (
                  <li key={item.name} style={styles.resultItem}>
                    {item.name}
                    <span style={styles.resultNote}>
                      {item.remaining === 0 ? 'all used up' : `${item.remaining} left`}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}

          {result.missing.length > 0 && (
            <>
              <p style={styles.resultHeading}>Not in your kitchen</p>
              <ul style={styles.resultList}>
                {result.missing.map((name) => (
                  <li key={name} style={styles.resultItem}>{name}</li>
                ))}
              </ul>
            </>
          )}

          {result.skipped.length > 0 && (
            <>
              <p style={styles.resultHeading}>Left unchanged</p>
              <ul style={styles.resultList}>
                {result.skipped.map((item) => (
                  <li key={item.name} style={styles.resultItem}>
                    {item.name}
                    <span style={styles.resultNote}>{item.reason}</span>
                  </li>
                ))}
              </ul>
            </>
          )}

          <Link to="/kitchen" style={styles.kitchenLink}>View my kitchen →</Link>
        </Modal>
      )}
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
  finishBar: {
    ...card,
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    marginTop: space.lg,
    padding: space.lg,
  },
  finishHint: {
    margin: 0,
    fontSize: font.size.sm,
    color: colors.textMuted,
  },
  finishBtn: {
    ...button.primary,
  },
  modalText: {
    margin: 0,
    fontSize: font.size.sm,
    lineHeight: 1.6,
  },
  resultHeading: {
    margin: `${space.md} 0 ${space.xs}`,
    fontSize: font.size.xs,
    fontWeight: font.weight.bold,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: colors.textMuted,
  },
  resultList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  resultItem: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: space.md,
    padding: `${space.xs} 0`,
    borderBottom: `1px solid ${colors.border}`,
    fontSize: font.size.sm,
  },
  resultNote: {
    color: colors.textFaint,
    fontSize: font.size.xs,
  },
  kitchenLink: {
    display: 'inline-block',
    marginTop: space.lg,
    fontSize: font.size.sm,
    fontWeight: font.weight.semibold,
    color: colors.ink,
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
