import Ingredient from '../components/Ingredient.jsx'
import Search from '../components/SearchBar.jsx'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

const Kitchen = () => {
  const [selectedItem, setSelectedItem] = useState(null);

  const [ingredients, setIngredients] = useState([
    {
      name: "Eggs",
      zone: "Refrigerator",
      quantity: 12,
    },
    {
      name: "Rice",
      zone: "Pantry",
      quantity: "5 lbs",
    },
  ]);

  const navigate = useNavigate()


  const handleAddItem = () => {
    navigate('/addIngredient')
  }

  return (
    <div>
      {/* <div style={styles.topContainer}> */}
      {/*   <h1>My Kitchen</h1> */}
      {/*   <button style={styles.addButton}>+Add Ingredient</button> */}
      {/* </div> */}
      {/* <div style={styles.ingredContainer}> */}
      {/*   <Ingredient></Ingredient> */}
      {/*   <Ingredient></Ingredient> */}
      {/**/}
      {/* </div> */}

      <h1 style={styles.pageTitle}>My Kitchen</h1>
      
      <div style={styles.topContainer}>
        <label style={styles.tableTitle}>Inventory</label>
        <div style={styles.innerTopCont}>
          {/* <Search */}
          {/*   items={ingredients} */}
          {/*   onSelect={setSelectedItem} */}
          {/* ></Search> */}
          <button style={styles.addbtn} onClick={handleAddItem}>+Add Ingredient</button>
        </div>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.header}>Ingredient Name</th>
            <th style={styles.header}>Storage Zone</th>
            <th style={styles.header}>Quantity</th>
          </tr>
        </thead>

        <tbody>
          {ingredients.map((ingredient) => (
            <tr key={ingredient.name}>
              <td style={styles.cell}>{ingredient.name}</td>
              <td style={styles.cell}>{ingredient.zone}</td>
              <td>{ingredient.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  )
}

export default Kitchen

const styles = {
  pageTitle: {
    marginLeft: '10px',
  },
  topContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px',
  },
  innerTopCont: {
    // padding: '10px',
  },
  addbtn: {
    cursor: 'pointer',
    marginLeft: '5px',
    fontSize: '15px',
    width: '250px',
    backgroundColor: '#333333',
    color: 'white',
    border: 'solid black',
    padding: '10px',
    borderRadius: '5px',
    borderWidth: '1px',
    textDecoration: 'none',
  },
  addButton: {
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
  ingredContainer: {
    display: 'flex',
    // padding: '15px',
    gap: '15px',
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  header: {
    backgroundColor: "#333",
    color: "white",
    padding: "12px",
    textAlign: "left",
  },
  cell: {
    border: "1px solid #ddd",
    padding: "12px",
  },
  tableTitle: {
    fontSize: '30px',
  }

}
