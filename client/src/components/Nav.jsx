import { Link } from 'react-router-dom';

function Nav () {
  return (
    <div style={styles.nav}>
      <div style={styles.title}>EatRite</div>
      <div style={styles.btns}>
        <Link to="/" style={styles.btn}><strong>Home</strong></Link>
        <Link to="/kitchen" style={styles.btn}><strong>My Kitchen</strong></Link>
        <Link to="/calendar" style={styles.btn}><strong>Calendar</strong></Link>
        <Link to="/profile" style={styles.btn}><strong>Profile</strong></Link>
      </div>
    </div>
  );
}

export default Nav;

const styles = {
  nav: {
    // backgroundImage: `url(${navpattern})`,
    // backgroundColor: 'gray',
    display: 'flex',
    alignItems: 'center',
    border: 'solid black',
    borderWidth: '2px',
    justifyContent: 'space-between',
    height: '100px',
    gap: '10px',
    paddingRight: '10px',
    marginBottom: '5px',
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
  title: {
    fontSize: '40px',
    fontWeight: '700',
    color: 'black',
    margin: '5px',
    backgroundColor: 'white',
    borderRadius: '5px',
    padding: '10px',
  }

}
