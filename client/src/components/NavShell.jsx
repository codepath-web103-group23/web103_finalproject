import { Link } from 'react-router-dom'
import { colors, font, gutter, radius, space } from '../styles/theme.js'

// The bar itself: brand on the left, whatever the caller passes on the right.
// Nav (signed in), GuestNav, and the loading placeholder all share it so the
// header never jumps size or position between auth states.
const NavShell = ({ children }) => {
  return (
    <header style={styles.bar}>
      <div style={styles.inner}>
        <Link to="/" style={styles.brand}>
          {/* The logo mark is the one place color is allowed — the rest of the
              app is strictly black and white. */}
          <span aria-hidden="true" style={styles.mark}>
            🥗
          </span>
          EatRite
        </Link>
        <nav style={styles.actions}>{children}</nav>
      </div>
    </header>
  )
}

export default NavShell

const styles = {
  bar: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    width: '100%',
    background: colors.surface,
    borderBottom: `1px solid ${colors.border}`,
  },
  inner: {
    width: '100%',
    padding: `${space.sm} ${gutter}`,
    minHeight: '76px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
  },
  brand: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: space.sm,
    fontSize: font.size.xl,
    fontWeight: font.weight.bold,
    letterSpacing: '-0.5px',
    color: colors.ink,
    textDecoration: 'none',
  },
  mark: {
    fontSize: '26px',
    lineHeight: 1,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: space.xs,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  link: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '12px 20px',
    fontSize: font.size.md,
    fontWeight: font.weight.semibold,
    color: colors.textMuted,
    textDecoration: 'none',
    borderRadius: radius.md,
  },
}

// Exported so Nav and GuestNav render identical-looking links.
export const navLinkStyle = styles.link
