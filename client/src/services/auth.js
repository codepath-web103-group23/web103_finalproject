// const API_URL = "http://localhost:3000"
const API_URL = "https://web103-finalproject-5y81.onrender.com"

const login = () => {
  console.log('login')
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
