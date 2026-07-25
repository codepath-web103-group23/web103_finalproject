import { useState } from 'react'
import { useRoutes, Link } from 'react-router-dom'
import Nav from './components/Nav.jsx'
import Home from './pages/Home.jsx'
import Kitchen from './pages/Kitchen.jsx'
import AddIngredient from './pages/AddIngredient.jsx'

function App() {
  
  let routes = useRoutes([
    {
      path:'/',
      element: <Home />
    },
    {
      path:'/kitchen',
      element: <Kitchen />
    },
    {
      path:'/addIngredient',
      element: <AddIngredient />
    },
  ])

  return (
    <div>
      <Nav></Nav>
      {routes}
    </div>
  )
}

export default App
