import { Link } from 'react-router-dom'
import auth from '../services/auth.js'
import githubimg from '../assets/githubimage.png'
import { button, card, colors, font, gutter, heading, space } from '../styles/theme.js'

// The login route renders without the nav, so it carries its own branding.
const Login = () => {
  return (
    <div style={styles.screen}>
      <div style={styles.panel}>
        <Link to="/" style={styles.brand}>
          <span aria-hidden="true" style={styles.mark}>🥗</span>
          EatRite
        </Link>

        <h1 style={styles.title}>Welcome back</h1>
        <p style={styles.subtitle}>
          Sign in to track your kitchen, save favorites, and plan your week.
        </p>

        <button type="button" onClick={auth.login} className="btn" style={styles.githubBtn}>
          <img src={githubimg} alt="" style={styles.gitimg} />
          Continue with GitHub
        </button>

        <p style={styles.footnote}>
          We only use your GitHub account to identify you — nothing is posted on your behalf.
        </p>

        <Link to="/" style={styles.backLink}>
          Browse recipes without signing in
        </Link>
      </div>
    </div>
  )
}

export default Login

const styles = {
  screen: {
    minHeight: '100svh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${space.xl} ${gutter}`,
    background: colors.surfaceAlt,
  },
  panel: {
    ...card,
    width: '100%',
    maxWidth: '420px',
    padding: space.xl,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  brand: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: space.sm,
    marginBottom: space.xl,
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
  title: {
    ...heading.h2,
    marginBottom: space.xs,
  },
  subtitle: {
    margin: `0 0 ${space.xl}`,
    fontSize: font.size.sm,
    color: colors.textMuted,
    maxWidth: '34ch',
  },
  githubBtn: {
    ...button.primary,
    width: '100%',
    padding: '14px 20px',
  },
  gitimg: {
    height: '20px',
    // The GitHub mark is the one bit of imagery here; keep it monochrome so it
    // matches the black-and-white palette.
    filter: 'grayscale(1) brightness(4)',
  },
  footnote: {
    margin: `${space.md} 0 0`,
    fontSize: font.size.xs,
    color: colors.textFaint,
    maxWidth: '36ch',
  },
  backLink: {
    marginTop: space.xl,
    fontSize: font.size.sm,
    color: colors.textMuted,
  },
}
