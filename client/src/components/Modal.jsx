import { useEffect } from 'react'
import { card, colors, font, heading, radius, space } from '../styles/theme.js'

// Centered dialog over a scrim. Closes on Escape and on a backdrop click, and
// locks body scroll while it's open.
const Modal = ({ title, onClose, children, footer }) => {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  return (
    <div
      style={styles.backdrop}
      onClick={onClose}
      role="presentation"
    >
      <div
        style={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        // Clicks inside the panel must not reach the backdrop's close handler.
        onClick={(e) => e.stopPropagation()}
      >
        <header style={styles.header}>
          <h2 style={styles.title}>{title}</h2>
          <button
            type="button"
            onClick={onClose}
            style={styles.close}
            aria-label="Close dialog"
          >
            ×
          </button>
        </header>

        <div style={styles.body}>{children}</div>

        {footer && <footer style={styles.footer}>{footer}</footer>}
      </div>
    </div>
  )
}

export default Modal

const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 500,
    background: 'rgba(0, 0, 0, 0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.md,
  },
  dialog: {
    ...card,
    width: '100%',
    maxWidth: '520px',
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: radius.lg,
    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.3)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    padding: `${space.md} ${space.lg}`,
    borderBottom: `1px solid ${colors.border}`,
  },
  title: {
    ...heading.h3,
    margin: 0,
  },
  close: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '24px',
    lineHeight: 1,
    color: colors.textMuted,
    padding: 0,
  },
  body: {
    padding: space.lg,
    overflowY: 'auto',
    fontSize: font.size.sm,
  },
  footer: {
    padding: `${space.md} ${space.lg}`,
    borderTop: `1px solid ${colors.border}`,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: space.sm,
    flexWrap: 'wrap',
  },
}
