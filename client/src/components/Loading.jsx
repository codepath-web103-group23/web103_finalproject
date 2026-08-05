import loadingsvg from '../assets/loadingbig.svg'

const Loading = () => {
  return (
    <div style={styles.body}>
      <div style={styles.title}>EatRite</div>
      <div style={styles.loadingBox}>
        <p style={styles.loading}>Loading</p>
        <img style={styles.img} src={loadingsvg}/>
      </div>
    </div>
  )
}

export default Loading

const styles = {
  body: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    border: '2px solid black',
    height: '100px',
    fontSize: '30px',
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
  img: {
    display: 'block',
    height: '80px',
  },
  loadingBox: {
    display: 'flex',
    gap: 1,
    alignItems: 'center',
    marginRight: '50px',
    // border: '2px solid black',
  },
  loading: {
    marginRight: '0px',
    fontSize: '30px',
    color: '#666a6e',
    // animation: 'pulse 1.5s infinite',
  }
}
