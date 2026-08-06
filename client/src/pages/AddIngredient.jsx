import { useState, useEffect, useMemo } from 'react'
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
import { INGREDIENT_CATEGORIES } from '../constants/categories.js'
import { colors, font, radius, space } from '../styles/theme.js'

const AddIngredient = () => {
  // Two ways to stock the kitchen: pick something out of the shared catalog,
  // or describe a new ingredient. Picking used to be impossible — the server
  // created a brand-new ingredients row on every add, which is why the catalog
  // has "Tomato" twice.
  const [mode, setMode] = useState('catalog')

  const [ingredient, setIngredient] = useState({
    name: '',
    category: '',
    calories: '',
    dietary_tags: '',
    quantity: '',
    unit: ''
  });
  const [picked, setPicked] = useState({ ingredient_id: '', quantity: '', unit: '' })

  const [catalog, setCatalog] = useState([])
  const [loadingCatalog, setLoadingCatalog] = useState(true)
  const [search, setSearch] = useState('')

  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const data = await api.getIngredients()
        setCatalog(Array.isArray(data) ? data : [])
      } catch (err) {
        toast.error("Couldn't load the ingredient catalog.")
      } finally {
        setLoadingCatalog(false)
      }
    }
    loadCatalog()
  }, [])

  // Group the catalog by where it's kept so the picker isn't one long list.
  const grouped = useMemo(() => {
    const term = search.trim().toLowerCase()
    const matches = catalog.filter((i) =>
      term === '' || (i.name ?? '').toLowerCase().includes(term)
    )

    const byCategory = new Map()
    for (const item of matches) {
      const key = item.category?.trim() || 'other'
      if (!byCategory.has(key)) byCategory.set(key, [])
      byCategory.get(key).push(item)
    }

    for (const list of byCategory.values()) {
      list.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
    }

    return [...byCategory.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [catalog, search])

  const matchCount = grouped.reduce((sum, [, list]) => sum + list.length, 0)

  const handleChange = (event) => {
    const {name, value} = event.target
    setIngredient((prev) => ({ ...prev, [name]: value }))
    // Clear a field's error as soon as the user starts fixing it.
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev))
  }

  const handlePickedChange = (event) => {
    const { name, value } = event.target
    setPicked((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev))
  }

  const switchMode = (next) => {
    setMode(next)
    setErrors({})
    setFormError(null)
  }

  const validate = () => {
    const next = {}

    if (mode === 'catalog') {
      if (!picked.ingredient_id) next.ingredient_id = 'Pick an ingredient.'
      if (picked.quantity !== '' && Number(picked.quantity) < 0) {
        next.quantity = 'Quantity cannot be negative.'
      }
      return next
    }

    if (!ingredient.name.trim()) next.name = 'Give the ingredient a name.'
    if (!ingredient.category) next.category = 'Pick where you keep it.'
    if (ingredient.calories !== '' && Number(ingredient.calories) < 0) {
      next.calories = 'Calories cannot be negative.'
    }
    if (ingredient.quantity !== '' && Number(ingredient.quantity) < 0) {
      next.quantity = 'Quantity cannot be negative.'
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

    const payload = mode === 'catalog' ? picked : ingredient
    const label =
      mode === 'catalog'
        ? catalog.find((i) => String(i.id) === String(picked.ingredient_id))?.name ?? 'Ingredient'
        : ingredient.name

    setSubmitting(true)
    try {
      await api.addToKitchen(payload)
      toast.success(`${label} added to your kitchen`)
      navigate('/kitchen')
    } catch (err) {
      setFormError(err.message)
      toast.error("Couldn't add that ingredient.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <FormPage
      title="Add ingredient"
      subtitle="Track what you already have so recipes can match against it."
    >
      <div style={styles.tabs} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'catalog'}
          style={mode === 'catalog' ? { ...styles.tab, ...styles.tabActive } : styles.tab}
          onClick={() => switchMode('catalog')}
          disabled={submitting}
        >
          Choose from catalog
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'new'}
          style={mode === 'new' ? { ...styles.tab, ...styles.tabActive } : styles.tab}
          onClick={() => switchMode('new')}
          disabled={submitting}
        >
          Create new
        </button>
      </div>

      <Form onSubmit={handleSubmit}>
        <FormError message={formError} />

        {mode === 'catalog' ? (
          loadingCatalog ? (
            <Loading label="Loading catalog…" />
          ) : (
            <>
              <Field
                id="ingredient-search"
                label="Search the catalog"
                hint={`${matchCount} of ${catalog.length} ingredients`}
              >
                <TextInput
                  id="ingredient-search"
                  type="search"
                  placeholder="Type to filter…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  disabled={submitting}
                />
              </Field>

              <Field id="ingredient_id" label="Ingredient" error={errors.ingredient_id} required>
                <Select
                  id="ingredient_id"
                  name="ingredient_id"
                  value={picked.ingredient_id}
                  onChange={handlePickedChange}
                  disabled={submitting}
                  error={errors.ingredient_id}
                >
                  <option value="">Select an ingredient…</option>
                  {grouped.map(([category, items]) => (
                    <optgroup key={category} label={category}>
                      {items.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.name}
                          {i.calories != null ? ` — ${i.calories} cal` : ''}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </Select>
              </Field>

              <Field id="quantity" label="Quantity" error={errors.quantity}>
                <TextInput
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  value={picked.quantity}
                  onChange={handlePickedChange}
                  disabled={submitting}
                  error={errors.quantity}
                />
              </Field>

              <Field id="unit" label="Unit" hint="e.g. lbs, oz, cups">
                <TextInput
                  id="unit"
                  name="unit"
                  type="text"
                  placeholder="e.g. lbs, oz, cups"
                  value={picked.unit}
                  onChange={handlePickedChange}
                  disabled={submitting}
                />
              </Field>
            </>
          )
        ) : (
          <>
            <p style={styles.note}>
              This adds a new ingredient to the shared catalog everyone picks from — check the
              catalog tab first so you don’t create a duplicate.
            </p>

            <Field id="name" label="Ingredient name" error={errors.name} required>
              <TextInput
                id="name"
                name="name"
                type="text"
                value={ingredient.name}
                onChange={handleChange}
                disabled={submitting}
                error={errors.name}
              />
            </Field>

            <Field id="category" label="Category" error={errors.category} required>
              <Select
                id="category"
                name="category"
                value={ingredient.category}
                onChange={handleChange}
                disabled={submitting}
                error={errors.category}
              >
                <option value="">Select a category…</option>
                {INGREDIENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Select>
            </Field>

            <Field id="calories" label="Calories" hint="Per serving. Optional." error={errors.calories}>
              <TextInput
                id="calories"
                name="calories"
                type="number"
                min="0"
                value={ingredient.calories}
                onChange={handleChange}
                disabled={submitting}
                error={errors.calories}
              />
            </Field>

            <Field id="dietary_tags" label="Nutritional / dietary info">
              <TextArea
                id="dietary_tags"
                name="dietary_tags"
                value={ingredient.dietary_tags}
                onChange={handleChange}
                disabled={submitting}
              />
            </Field>

            <Field id="quantity" label="Quantity" error={errors.quantity}>
              <TextInput
                id="quantity"
                name="quantity"
                type="number"
                min="0"
                value={ingredient.quantity}
                onChange={handleChange}
                disabled={submitting}
                error={errors.quantity}
              />
            </Field>

            <Field id="unit" label="Unit" hint="e.g. lbs, oz, cups">
              <TextInput
                id="unit"
                name="unit"
                type="text"
                placeholder="e.g. lbs, oz, cups"
                value={ingredient.unit}
                onChange={handleChange}
                disabled={submitting}
              />
            </Field>
          </>
        )}

        <FormActions>
          <SubmitButton submitting={submitting} pendingLabel="Adding…">
            Add to kitchen
          </SubmitButton>
          <SecondaryButton onClick={() => navigate('/kitchen')} disabled={submitting}>
            Cancel
          </SecondaryButton>
        </FormActions>
      </Form>
    </FormPage>
  )
}

export default AddIngredient

const styles = {
  tabs: {
    display: 'flex',
    gap: space.xs,
    marginBottom: space.lg,
    padding: space.xs,
    background: colors.surfaceAlt,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.md,
    width: 'fit-content',
  },
  tab: {
    padding: `${space.sm} ${space.md}`,
    fontSize: font.size.sm,
    fontWeight: font.weight.semibold,
    fontFamily: 'inherit',
    color: colors.textMuted,
    background: 'transparent',
    border: '1px solid transparent',
    borderRadius: radius.sm,
    cursor: 'pointer',
  },
  tabActive: {
    background: colors.surface,
    color: colors.ink,
    borderColor: colors.border,
  },
  note: {
    margin: 0,
    padding: space.md,
    fontSize: font.size.sm,
    color: colors.textMuted,
    background: colors.surfaceAlt,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.md,
  },
}
