const API_URL = "http://localhost:3000"

const login = () => {
  console.log('login')
  window.location.href = `${API_URL}/auth/github`
}


export default {
  login
}
