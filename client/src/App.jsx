import { useState } from 'react'
import { useRoutes, Link } from 'react-router-dom'
import Nav from './components/Nav.jsx'
import Home from './pages/Home.jsx'


function App() {
  
  let routes = useRoutes([
    {
      path:'/',
      element: <Home />
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
