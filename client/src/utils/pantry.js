// Compares a recipe's ingredients against what the user has in their kitchen.
//
// Shared by the Recipe page and cook mode so the two can never disagree about
// whether you have something.
//
// Quantities are only compared when the units match. A kitchen row of "2 pcs"
// says nothing about a recipe wanting "400 g", so rather than invent a
// conversion we treat it as present and flag the amount as unknown — the same
// rule the cook endpoint uses when deducting stock.

export const HAVE = 'have'
export const LOW = 'low'
export const UNKNOWN = 'unknown'
export const MISSING = 'missing'

export const buildPantry = (kitchenRows) => {
  const map = new Map()
  for (const row of kitchenRows ?? []) {
    map.set(Number(row.ingredient_id), row)
  }
  return map
}

export const statusFor = (pantry, ingredient) => {
  const stock = pantry.get(Number(ingredient.ingredient_id ?? ingredient.id))
  if (!stock) return MISSING

  const sameUnit =
    (stock.unit ?? '').trim().toLowerCase() === (ingredient.unit ?? '').trim().toLowerCase()

  // pg returns NUMERIC as a string, so coerce before comparing.
  if (stock.quantity == null || !sameUnit) return UNKNOWN

  return Number(stock.quantity) >= Number(ingredient.quantity ?? 0) ? HAVE : LOW
}

// Anything not outright missing counts toward "you have N of M" — a low or
// unmeasurable amount is still something in the cupboard.
export const summarise = (pantry, ingredients) => {
  const statuses = (ingredients ?? []).map((i) => statusFor(pantry, i))
  return {
    statuses,
    total: statuses.length,
    have: statuses.filter((s) => s !== MISSING).length,
    missing: statuses.filter((s) => s === MISSING).length,
  }
}

export const LABELS = {
  [HAVE]: 'In your kitchen',
  [LOW]: 'Not enough',
  [UNKNOWN]: 'In your kitchen',
  [MISSING]: 'Missing',
}
