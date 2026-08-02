// const API_URL = "http://localhost:3000/api"
const API_URL = "https://web103-finalproject-5y81.onrender.com/api"

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
