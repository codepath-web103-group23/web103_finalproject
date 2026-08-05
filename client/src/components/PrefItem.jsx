import { useState } from 'react'
import preferenceApi from '../services/preferenceApi.js'
import { useToast } from './Toast.jsx'
import { button, colors, font, radius, space } from '../styles/theme.js'

const PrefItem = ({ id, preference, delRefresh, delModalRefresh }) => {
  const [deleting, setDeleting] = useState(false)
  const toast = useToast()

  const deletePreference = async () => {
    setDeleting(true)
    try {
      await preferenceApi.deletePreference(id)
      delRefresh(id, 'pref')
      delModalRefresh(id)
      toast.success(`Removed "${preference}"`)
    } catch (err) {
      toast.error("Couldn't remove that preference.")
      setDeleting(false)
    }
  }

  return (
    <li style={styles.prefItem}>
      <span style={styles.chip}>{preference}</span>
      <button
        type="button"
        className="btn btn-ghost"
        style={styles.btn}
        onClick={deletePreference}
        disabled={deleting}
        aria-label={`Remove ${preference}`}
      >
        {deleting ? 'Removing…' : 'Remove'}
      </button>
    </li>
  )
}

export default PrefItem

const styles = {
  prefItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    padding: `${space.sm} 0`,
    borderBottom: `1px solid ${colors.border}`,
  },
  chip: {
    display: 'inline-block',
    padding: `${space.xs} ${space.md}`,
    background: colors.surfaceAlt,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.pill,
    fontSize: font.size.sm,
    fontWeight: font.weight.medium,
  },
  btn: {
    ...button.ghost,
    ...button.small,
    textDecoration: 'underline',
  },
}
