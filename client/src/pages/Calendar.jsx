import { useState } from 'react'
import leftC from '../assets/left-caret.png'
import rightC from '../assets/right-caret.png'

const Calendar = () => {
  const date = new Date();
  const [month, setMonth] = useState(date.toLocaleString('default', { month: 'short'}))
  // const [dows, setDows] = useState(
  //   Arrayfrom({ length: 31}, (_,i) =>)
  // )
  const [day, setDay] = useState(
    date.getDay()
  )

  const nextDay = () => {
    setDay(prev => (prev % 31) + 1)
  }

  const prevDay = () => {
    setDay(prev => prev === 1 ? 31 : prev-1)
  }

  return (
    <div style={styles.body}>

      <div style={styles.topBox}>
        <h1 style={styles.title}>Meal Calendar</h1>
        <div>
          <div style={styles.setDateBox}>
            <img 
              onClick={prevDay}
              src={leftC} 
              style={styles.caret}
            />
            <p style={styles.dowState}>{month} {day}</p>
            <img
              onClick={nextDay}
              src={rightC} 
              style={styles.caret}/>
          </div>
          <button style={styles.scheduleBtn}>+Schedule Meal</button>
        </div>


      </div>

      <div style={styles.grid}>
        <div style={styles.dow}>Monday</div>
        <div style={styles.dow}>Tuesday</div>
        <div style={styles.dow}>Wednesday</div>
        <div style={styles.dow}>Thursday</div>
        <div style={styles.dow}>Friday</div>
        <div style={styles.dow}>Saturday</div>
        <div style={styles.dow}>Sunday</div>

        {
          Array.from({ length: 31 }, (_, i) => (
            <div key={i+1} style={styles.day}>{i+1}</div>
          ))
        }

      </div>



    </div> 
  )
}

export default Calendar

const styles = {
  body: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginLeft: '30px',
  },
  scheduleBtn: {
    cursor: 'pointer',
    marginRight: '30px',
    fontSize: '15px',
    backgroundColor: '#333333',
    color: 'white',
    border: 'solid black',
    // padding: '20px',
    width: '200px',
    height: '45px',
    borderRadius: '5px',
    borderWidth: '1px',
    textDecoration: 'none',
    margin: '10px',
  },
  topBox: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    // paddingLeft: '100px',
    // paddingRight: '100px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7,150px)',
    gridTemplateRows: ' 30px repeat(5, 150px)',
    // border: 'solid black',
    marginTop: '20px',
  },
  dow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid black',
    borderRadius: '10px',
  }, 
  day: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: ' 1px solid black',
    borderRadius: '10px',
  },
  dowState: {
    fontSize: '20px',
    paddingLeft: '10px',

  },
  caret: {
    height: '20px',
    cursor: 'pointer',
  },
  setDateBox: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },

}
