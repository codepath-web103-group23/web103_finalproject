import { useState, useEffect } from 'react'
import { useRoutes, Link, useLocation } from 'react-router-dom'
import Nav from './components/Nav.jsx'
import Home from './pages/Home.jsx'
import Kitchen from './pages/Kitchen.jsx'
import AddIngredient from './pages/AddIngredient.jsx'
import EditIngredient from './pages/EditIngredient.jsx'
import Login from './pages/Login.jsx'
import Profile from './pages/Profile.jsx'
import EditPreferences from './pages/EditPreferences.jsx'
import Recipe from './pages/Recipe.jsx'
import Calendar from './pages/Calendar.jsx'
import Admin from './pages/Admin.jsx'
import Loading from './components/Loading.jsx'
import GuestNav from './components/GuestNav.jsx'

function App() {
  const [checkingUser, setCheckingUser] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [user, setUser] = useState({})
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'

  const API_URL = import.meta.env.VITE_API_URL

  const getUser = async () => {
      console.log("starting auth check")
    try {
      setCheckingUser(true)

      const response = await fetch(
        `${API_URL}/auth/login/success`, { credentials: 'include' } )

      console.log("auth response:", response.status)

      if (!response.ok) {
        setUser(null)
        setLoggedIn(false)
        return
      }

      const json = await response.json()

      console.log("auth received, user:", json)

      setUser(json.user)
      setLoggedIn(true)
    } finally {
      setCheckingUser(false)
      console.log("finished auth check")
    }
  }

  useEffect(() => {
    getUser()
  }, []); 

  let routes = useRoutes([
    {
      path: '/',
      element: <Home user={user} />
    },
    {
      path: '/home',
      element: <Home user={user} />
    },
    {
      path: '/kitchen',
      element: user && user.id 
        ? <Kitchen user={user} /> 
        : <Login api_url={API_URL} />
    },
    {
      path: '/addIngredient',
      element: user && user.id 
        ? <AddIngredient user={user} api_url={API_URL} /> 
        : <Login api_url={API_URL} />
    },
    {
      path: '/editIngredient/:id',
      element: user && user.id 
        ? <EditIngredient user={user} api_url={API_URL} /> 
        : <Login api_url={API_URL} />
    },
    {
      path: '/profile',
      element: user && user.id
      ? <Profile user={user}></Profile>
      : <Login></Login>
    },
    {
      path: '/login',
      element: <Login api_url={API_URL} />
    },
    {
      path:'/edit/preferences',
      element: user && user.id
      ? <EditPreferences user={user}></EditPreferences>
      : <Login></Login>
    },
    {
      path: '/recipe/:id',
      element: user && user.id
      ? <Recipe></Recipe>
      : <Login></Login>
    },
    {
      path: '/calendar',
      element: user && user.id
      ? <Calendar></Calendar>
      : <Login></Login>
    },
    {
      path: '/admin',
      element: user && user.is_admin
      ? <Admin></Admin>
      : <Login></Login>
    },
  ])

  return (
    <div>
      {
        (loggedIn && !isLoginPage && !checkingUser) ? 
      <Nav user={user}></Nav> : (!isLoginPage && checkingUser) ?
      <Loading></Loading> : <GuestNav></GuestNav>
      }
      
      {/* guest nav */}
      {/* { !loggedIn && !isLoginPage && checkingUser && ( */}
      {/*   <div style={guestBarStyle}> */}
      {/*     <span style={{ fontWeight: 700 }}>EatRite</span> */}
      {/*     <Link to="/login" style={guestLinkStyle}>Log in</Link> */}
      {/*   </div> */}
      {/* ) */}
      {/* } */}

      {routes}
    </div>
  )
}

export default App

const guestBarStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  border: 'solid black',
  borderWidth: '2px',
  height: '60px',
  padding: '0 20px',
  marginBottom: '5px',
  fontSize: '20px',
}

const guestLinkStyle = {
  textDecoration: 'none',
  color: 'black',
  border: 'solid black',
  borderWidth: '1px',
  borderRadius: '5px',
  padding: '8px 16px',
}
