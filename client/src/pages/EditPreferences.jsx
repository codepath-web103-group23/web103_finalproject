import { useState, useEffect } from 'react'
import preferenceApi from '../services/preferenceApi.js'
import PrefItem from '../components/PrefItem.jsx'
import Modal from '../components/Modal.jsx'
import Loading from '../components/Loading.jsx'
import { useToast } from '../components/Toast.jsx'
import { button, colors, font, input, radius, space } from '../styles/theme.js'

const EditPreferences = ({ toggle, delRefresh, inRefresh }) => {
  const [preferences, setPreferences] = useState([])
  const [newPref, setNewPref] = useState({ preference: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const toast = useToast()

  const handleChange = (event) => {
    const { name, value } = event.target
    setNewPref((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleModalDeleteRefresh = (id) => {
    setPreferences(prev => prev.filter(preference => preference.id !== id))
  }

  useEffect(() => {
    const fetchPreference = async () => {
      try {
        const data = await preferenceApi.getPreferences()
        setPreferences(Array.isArray(data) ? data : [])
      } catch (err) {
        toast.error("Couldn't load your preferences.")
      } finally {
        setLoading(false)
      }
    }
    fetchPreference()
  }, [])

  const createPreference = async (event) => {
    event.preventDefault()

    const value = newPref.preference.trim()
    if (!value) {
      setError('Type a preference first.')
      return
    }
    if (preferences.some((p) => p.preference?.toLowerCase() === value.toLowerCase())) {
      setError('You already have that preference.')
      return
    }

    setSaving(true)
    try {
      // Use whatever the server returns so the new row carries a real id —
      // the optimistic copy had none, so it couldn't be deleted without a
      // page refresh.
      const created = await preferenceApi.createPreference({ preference: value })
      const saved = created?.id ? created : { preference: value }

      setPreferences(prev => [...prev, saved])
      inRefresh(saved)
      setNewPref({ preference: '' })
      toast.success(`Added "${value}"`)
    } catch (err) {
      setError(err.message)
      toast.error("Couldn't add that preference.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="Dietary preferences" onClose={toggle}>
      {loading ? (
        <Loading label="Loading preferences…" />
      ) : (
        <>
          {preferences.length === 0 ? (
            <p style={styles.empty}>No preferences yet. Add one below.</p>
          ) : (
            <ul style={styles.prefBox}>
              {preferences.map((p) => (
                <PrefItem
                  key={p.id}
                  id={p.id}
                  preference={p.preference}
                  delRefresh={delRefresh}
                  delModalRefresh={handleModalDeleteRefresh}
                />
              ))}
            </ul>
          )}

          <form style={styles.addBox} onSubmit={createPreference} noValidate>
            <label htmlFor="preference" style={styles.srOnly}>New preference</label>
            <input
              id="preference"
              className="input"
              style={styles.input}
              name="preference"
              placeholder="e.g. vegetarian, gluten-free"
              value={newPref.preference}
              onChange={handleChange}
              disabled={saving}
            />
            <button type="submit" className="btn" style={styles.addBtn} disabled={saving}>
              {saving ? 'Adding…' : 'Add'}
            </button>
          </form>

          {error && <p style={styles.error} role="alert">{error}</p>}
        </>
      )}
    </Modal>
  )
}

export default EditPreferences

const styles = {
  prefBox: {
    listStyle: 'none',
    margin: `0 0 ${space.lg}`,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  addBox: {
    display: 'flex',
    alignItems: 'center',
    gap: space.sm,
  },
  input: {
    ...input,
    flex: 1,
  },
  addBtn: {
    ...button.primary,
  },
  error: {
    margin: `${space.sm} 0 0`,
    fontSize: font.size.xs,
    fontWeight: font.weight.semibold,
    color: colors.ink,
  },
  empty: {
    margin: `0 0 ${space.lg}`,
    padding: space.md,
    fontSize: font.size.sm,
    color: colors.textFaint,
    border: `1px dashed ${colors.borderStrong}`,
    borderRadius: radius.md,
    textAlign: 'center',
  },
  // Visually hidden but still announced by screen readers.
  srOnly: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0,
  },
}
