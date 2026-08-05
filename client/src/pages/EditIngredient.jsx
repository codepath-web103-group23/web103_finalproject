import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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
import { INGREDIENT_CATEGORIES } from '../constants/categories.js'

const EditIngredient = () => {
  // Starts empty, so every input needs a `?? ''` fallback until the fetch
  // lands — otherwise React flips them from uncontrolled to controlled.
  const [ingredient, setIngredient] = useState({})
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    const loadIngredient = async () => {
      setLoading(true)
      try {
        const data = await api.getIngredient(id)
        setIngredient(data ?? {})
      } catch (err) {
        setLoadError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadIngredient()
  }, [id])

  const handleChange = (event) => {
    const { name, value } = event.target
    setIngredient((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev))
  }

  const validate = () => {
    const next = {}
    if (!(ingredient.name ?? '').trim()) next.name = 'Give the ingredient a name.'
    if (ingredient.calories !== '' && Number(ingredient.calories) < 0) {
      next.calories = 'Calories cannot be negative.'
    }
    return next
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError(null)

    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) {
      toast.error('Please fix the highlighted fields.')
      return
    }

    setSubmitting(true)
    try {
      await api.updateIngredient(id, ingredient)
      toast.success('Ingredient updated')
      navigate('/kitchen')
    } catch (err) {
      setFormError(err.message)
      toast.error("Couldn't save your changes.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <Loading label="Loading ingredient…" size="lg" />
  }

  return (
    <FormPage title="Edit ingredient" subtitle="Update the details you keep on this item.">
      <Form onSubmit={handleSubmit}>
        <FormError message={loadError ?? formError} />

        <Field id="name" label="Ingredient name" error={errors.name} required>
          <TextInput
            id="name"
            name="name"
            type="text"
            value={ingredient.name ?? ''}
            onChange={handleChange}
            disabled={submitting}
            error={errors.name}
          />
        </Field>

        <Field id="category" label="Category">
          <Select
            id="category"
            name="category"
            value={ingredient.category ?? ''}
            onChange={handleChange}
            disabled={submitting}
          >
            <option value="">Select a category…</option>
            {INGREDIENT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Select>
        </Field>

        <Field id="calories" label="Calories" hint="Per serving." error={errors.calories}>
          <TextInput
            id="calories"
            name="calories"
            type="number"
            min="0"
            value={ingredient.calories ?? ''}
            onChange={handleChange}
            disabled={submitting}
            error={errors.calories}
          />
        </Field>

        <Field id="dietary_tags" label="Nutritional / dietary info">
          <TextArea
            id="dietary_tags"
            name="dietary_tags"
            value={ingredient.dietary_tags ?? ''}
            onChange={handleChange}
            disabled={submitting}
          />
        </Field>

        <FormActions>
          <SubmitButton submitting={submitting}>Save changes</SubmitButton>
          <SecondaryButton onClick={() => navigate('/kitchen')} disabled={submitting}>
            Cancel
          </SecondaryButton>
        </FormActions>
      </Form>
    </FormPage>
  )
}

export default EditIngredient
