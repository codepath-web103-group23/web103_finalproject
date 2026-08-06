// Unsplash serves the original upload when the URL carries no size parameters —
// typically 4000px wide and around 1.5 MB. A grid of 32 cards was pulling ~48 MB
// of images, which is why the home page crawled and appeared to re-load photos
// while scrolling.
//
// Unsplash's CDN resizes on demand, so asking for the display size cuts the same
// photo to roughly 58 KB. Anything that isn't an Unsplash URL is passed straight
// through untouched.
const UNSPLASH_HOSTS = ['images.unsplash.com', 'plus.unsplash.com']

export const sizedImage = (url, width = 600) => {
  if (!url) return url

  let parsed
  try {
    parsed = new URL(url)
  } catch {
    // Not an absolute URL — leave it alone rather than mangling it.
    return url
  }

  if (!UNSPLASH_HOSTS.includes(parsed.hostname)) return url

  // Respect any sizing the stored URL already specifies.
  if (parsed.searchParams.has('w')) return url

  parsed.searchParams.set('w', String(width))
  parsed.searchParams.set('q', '75')
  parsed.searchParams.set('fm', 'jpg')
  parsed.searchParams.set('fit', 'crop')

  return parsed.toString()
}

export default sizedImage
