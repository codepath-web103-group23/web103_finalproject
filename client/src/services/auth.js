const API_URL = import.meta.env.VITE_API_URL

const login = () => {
  window.location.href = `${API_URL}/auth/github`
}

const logout = async () => {
  const url = `${API_URL}/auth/logout`
  const response = await fetch(url, { credentials: 'include' })
  const json = await response.json()
  window.location.href='/login'
}

export default {
  login,
  logout
}
