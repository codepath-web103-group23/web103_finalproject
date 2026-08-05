import { useState } from 'react'
import { Link } from 'react-router-dom'
import favoritesApi from '../services/favoritesApi.js'
import trash from '../assets/trash-icon.svg'
import { useToast } from './Toast.jsx'
import { card, colors, font, radius, space } from '../styles/theme.js'

// A favorited recipe on the profile page. Same shape as the Home card, but the
// action is "remove from favorites" rather than a heart toggle.
function ProfileIngrCard ({ id, title, image_url, avg_rating, refresh }) {
  const [removing, setRemoving] = useState(false)
  const [imgFailed, setImgFailed] = useState(false)
  const toast = useToast()

  const rating = avg_rating == null ? null : Number(avg_rating)
  const hasRating = rating != null && !Number.isNaN(rating)
  const showImage = image_url && !imgFailed

  const deleteFavorite = async () => {
    setRemoving(true)
    try {
      await favoritesApi.deleteFavorite(id)
      refresh(id, 'fav')
      toast.success('Removed from favorites')
    } catch (err) {
      toast.error("Couldn't remove that favorite.")
      setRemoving(false)
    }
  }

  return (
    <article style={styles.container} className="card">
      <Link to={`/recipe/${id}`} style={styles.imgLink}>
        {showImage ? (
          <img
            src={image_url}
            alt={title}
            style={styles.img}
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div style={styles.imgFallback} role="img" aria-label={`${title} — no photo available`}>
            <span style={styles.fallbackMark} aria-hidden="true">🍽️</span>
          </div>
        )}
      </Link>

      <div style={styles.body}>
        <Link to={`/recipe/${id}`} style={styles.titleLink}>
          <h3 style={styles.title}>{title}</h3>
        </Link>

        <div style={styles.interBox}>
          {hasRating ? (
            <span style={styles.rating}>
              <span aria-hidden="true">★</span> {rating.toFixed(1)}
            </span>
          ) : (
            <span style={styles.noRating}>Not rated yet</span>
          )}

          <button
            type="button"
            onClick={deleteFavorite}
            disabled={removing}
            style={styles.button}
            className="btn"
            aria-label={`Remove ${title} from favorites`}
          >
            <img src={trash} alt="" style={styles.icon} />
          </button>
        </div>
      </div>
    </article>
  )
}

export default ProfileIngrCard;

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
  },
  img: {
    display: 'block',
    width: '100%',
    height: '160px',
    objectFit: 'cover',
    background: colors.surfaceAlt,
  },
  imgFallback: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '160px',
    background: colors.surfaceAlt,
    borderBottom: `1px solid ${colors.border}`,
  },
  fallbackMark: {
    fontSize: '26px',
    opacity: 0.7,
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.sm,
    padding: space.md,
    flex: 1,
  },
  titleLink: {
    textDecoration: 'none',
    color: 'inherit',
  },
  title: {
    margin: 0,
    fontSize: font.size.md,
    fontWeight: font.weight.semibold,
    lineHeight: 1.35,
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
    fontSize: font.size.sm,
    fontWeight: font.weight.semibold,
  },
  noRating: {
    fontSize: font.size.xs,
    color: colors.textFaint,
  },
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '34px',
    height: '34px',
    padding: 0,
    background: 'none',
    border: `1px solid ${colors.border}`,
    borderRadius: radius.sm,
    cursor: 'pointer',
  },
  icon: {
    width: '16px',
    height: '16px',
    display: 'block',
  },
}
