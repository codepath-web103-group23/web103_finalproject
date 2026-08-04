import { Link } from 'react-router-dom'

const GuestNav = () => {
  const isLoginPage = location.pathname === '/login'
  const isHomePage1 = location.pathname === '/'
  const isHomePage2 = location.pathname === '/home'

  return (
    <div style={styles.guestBox}>
      <div style={styles.title}>EatRite</div>
      <div>
        {
          !isLoginPage &&
          <Link style={styles.btn} to="/login">Log in</Link>
        }
        {
          (!isHomePage1 && !isHomePage2) &&
          <Link style={styles.btn} to="/">Home</Link>
        }
      </div>
    </div>
  )
}

export default GuestNav

const styles ={
  guestBox: {
    display: 'flex',
    alignItems: 'center',
    border: 'solid black',
    borderWidth: '2px',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100px',
    gap: '10px',
    paddingRight: '10px',
    marginBottom: '5px',
  },
  title: {
    fontSize: '40px',
    fontWeight: '700',
    color: 'black',
    margin: '5px',
    backgroundColor: 'white',
    borderRadius: '5px',
    padding: '10px',
  },
  btn: {
    // backgroundColor: "#27F561",
    fontSize: '15px',
    color: 'black',
    border: 'solid black',
    padding: '20px',
    borderRadius: '5px',
    borderWidth: '1px',
    textDecoration: 'none',
    margin: '10px',
  },
}
