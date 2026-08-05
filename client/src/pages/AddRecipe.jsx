import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api.jsx'
import Loading from '../components/Loading.jsx'
import { useToast } from '../components/Toast.jsx'
import {
  Field,
  Form,
  FormActions,
  FormError,
  FormPage,
  SecondaryButton,
  Select,
  SubmitButton,
  TextArea,
  TextInput,
} from '../components/Form.jsx'
import { button, colors, font, radius, space } from '../styles/theme.js'

const units = [
  'g', 'kg', 'oz', 'lb', 'cup', 'cups', 'tbsp', 'tsp',
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

  const [loadingIngredients, setLoadingIngredients] = useState(true)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    const loadIngredients = async () => {
      try {
        const data = await api.getIngredients()
        setAllIngredients(Array.isArray(data) ? data : [])
      } catch (err) {
        toast.error("Couldn't load the ingredient list.")
      } finally {
        setLoadingIngredients(false)
      }
    }

    loadIngredients()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setRecipe((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev))
  }

  const handleDraftChange = (event) => {
    const { name, value } = event.target
    setDraft((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => (prev.draft ? { ...prev, draft: undefined } : prev))
  }

  const addRow = () => {
    if (!draft.ingredient_id) {
      setErrors((prev) => ({ ...prev, draft: 'Pick an ingredient before adding it.' }))
      return
    }
    if (rows.some((r) => String(r.ingredient_id) === String(draft.ingredient_id))) {
      setErrors((prev) => ({ ...prev, draft: 'That ingredient is already on the list.' }))
      return
    }

    // spread into a NEW array - pushing would not re-render
    setRows((prev) => [...prev, draft])
    setDraft(emptyDraft)
    setErrors((prev) => ({ ...prev, draft: undefined }))
  }

  const removeRow = (index) => {
    setRows((prev) => prev.filter((row, i) => i !== index))
  }

  const nameFor = (ingredientId) => {
    const match = allIngredients.find((i) => String(i.id) === String(ingredientId))
    return match ? match.name : 'Unknown ingredient'
  }

  const validate = () => {
    const next = {}
    if (!recipe.title.trim()) next.title = 'A recipe needs a title.'
    if (!recipe.instructions.trim()) next.instructions = 'Add at least one step.'
    if (recipe.image_url.trim() && !/^https?:\/\//i.test(recipe.image_url.trim())) {
      next.image_url = 'Image URL must start with http:// or https://'
    }
    return next
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError(null)

    const found = validate()
    setErrors((prev) => ({ ...prev, ...found }))
    if (Object.keys(found).length > 0) {
      toast.error('Please fix the highlighted fields.')
      return
    }

    setSubmitting(true)
    try {
      const created = await api.createRecipe({ recipe, ingredients: rows })

      if (created && created.id) {
        toast.success(`"${recipe.title}" saved`)
        navigate(`/recipe/${created.id}`)
      } else {
        setFormError('The server saved no recipe. Please try again.')
      }
    } catch (err) {
      setFormError(err.message)
      toast.error("Couldn't save the recipe.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <FormPage title="Add recipe" subtitle="Share a dish and the ingredients it needs.">
      <Form onSubmit={handleSubmit}>
        <FormError message={formError} />

        <Field id="title" label="Recipe title" error={errors.title} required>
          <TextInput
            id="title"
            name="title"
            type="text"
            value={recipe.title}
            onChange={handleChange}
            disabled={submitting}
            error={errors.title}
          />
        </Field>

        <Field
          id="image_url"
          label="Image URL"
          hint="Optional. Leave blank and the card shows a placeholder."
          error={errors.image_url}
        >
          <TextInput
            id="image_url"
            name="image_url"
            type="url"
            placeholder="https://…"
            value={recipe.image_url}
            onChange={handleChange}
            disabled={submitting}
            error={errors.image_url}
          />
        </Field>

        <Field id="description" label="Description">
          <TextArea
            id="description"
            name="description"
            value={recipe.description}
            onChange={handleChange}
            disabled={submitting}
            style={{ minHeight: '90px' }}
          />
        </Field>

        <Field
          id="instructions"
          label="Instructions"
          hint="One step per line."
          error={errors.instructions}
          required
        >
          <TextArea
            id="instructions"
            name="instructions"
            value={recipe.instructions}
            onChange={handleChange}
            disabled={submitting}
            error={errors.instructions}
            style={{ minHeight: '200px' }}
          />
        </Field>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Ingredients</h2>

          {loadingIngredients ? (
            <Loading label="Loading ingredients…" />
          ) : (
            <>
              <div style={styles.draftRow}>
                <Select
                  id="ingredient_id"
                  name="ingredient_id"
                  value={draft.ingredient_id}
                  onChange={handleDraftChange}
                  disabled={submitting}
                  style={styles.ingredientSelect}
                  aria-label="Ingredient"
                >
                  <option value="">Pick an ingredient…</option>
                  {allIngredients.map((ingredient) => (
                    <option key={ingredient.id} value={ingredient.id}>
                      {ingredient.name}
                    </option>
                  ))}
                </Select>

                <TextInput
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Qty"
                  value={draft.quantity}
                  onChange={handleDraftChange}
                  disabled={submitting}
                  style={styles.qtyInput}
                  aria-label="Quantity"
                />

                <Select
                  id="unit"
                  name="unit"
                  value={draft.unit}
                  onChange={handleDraftChange}
                  disabled={submitting}
                  style={styles.unitSelect}
                  aria-label="Unit"
                >
                  <option value="">Unit</option>
                  {units.map((unit) => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </Select>

                <button
                  type="button"
                  className="btn"
                  onClick={addRow}
                  disabled={submitting}
                  style={styles.addRowBtn}
                >
                  Add
                </button>
              </div>

              {errors.draft && (
                <p style={styles.draftError} role="alert">{errors.draft}</p>
              )}

              <div style={styles.rowList}>
                {rows.length === 0 ? (
                  <p style={styles.empty}>No ingredients added yet.</p>
                ) : (
                  rows.map((row, index) => (
                    <div key={index} style={styles.row}>
                      <span style={styles.rowName}>{nameFor(row.ingredient_id)}</span>
                      <span style={styles.rowAmount}>
                        {row.quantity} {row.unit}
                      </span>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => removeRow(index)}
                        disabled={submitting}
                        style={styles.removeBtn}
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        <FormActions>
          <SubmitButton submitting={submitting}>Save recipe</SubmitButton>
          <SecondaryButton onClick={() => navigate('/kitchen')} disabled={submitting}>
            Cancel
          </SecondaryButton>
        </FormActions>
      </Form>
    </FormPage>
  )
}

export default AddRecipe

const styles = {
  section: {
    paddingTop: space.md,
    borderTop: `1px solid ${colors.border}`,
  },
  sectionTitle: {
    margin: `0 0 ${space.md}`,
    fontSize: font.size.lg,
    fontWeight: font.weight.semibold,
  },
  draftRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: space.sm,
    alignItems: 'center',
  },
  ingredientSelect: {
    flex: '2 1 200px',
    width: 'auto',
  },
  qtyInput: {
    flex: '0 1 100px',
    width: 'auto',
  },
  unitSelect: {
    flex: '0 1 120px',
    width: 'auto',
  },
  addRowBtn: {
    ...button.secondary,
  },
  draftError: {
    margin: `${space.sm} 0 0`,
    fontSize: font.size.xs,
    fontWeight: font.weight.semibold,
    color: colors.ink,
  },
  rowList: {
    marginTop: space.md,
    display: 'flex',
    flexDirection: 'column',
    gap: space.xs,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: space.sm,
    padding: `${space.sm} ${space.md}`,
    background: colors.surfaceAlt,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.md,
    fontSize: font.size.sm,
  },
  rowName: {
    flex: 1,
    fontWeight: font.weight.semibold,
  },
  rowAmount: {
    color: colors.textMuted,
  },
  removeBtn: {
    ...button.ghost,
    ...button.small,
    textDecoration: 'underline',
  },
  empty: {
    margin: 0,
    padding: `${space.md}`,
    fontSize: font.size.sm,
    color: colors.textFaint,
    border: `1px dashed ${colors.borderStrong}`,
    borderRadius: radius.md,
    textAlign: 'center',
  },
}
