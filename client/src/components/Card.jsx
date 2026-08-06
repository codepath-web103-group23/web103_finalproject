import { memo, useState } from 'react'
import { Link } from 'react-router-dom'
import { button, card, colors, font, radius, space } from '../styles/theme.js'
import { sizedImage } from '../utils/image.js'

function Card ({id, title, image_url, avg_rating, loggedIn, isFavorited, onToggle}) {
  const [imgFailed, setImgFailed] = useState(false)

  // pg hands back NUMERIC as a string ("4.50"), and an unrated recipe is null —
  // both used to render as a bare "stars" with no number in front of it.
  const rating = avg_rating == null ? null : Number(avg_rating)
  const hasRating = rating != null && !Number.isNaN(rating)

  const showImage = image_url && !imgFailed

  return (
    <article style={styles.container} className="card">
      <Link to={`/recipe/${id}`} style={styles.imgLink}>
        {showImage ? (
          <img
            src={sizedImage(image_url, 600)}
            alt={title}
            style={styles.img}
            width="600"
            height="220"
            loading="lazy"
            decoding="async"
            onError={() => setImgFailed(true)}
          />
        ) : (
          // Fallback keeps the grid aligned instead of showing the browser's
          // broken-image icon at whatever size it likes.
          <div style={styles.imgFallback} role="img" aria-label={`${title} — no photo available`}>
            <span style={styles.fallbackMark} aria-hidden="true">🍽️</span>
            <span style={styles.fallbackText}>No photo yet</span>
          </div>
        )}
      </Link>

      <div style={styles.body}>
        <Link to={`/recipe/${id}`} style={styles.titleLink}>
          <h2 style={styles.title}>{title}</h2>
        </Link>

        <div style={styles.interBox}>
          {hasRating ? (
            <span style={styles.rating}>
              <span aria-hidden="true" style={styles.star}>★</span>
              {rating.toFixed(1)}
            </span>
          ) : (
            <span style={styles.noRating}>Not rated yet</span>
          )}

          <div style={styles.actions}>
            <Link to={`/recipe/${id}/instructions`} style={styles.stepsLink} className="btn">
              Directions
            </Link>
            <button
              type="button"
              onClick={() => onToggle(id, isFavorited)}
              style={styles.favBtn}
              disabled={!loggedIn}
              title={loggedIn ? undefined : 'Log in to save favorites'}
              aria-pressed={isFavorited}
              aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <svg
                viewBox="0 0 24 24"
                style={styles.heart}
                fill={isFavorited ? colors.ink : 'none'}
                stroke={isFavorited ? colors.ink : colors.textFaint}
                strokeWidth="2"
                strokeLinejoin="round"
              >
                <path d="M12 20.5s-7.5-4.7-7.5-10A4.2 4.2 0 0 1 12 7.6a4.2 4.2 0 0 1 7.5 2.9c0 5.3-7.5 10-7.5 10z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

// 32 cards re-rendered on every keystroke in the search box. Their props are
// primitives, so a shallow compare is enough to skip the ones that did not
// change.
export default memo(Card);

const styles = {
  container: {
    ...card,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    height: '100%',
  },
  imgLink: {
    display: 'block',
    textDecoration: 'none',
  },
  img: {
    display: 'block',
    width: '100%',
    height: '220px',
    objectFit: 'cover',
    background: colors.surfaceAlt,
  },
  imgFallback: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
    width: '100%',
    height: '220px',
    background: colors.surfaceAlt,
    borderBottom: `1px solid ${colors.border}`,
    color: colors.textFaint,
  },
  fallbackMark: {
    fontSize: '28px',
    opacity: 0.7,
  },
  fallbackText: {
    fontSize: font.size.xs,
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.md,
    padding: space.lg,
    flex: 1,
  },
  titleLink: {
    textDecoration: 'none',
    color: 'inherit',
  },
  title: {
    margin: 0,
    fontSize: font.size.lg,
    fontWeight: font.weight.semibold,
    color: colors.text,
    lineHeight: 1.35,
    // Keep every card's title block the same height so the footers line up.
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  interBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: space.sm,
    marginTop: 'auto',
  },
  rating: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: space.xs,
    fontSize: font.size.md,
    fontWeight: font.weight.semibold,
    color: colors.text,
  },
  star: {
    color: colors.ink,
  },
  noRating: {
    fontSize: font.size.sm,
    color: colors.textFaint,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: space.xs,
  },
  stepsLink: {
    ...button.secondary,
  },
  favBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    lineHeight: 0,
    borderRadius: radius.sm,
  },
  heart: {
    width: '26px',
    height: '26px',
    display: 'block',
  },
}
