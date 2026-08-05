import { useState } from 'react'
import { colors, font, input, radius, space } from '../styles/theme.js'

// If a parent passes `value` + `onChange`, the parent owns the text (controlled).
// Otherwise the input keeps its own state so `<Search />` still works on its own.
function SearchBar({ value, onChange, placeholder = "Search..." }) {
  const [internalQuery, setInternalQuery] = useState("");

  const isControlled = value !== undefined
  const query = isControlled ? value : internalQuery

  const setQuery = (next) => {
    if (isControlled) {
      onChange(next)
    } else {
      setInternalQuery(next)
    }
  }

  return (
    <div style={styles.wrap}>
      <svg
        viewBox="0 0 24 24"
        style={styles.icon}
        fill="none"
        stroke={colors.textFaint}
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>

      <input
        type="search"
        className="input"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        style={styles.search}
        aria-label={placeholder}
      />

      {query && (
        <button
          type="button"
          onClick={() => setQuery('')}
          style={styles.clear}
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
}

export default SearchBar;

const styles = {
  wrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    minWidth: '260px',
    flex: '1 1 260px',
    maxWidth: '420px',
  },
  icon: {
    position: 'absolute',
    left: space.md,
    width: '18px',
    height: '18px',
    pointerEvents: 'none',
  },
  search: {
    ...input,
    paddingLeft: '42px',
    paddingRight: '36px',
    borderRadius: radius.pill,
  },
  clear: {
    position: 'absolute',
    right: space.sm,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '22px',
    height: '22px',
    background: 'none',
    border: 'none',
    borderRadius: '50%',
    color: colors.textMuted,
    fontSize: font.size.lg,
    lineHeight: 1,
    cursor: 'pointer',
    padding: 0,
  },
}
