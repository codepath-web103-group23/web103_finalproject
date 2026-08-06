import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { colors, font, radius, shadow, space } from '../styles/theme.js'

const ToastContext = createContext(null)

// Usage:
//   const toast = useToast()
//   toast.success('Recipe saved')
//   toast.error('Could not save recipe')
export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used inside <ToastProvider>')
  }
  return ctx
}

const DURATION = 4000

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(0)
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const push = useCallback(
    (message, tone) => {
      const id = nextId.current++
      setToasts((prev) => [...prev, { id, message, tone }])
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), DURATION)
      )
      return id
    },
    [dismiss]
  )

  const api = useMemo(
    () => ({
      success: (message) => push(message, 'success'),
      error: (message) => push(message, 'error'),
      info: (message) => push(message, 'info'),
      dismiss,
    }),
    [push, dismiss]
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div style={styles.stack} aria-live="polite" aria-atomic="false">
        {toasts.map((t) => (
          <div key={t.id} style={{ ...styles.toast, ...toneStyles[t.tone] }} role="status">
            <span aria-hidden="true" style={{ ...styles.badge, ...badgeStyles[t.tone] }}>
              {icons[t.tone]}
            </span>
            <span style={styles.message}>{t.message}</span>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              style={styles.close}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

const icons = {
  success: '✓',
  error: '!',
  info: 'i',
}

// No color to lean on, so tone is carried by the badge treatment: a filled ink
// badge for success, a heavy ink rule for errors, and a quiet outline for info.
const toneStyles = {
  success: {
    borderLeft: `4px solid ${colors.ink}`,
  },
  error: {
    borderLeft: `4px solid ${colors.ink}`,
    background: colors.surfaceAlt,
  },
  info: {
    borderLeft: `4px solid ${colors.borderStrong}`,
  },
}

const badgeStyles = {
  success: {
    background: colors.ink,
    color: '#ffffff',
    border: `1px solid ${colors.ink}`,
  },
  error: {
    background: '#ffffff',
    color: colors.ink,
    border: `2px solid ${colors.ink}`,
  },
  info: {
    background: '#ffffff',
    color: colors.textMuted,
    border: `1px solid ${colors.borderStrong}`,
  },
}

const styles = {
  stack: {
    position: 'fixed',
    bottom: space.lg,
    right: space.lg,
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    gap: space.sm,
    maxWidth: 'min(360px, calc(100vw - 32px))',
  },
  toast: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: space.sm,
    padding: `${space.sm} ${space.md}`,
    background: colors.surface,
    color: colors.text,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.md,
    boxShadow: shadow.lg,
    fontSize: font.size.sm,
    animation: 'toast-in 160ms ease-out',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '18px',
    height: '18px',
    flexShrink: 0,
    marginTop: '1px',
    borderRadius: '50%',
    fontSize: '11px',
    fontWeight: font.weight.bold,
    lineHeight: 1,
  },
  message: {
    flex: 1,
    lineHeight: 1.4,
  },
  close: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: colors.textFaint,
    fontSize: '18px',
    lineHeight: 1,
    padding: 0,
  },
}
