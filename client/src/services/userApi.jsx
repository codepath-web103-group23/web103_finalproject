const API_URL = `${import.meta.env.VITE_API_URL}/api`

const getUser = async (id) => {
  try {
    const response = await fetch(`${API_URL}/users/${id}`)
    const data = response.json()
    return data
  } catch (err) {
    console.log(err)
  }
}

export default {
  getUser
}
