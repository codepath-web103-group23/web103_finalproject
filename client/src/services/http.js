const API_URL = `${import.meta.env.VITE_API_URL}/api`

// Shared fetch wrapper.
//
// The service functions used to `catch (err) { console.log(err) }` and return
// undefined, and none of them checked `response.ok` — so a 401 or a 500 looked
// exactly like success to the caller and the UI had nothing to react to. This
// throws instead, which lets pages show a real error state or a toast.
export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export const request = async (path, options = {}) => {
  const { body, headers, ...rest } = options

  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      credentials: 'include',
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      ...rest,
    })
  } catch (err) {
    // Network-level failure — no response at all.
    throw new ApiError('Network error. Check your connection and try again.', 0)
  }

  // 204 and empty bodies are valid successes with nothing to parse.
  const text = await response.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      // The SPA catch-all can return index.html for an unmatched /api route,
      // which lands here as an HTML parse failure rather than a 404.
      if (response.ok) {
        throw new ApiError('Unexpected response from the server.', response.status)
      }
    }
  }

  if (!response.ok) {
    const message =
      (data && (data.error || data.message)) ||
      (response.status === 401
        ? 'You need to be logged in to do that.'
        : `Request failed (${response.status}).`)
    throw new ApiError(message, response.status)
  }

  return data
}

export default request
