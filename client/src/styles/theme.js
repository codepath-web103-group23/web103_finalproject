// Shared design tokens for EatRite.
//
// Components keep their own `const styles = {...}` object at the bottom of the
// file (see CLAUDE.md) — this module just gives those objects one source of
// truth for color, spacing, and type so pages stop drifting apart.
//
// Anything that needs a pseudo-class (:hover, :focus-visible, ::placeholder)
// can't live in an inline style object; those are the `.btn`, `.input`, and
// `.card` classes in index.css, which read the same values as CSS variables.

// Strictly monochrome. Hierarchy comes from weight, size, and spacing rather
// than hue — nothing in the app introduces a color.
export const colors = {
  // ink
  ink: '#000000',
  inkSoft: '#1a1a1a',

  // surfaces
  bg: '#ffffff',
  surface: '#ffffff',
  surfaceAlt: '#f5f5f5',
  surfaceSunken: '#ebebeb',

  // text
  text: '#111111',
  textMuted: '#616161',
  textFaint: '#8f8f8f',

  // lines
  border: '#e0e0e0',
  borderStrong: '#c2c2c2',

  // status — still monochrome; meaning is carried by icon and copy
  danger: '#111111',
  dangerSoft: '#f5f5f5',
  focus: '#000000',
}

export const space = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
}

export const radius = {
  sm: '6px',
  md: '10px',
  lg: '16px',
  pill: '999px',
}

export const font = {
  size: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '20px',
    xl: '26px',
    xxl: '34px',
  },
  weight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
}

export const shadow = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.06)',
  md: '0 2px 8px rgba(0, 0, 0, 0.08)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.14)',
}

// Layout primitives ---------------------------------------------------------

// Full-bleed: content spans the viewport with a comfortable gutter instead of
// sitting in a centered fixed-width column. `gutter` is shared with the nav so
// the header and the page body stay on the same left edge.
export const gutter = 'clamp(16px, 4vw, 56px)'

export const page = {
  width: '100%',
  padding: `${space.lg} ${gutter} ${space.xxl}`,
  boxSizing: 'border-box',
}

export const heading = {
  h1: {
    fontSize: font.size.xxl,
    fontWeight: font.weight.bold,
    color: colors.text,
    margin: `0 0 ${space.sm}`,
    letterSpacing: '-0.4px',
  },
  h2: {
    fontSize: font.size.xl,
    fontWeight: font.weight.semibold,
    color: colors.text,
    margin: `0 0 ${space.sm}`,
    letterSpacing: '-0.2px',
  },
  h3: {
    fontSize: font.size.lg,
    fontWeight: font.weight.semibold,
    color: colors.text,
    margin: `0 0 ${space.xs}`,
  },
}

export const card = {
  background: colors.surface,
  border: `1px solid ${colors.border}`,
  borderRadius: radius.lg,
  boxShadow: shadow.sm,
}

// Controls ------------------------------------------------------------------
//
// Pair these with className="btn" / className="input" so the hover and focus
// states in index.css apply.

const buttonBase = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: space.sm,
  fontSize: font.size.md,
  fontWeight: font.weight.semibold,
  fontFamily: 'inherit',
  lineHeight: 1.2,
  padding: '10px 18px',
  borderRadius: radius.md,
  border: '1px solid transparent',
  cursor: 'pointer',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
}

export const button = {
  // Solid black is the single call to action on a screen; everything else is
  // outlined or ghost so the hierarchy reads without color.
  primary: {
    ...buttonBase,
    background: colors.ink,
    color: '#ffffff',
    borderColor: colors.ink,
  },
  secondary: {
    ...buttonBase,
    background: colors.surface,
    color: colors.text,
    borderColor: colors.borderStrong,
  },
  ghost: {
    ...buttonBase,
    background: 'transparent',
    color: colors.textMuted,
    borderColor: 'transparent',
    padding: `${space.sm} ${space.sm}`,
  },
  // Destructive: outlined in ink, filled only on hover. Distinguished by the
  // word on it, not by hue.
  danger: {
    ...buttonBase,
    background: colors.surface,
    color: colors.ink,
    borderColor: colors.ink,
  },
  small: {
    padding: '6px 12px',
    fontSize: font.size.sm,
    borderRadius: radius.sm,
  },
}

export const input = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '10px 12px',
  fontSize: font.size.md,
  fontFamily: 'inherit',
  color: colors.text,
  background: colors.surface,
  border: `1px solid ${colors.borderStrong}`,
  borderRadius: radius.md,
  outline: 'none',
}

export const label = {
  display: 'block',
  fontSize: font.size.sm,
  fontWeight: font.weight.semibold,
  color: colors.textMuted,
  marginBottom: space.xs,
}
