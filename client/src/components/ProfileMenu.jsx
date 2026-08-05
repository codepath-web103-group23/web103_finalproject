import { Link } from 'react-router-dom'
import logoutimg from '../assets/log-out.svg'
import userimg from '../assets/home-user.svg'
import auth from '../services/auth.js'
import { colors, font, radius, shadow, space } from '../styles/theme.js'

const ProfileMenu = ({ user }) => {
  return (
    <div style={styles.menuContainer} role="menu">
      <div style={styles.profileInfo}>
        {user.avatarurl ? (
          <img src={user.avatarurl} alt="" style={styles.profileImg} />
        ) : (
          <span style={{ ...styles.profileImg, ...styles.profileFallback }}>
            {(user.username ?? '?').charAt(0).toUpperCase()}
          </span>
        )}
        <div style={styles.identity}>
          <p style={styles.username}>{user.username}</p>
          {user.is_admin && <p style={styles.role}>Admin</p>}
        </div>
      </div>

      <div style={styles.divider} />

      <Link to="/profile" style={styles.item} className="nav-link" role="menuitem">
        <img src={userimg} alt="" style={styles.icon} />
        Profile
      </Link>
      <button
        type="button"
        style={{ ...styles.item, ...styles.logoutBtn }}
        className="nav-link"
        onClick={auth.logout}
        role="menuitem"
      >
        <img src={logoutimg} alt="" style={styles.icon} />
        Log out
      </button>
    </div>
  )
}

export default ProfileMenu

const styles = {
  menuContainer: {
    position: 'absolute',
    top: 'calc(100% + 10px)',
    right: 0,
    zIndex: 1000,
    width: '220px',
    padding: space.sm,
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.md,
    boxShadow: shadow.lg,
  },
  profileInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: space.sm,
    padding: space.sm,
  },
  profileImg: {
    display: 'block',
    width: '36px',
    height: '36px',
    borderRadius: radius.pill,
    objectFit: 'cover',
    flexShrink: 0,
    background: colors.surfaceAlt,
  },
  profileFallback: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: font.weight.bold,
    color: colors.textMuted,
  },
  identity: {
    minWidth: 0,
  },
  username: {
    margin: 0,
    fontSize: font.size.sm,
    fontWeight: font.weight.semibold,
    color: colors.text,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  // Small ink-filled chip rather than colored text.
  role: {
    display: 'inline-block',
    margin: `2px 0 0`,
    padding: '1px 6px',
    fontSize: font.size.xs,
    fontWeight: font.weight.semibold,
    color: '#ffffff',
    background: colors.ink,
    borderRadius: radius.sm,
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  divider: {
    height: '1px',
    background: colors.border,
    margin: `${space.xs} 0`,
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: space.sm,
    width: '100%',
    padding: `10px ${space.sm}`,
    fontSize: font.size.sm,
    fontWeight: font.weight.medium,
    fontFamily: 'inherit',
    color: colors.text,
    textDecoration: 'none',
    borderRadius: radius.sm,
    background: 'none',
    border: 'none',
    textAlign: 'left',
  },
  logoutBtn: {
    cursor: 'pointer',
    color: colors.danger,
  },
  icon: {
    width: '18px',
    height: '18px',
    flexShrink: 0,
  },
}
