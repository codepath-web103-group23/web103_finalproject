// Where an ingredient lives in the kitchen.
//
// The existing rows in the `ingredients` table are all storage locations
// (fridge, pantry, spice rack…), so this list extends that model rather than
// switching to food types — mixing "fridge" and "dairy" in one dropdown would
// leave the older rows uncategorizable.
//
// Shared by AddIngredient and EditIngredient so the two never drift.
export const INGREDIENT_CATEGORIES = [
  'fridge',
  'freezer',
  'pantry',
  'cabinet',
  'spice rack',
  'counter',
  'drawer',
  'shelf',
  'fruit bowl',
  'bread box',
  'cellar',
  'other',
]

export default INGREDIENT_CATEGORIES
