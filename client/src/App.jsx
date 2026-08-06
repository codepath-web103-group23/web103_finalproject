import { useState, useEffect } from 'react'
import { useRoutes, useLocation, Navigate } from 'react-router-dom'
import Nav from './components/Nav.jsx'
import Home from './pages/Home.jsx'
import Kitchen from './pages/Kitchen.jsx'
import AddIngredient from './pages/AddIngredient.jsx'
import EditIngredient from './pages/EditIngredient.jsx'
import Login from './pages/Login.jsx'
import Profile from './pages/Profile.jsx'
import EditPreferences from './pages/EditPreferences.jsx'
import Recipe from './pages/Recipe.jsx'

import Instructions from './pages/Instructions.jsx'
import AddRecipe from './pages/AddRecipe.jsx'
import EditRecipe from './pages/EditRecipe.jsx'
import Calendar from './pages/Calendar.jsx'
import Admin from './pages/Admin.jsx'
import GuestNav from './components/GuestNav.jsx'
import NavShell from './components/NavShell.jsx'
import { page } from './styles/theme.js'

function App() {
  // Starts true so the first paint shows the neutral nav shell rather than
  // flashing GuestNav at an already-logged-in user.
  const [checkingUser, setCheckingUser] = useState(true)
  const [loggedIn, setLoggedIn] = useState(false)
  const [user, setUser] = useState({})
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'

  const API_URL = import.meta.env.VITE_API_URL

  const getUser = async () => {
    try {
      setCheckingUser(true)

      const response = await fetch(
        `${API_URL}/auth/login/success`, { credentials: 'include' } )

      if (!response.ok) {
        setUser(null)
        setLoggedIn(false)
        return
      }

      const json = await response.json()

      setUser(json.user)
      setLoggedIn(true)
    } finally {
      setCheckingUser(false)
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
      : <Navigate to='/login'/> 
    },
    {
      path: '/addRecipe',
      element: user && user.id
      ? <AddRecipe user={user} />
      : <Login api_url={API_URL} />
    },
    {
      path: '/recipe/:id/instructions',
      element: user && user.id
      ? <Instructions></Instructions>
      : <Navigate to='/login'/>
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
    {
      path: 'edit/recipe/:id',
      element: user && user.id
      ? <EditRecipe></EditRecipe>
      : <Login></Login>
    },
  ])

  // The login page carries its own branding, so it gets no nav at all. While
  // the session check is in flight we render the empty shell — same height and
  // brand as the real nav, so the header never jumps once auth resolves.
  const renderNav = () => {
    if (isLoginPage) return null
    if (checkingUser) return <NavShell />
    return loggedIn ? <Nav user={user} /> : <GuestNav />
  }

  return (
    <div style={styles.app}>
      {renderNav()}
      <main style={isLoginPage ? undefined : styles.page}>{routes}</main>
    </div>
  )
}

export default App

const styles = {
  app: {
    minHeight: '100svh',
    display: 'flex',
    flexDirection: 'column',
  },
  page: {
    ...page,
    width: '100%',
    flex: 1,
  },
}
