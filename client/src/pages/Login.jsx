import { Link } from 'react-router-dom'
import auth from '../services/auth.js'
import githubimg from '../assets/githubimage.png'
import { button, card, colors, font, gutter, heading, space } from '../styles/theme.js'

// The login route renders without the nav, so it carries its own branding.
const Login = () => {
  return (
    <div style={styles.screen}>
      <div style={styles.panel}>
        {/* Four elements, not six: mark, one line of copy, the action, one way
            out. The wordmark, a separate "Welcome back" heading and a privacy
            footnote all said the same thing the button already says. */}
        <span aria-hidden="true" style={styles.mark}>🥗</span>

        <h1 style={styles.title}>Sign in to EatRite</h1>
        <p style={styles.subtitle}>
          Track your kitchen, save favorites, and plan your week.
        </p>

        <button type="button" onClick={auth.login} className="btn" style={styles.githubBtn}>
          <img src={githubimg} alt="" style={styles.gitimg} />
          Continue with GitHub
        </button>

        <Link to="/" style={styles.backLink}>
          Browse without signing in
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
    maxWidth: '400px',
    padding: `${space.xxl} ${space.xl}`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  mark: {
    fontSize: '44px',
    lineHeight: 1,
    marginBottom: space.lg,
  },
  title: {
    ...heading.h2,
    marginBottom: space.sm,
  },
  subtitle: {
    margin: `0 0 ${space.xxl}`,
    fontSize: font.size.sm,
    lineHeight: 1.6,
    color: colors.textMuted,
    maxWidth: '30ch',
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
  backLink: {
    marginTop: space.lg,
    fontSize: font.size.sm,
    color: colors.textMuted,
  },
}
