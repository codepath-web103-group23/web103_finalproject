import { NavLink, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import Menu from '../components/ProfileMenu.jsx'
import NavShell, { navLinkStyle } from './NavShell.jsx'
import { colors, radius } from '../styles/theme.js'

function Nav({ user }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const location = useLocation()

  useEffect(() => {
    const closeMenu = (e) => {
      if (!menuRef.current?.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    const onEscape = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('mousedown', closeMenu)
    document.addEventListener('keydown', onEscape)

    return () => {
      document.removeEventListener('mousedown', closeMenu)
      document.removeEventListener('keydown', onEscape)
    }
  }, [])

  // Navigating away should never leave the dropdown hanging open.
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  return (
    <NavShell>
      <NavLink to="/home" className="nav-link" style={navLinkStyle}>
        Home
      </NavLink>
      <NavLink to="/kitchen" className="nav-link" style={navLinkStyle}>
        My Kitchen
      </NavLink>
      <NavLink to="/calendar" className="nav-link" style={navLinkStyle}>
        Calendar
      </NavLink>
      {user.is_admin && (
        <NavLink to="/admin" className="nav-link" style={navLinkStyle}>
          Admin
        </NavLink>
      )}

      <div ref={menuRef} style={styles.profileContainer}>
        <button
          type="button"
          style={styles.profileBtn}
          onClick={() => setMenuOpen((open) => !open)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label={`Account menu for ${user.username ?? 'your account'}`}
        >
          {user.avatarurl ? (
            <img src={user.avatarurl} alt="" style={styles.avatar} />
          ) : (
            <span style={styles.avatarFallback}>
              {(user.username ?? '?').charAt(0).toUpperCase()}
            </span>
          )}
        </button>
        {menuOpen && <Menu user={user} />}
      </div>
    </NavShell>
  )
}

export default Nav

const styles = {
  profileContainer: {
    position: 'relative',
    marginLeft: '4px',
  },
  profileBtn: {
    display: 'block',
    width: '44px',
    height: '44px',
    padding: 0,
    borderRadius: radius.pill,
    border: `1px solid ${colors.border}`,
    background: colors.surfaceAlt,
    cursor: 'pointer',
    overflow: 'hidden',
  },
  avatar: {
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  avatarFallback: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    fontSize: '17px',
    fontWeight: 700,
    color: colors.textMuted,
  },
}
