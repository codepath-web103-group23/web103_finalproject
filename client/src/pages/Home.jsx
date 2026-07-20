import React from 'react'
import Card from '../components/Card.jsx'
import Search from '../components/SearchBar.jsx'
import pizzaimage from "../assets/pizza_image.jpg"
import fourstar from "../assets/fourstar.png"

const Home = () => {

  return (
    <div>
      <div style={styles.titleBox}>
        <h1 style={styles.filterTitle}>Recipe Results</ h1>
      </div>
      <div style={styles.filterBox}>
        
        <div style={styles.dropdownBox}>
          <div style={styles.dropdown}>
            <label style={styles.label}>Sort by Rating:</label>
            <select style={styles.select}>
              <option>1 star</option>
              <option>2 star</option>
              <option>3 star</option>
              <option>4 star</option>
            </select>
          </div>
          <div style={styles.dropdown}>
            <label style={styles.label}>Sort by Date:</label>
            <select style={styles.select}>
              <option>Newest</option>
              <option>Oldest</option>
            </select>
          </div>
        </div>

        <Search></Search>

      </div>
      <div style={styles.feed}>
        <Card title="pizza" image_url={pizzaimage} num_stars={4}></Card>
        <Card title="pizza" image_url={pizzaimage} num_stars={4}></Card>
        <Card title="pizza" image_url={pizzaimage} num_stars={4}></Card>
        <Card title="pizza" image_url={pizzaimage} num_stars={4}></Card>
        <Card title="pizza" image_url={pizzaimage} num_stars={4}></Card>
        <Card title="pizza" image_url={pizzaimage} num_stars={4}></Card>
        <Card title="pizza" image_url={pizzaimage} num_stars={4}></Card>
        <Card title="pizza" image_url={pizzaimage} num_stars={4}></Card>
        <Card title="pizza" image_url={pizzaimage} num_stars={4}></Card>
        <Card title="pizza" image_url={pizzaimage} num_stars={4}></Card>
        <Card title="pizza" image_url={pizzaimage} num_stars={4}></Card>
        <Card title="pizza" image_url={pizzaimage} num_stars={4}></Card>
        <Card title="pizza" image_url={pizzaimage} num_stars={4}></Card>
        <Card title="pizza" image_url={pizzaimage} num_stars={4}></Card>
        <Card title="pizza" image_url={pizzaimage} num_stars={4}></Card>
        <Card title="pizza" image_url={pizzaimage} num_stars={4}></Card>
        <Card title="pizza" image_url={pizzaimage} num_stars={4}></Card>
        <Card title="pizza" image_url={pizzaimage} num_stars={4}></Card>
        <Card title="pizza" image_url={pizzaimage} num_stars={4}></Card>
        <Card title="pizza" image_url={pizzaimage} num_stars={4}></Card>
      </div>
    </div>
  )
}

export default Home;

const styles = {
  titleBox: {
    textAlign: 'left',
    paddingLeft: '5px',
  },
  filterTitle: {
    fontSize: '20px',
    // height: '1px',
  },
  filterBox: {
    border: 'solid black',
    marginBottom: '20px',
    padding: '10px',
    display: 'flex',
    justifyContent: 'space-between',
  },
  selectBox: {
    fontSize: '20px',
    padding: '10px',
  },
  dropdownBox: {
    display: 'flex',
    gap: 20,
  },
  dropdown: {
    display: "flex",
    // flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
  label: {
    fontSize: "18px",
    fontWeight: "bold",
  },
  select: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  feed: {
    display: 'flex',
    flexWrap: 'wrap',
    padding: '10px',
  },
}
