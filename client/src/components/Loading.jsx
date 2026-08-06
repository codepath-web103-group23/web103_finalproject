import { colors, font, space } from '../styles/theme.js'

// Reusable spinner. `size="sm"` with `inline` fits next to text or inside a
// button; the default sits in the middle of a page section while data loads.
const Loading = ({ label = 'Loading…', size = 'md', inline = false }) => {
  const px = size === 'sm' ? 16 : size === 'lg' ? 40 : 24

  const spinner = (
    <span
      className="spin"
      style={{
        ...styles.spinner,
        width: `${px}px`,
        height: `${px}px`,
        borderWidth: size === 'sm' ? '2px' : '3px',
      }}
    />
  )

  if (inline) {
    return (
      <span style={styles.inline} role="status" aria-live="polite">
        {spinner}
        {label && <span>{label}</span>}
      </span>
    )
  }

  return (
    <div style={styles.block} role="status" aria-live="polite">
      {spinner}
      {label && <p style={styles.label}>{label}</p>}
    </div>
  )
}

export default Loading

const styles = {
  spinner: {
    display: 'inline-block',
    borderStyle: 'solid',
    borderColor: colors.border,
    borderTopColor: colors.ink,
    borderRadius: '50%',
    flexShrink: 0,
  },
  block: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    padding: `${space.xxl} ${space.md}`,
    width: '100%',
  },
  label: {
    margin: 0,
    fontSize: font.size.sm,
    color: colors.textMuted,
  },
  inline: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: space.sm,
  },
}
