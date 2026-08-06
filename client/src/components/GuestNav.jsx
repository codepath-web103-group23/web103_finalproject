import { Link, useLocation } from 'react-router-dom'
import NavShell, { navLinkStyle } from './NavShell.jsx'
import { button } from '../styles/theme.js'

const GuestNav = () => {
  // Previously this read the global `window.location`, which doesn't re-render
  // on client-side navigation — useLocation keeps the links in sync.
  const { pathname } = useLocation()
  const isLoginPage = pathname === '/login'
  const isHomePage = pathname === '/' || pathname === '/home'

  return (
    <NavShell>
      {!isHomePage && (
        <Link to="/" className="nav-link" style={navLinkStyle}>
          Home
        </Link>
      )}
      {!isLoginPage && (
        <Link to="/login" className="btn" style={styles.loginBtn}>
          Log in
        </Link>
      )}
    </NavShell>
  )
}

export default GuestNav

const styles = {
  loginBtn: {
    ...button.primary,
    padding: '12px 24px',
  },
}
