import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api.jsx'

const units = [
  'unit', 'g', 'kg', 'oz', 'lb', 'cup', 'cups', 'tbsp', 'tsp',
  'ml', 'l', 'whole', 'cloves', 'slices', 'can', 'pinch'
]

const emptyDraft = {
  ingredient_id: '',
  quantity: '',
  unit: ''
}

const AddRecipe = () => {
  const [recipe, setRecipe] = useState({
    title: '',
    description: '',
    instructions: '',
    image_url: ''
  })

  // every ingredient in the DB - fills the dropdown
  const [allIngredients, setAllIngredients] = useState([])
  // the rows the user has added so far - these become recipe_ingredients
  const [rows, setRows] = useState([])
  // the row currently being filled in, before it is added to `rows`
  const [draft, setDraft] = useState(emptyDraft)
  const [error, setError] = useState('')

  const navigate = useNavigate()

  useEffect(() => {
    const loadIngredients = async () => {
      const data = await api.getIngredients()
      setAllIngredients(data ?? [])
    }

    loadIngredients()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setRecipe((prev) => {
      return {
        ...prev,
        [name]: value
      }
    })
  }

  const handleDraftChange = (event) => {
    const { name, value } = event.target
    setDraft((prev) => {
      return {
        ...prev,
        [name]: value
      }
    })
  }

  const addRow = () => {
    if (!draft.ingredient_id) {
      setError('Pick an ingredient before adding it.')
      return
    }

    // spread into a NEW array - pushing would not re-render
    setRows((prev) => [...prev, draft])
    setDraft(emptyDraft)
    setError('')
  }

  const removeRow = (index) => {
    setRows((prev) => prev.filter((row, i) => i !== index))
  }

  const nameFor = (ingredientId) => {
    const match = allIngredients.find((i) => String(i.id) === String(ingredientId))
    return match ? match.name : 'Unknown ingredient'
  }

  const handleCancel = () => {
    navigate('/kitchen')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!recipe.title.trim()) {
      setError('A recipe needs a title.')
      return
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ recipe, ingredients: rows })
    }

    const created = await api.createRecipe(options)

    if (created && created.id) {
      navigate(`/recipe/${created.id}`)
    } else {
      setError('Could not save the recipe. Check the server logs.')
    }
  }

  return (
    <div>
      <h1 style={styles.title}>Add Recipe</h1>
      <div style={styles.formContainer}>
        <form onSubmit={handleSubmit}>

          <label htmlFor="title">Recipe Title:</label>
          <input
            id='title'
            name='title'
            type="text"
            value={recipe.title}
            onChange={handleChange}
            style={styles.input}
          />
          <br />

          <label htmlFor="image_url">Image URL:</label>
          <input
            id='image_url'
            name='image_url'
            type="text"
            value={recipe.image_url}
            onChange={handleChange}
            style={styles.wideInput}
          />
          <br />

          <label htmlFor="description">Description:</label>
          <textarea
            id='description'
            name='description'
            value={recipe.description}
            onChange={handleChange}
            style={styles.shortText}
          />
          <br />

          <label htmlFor="instructions">Instructions (one step per line):</label>
          <textarea
            id='instructions'
            name='instructions'
            value={recipe.instructions}
            onChange={handleChange}
            style={styles.textInput}
          />

          <hr style={styles.divider} />

          <label style={styles.sectionTitle}>Ingredients</label>

          <div style={styles.draftRow}>
            <select
              id='ingredient_id'
              name='ingredient_id'
              value={draft.ingredient_id}
              onChange={handleDraftChange}
              style={styles.select}
            >
              <option value=''>-- pick an ingredient --</option>
              {allIngredients.map((ingredient) => (
                <option key={ingredient.id} value={ingredient.id}>
                  {ingredient.name}
                </option>
              ))}
            </select>

            <input
              id='quantity'
              name='quantity'
              type="number"
              min="0"
              step="0.01"
              placeholder="qty"
              value={draft.quantity}
              onChange={handleDraftChange}
              style={styles.qtyInput}
            />

            <select
              id='unit'
              name='unit'
              value={draft.unit}
              onChange={handleDraftChange}
              style={styles.unitSelect}
            >
              <option value=''>unit</option>
              {units.map((unit) => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>

            <button type="button" onClick={addRow} style={styles.addRowBtn}>
              Add
            </button>
          </div>

          <div style={styles.rowList}>
            {rows.length === 0 && (
              <p style={styles.empty}>No ingredients added yet.</p>
            )}
            {rows.map((row, index) => (
              <div key={index} style={styles.row}>
                <span>{nameFor(row.ingredient_id)}</span>
                <span style={styles.rowAmount}>
                  {row.quantity} {row.unit}
                </span>
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  style={styles.removeBtn}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <div style={styles.btnBox}>
            <button type="submit" style={styles.btn1}>Save</button>
            <button type="button" style={styles.btn2} onClick={handleCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddRecipe

const styles = {
  title: {
    display: 'block',
    fontSize: '30',
    marginBottom: '1px',
  },
  formContainer: {
    border: 'solid black',
    backgroundColor: '#fafafa',
    borderRadius: '15px',
    display: 'flex',
    padding: '20px',
    fontWeight: 'bold',
    width: '700px',
    marginTop: '0px',
  },
  input: {
    display: 'block',
    width: '300px',
    height: '30px',
    borderRadius: '5px',
  },
  wideInput: {
    display: 'block',
    width: '600px',
    height: '30px',
    borderRadius: '5px',
  },
  shortText: {
    display: 'block',
    width: '600px',
    height: '80px',
    borderRadius: '5px',
  },
  textInput: {
    display: 'block',
    width: '600px',
    height: '180px',
    borderRadius: '5px',
  },
  divider: {
    marginTop: '20px',
    marginBottom: '15px',
  },
  sectionTitle: {
    display: 'block',
    fontSize: '20px',
    marginBottom: '10px',
  },
  draftRow: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  select: {
    width: '240px',
    height: '32px',
    borderRadius: '5px',
  },
  qtyInput: {
    width: '90px',
    height: '30px',
    borderRadius: '5px',
  },
  unitSelect: {
    width: '110px',
    height: '32px',
    borderRadius: '5px',
  },
  addRowBtn: {
    cursor: 'pointer',
    height: '34px',
    padding: '0 18px',
    fontWeight: 'bold',
    backgroundColor: '#333333',
    color: 'white',
    border: 'solid black',
    borderWidth: '1px',
    borderRadius: '5px',
  },
  rowList: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: '15px',
    width: '600px',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    padding: '8px 4px',
    borderBottom: '1px solid #ddd',
    fontWeight: 'normal',
  },
  rowAmount: {
    marginLeft: 'auto',
    marginRight: '15px',
    fontWeight: 'bold',
  },
  removeBtn: {
    cursor: 'pointer',
    border: 'solid black',
    borderWidth: '1px',
    borderRadius: '5px',
    background: 'none',
    padding: '4px 10px',
  },
  empty: {
    fontWeight: 'normal',
    color: '#666',
  },
  error: {
    color: '#d92d3c',
    marginTop: '15px',
  },
  btnBox: {
    display: 'flex',
    gap: '10px',
  },
  btn1: {
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '150px',
    height: '50px',
    fontSize: '15px',
    fontWeight: 'bold',
    backgroundColor: '#333333',
    color: 'white',
    border: 'solid black',
    padding: '20px',
    borderRadius: '5px',
    borderWidth: '1px',
    textDecoration: 'none',
    marginTop: '20px',
    marginRight: '20px',
  },
  btn2: {
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '150px',
    height: '50px',
    fontSize: '15px',
    fontWeight: 'bold',
    color: 'black',
    border: 'solid black',
    padding: '20px',
    borderRadius: '5px',
    borderWidth: '1px',
    textDecoration: 'none',
    marginTop: '20px',
    marginRight: '20px',
  },
}