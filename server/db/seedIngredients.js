import { pool } from './dbpool.js'

// Fills out the shared `ingredients` catalog (the global list every user picks
// from when stocking their kitchen — NOT per-user kitchen rows).
//
// Idempotent: skips any name that already exists, case-insensitively, so it is
// safe to re-run and won't add another "Tomato" next to the one already there.
// It never updates or deletes existing rows.
//
//   cd server && node db/seedIngredients.js

const INGREDIENTS = [
  // fridge
  ['Milk', 'fridge', 103, 'dairy, vegetarian'],
  ['Eggs', 'fridge', 78, 'vegetarian, high-protein'],
  ['Cheddar Cheese', 'fridge', 113, 'dairy, vegetarian'],
  ['Greek Yogurt', 'fridge', 100, 'dairy, vegetarian, high-protein'],
  ['Carrot', 'fridge', 25, 'vegan, gluten-free'],
  ['Spinach', 'fridge', 7, 'vegan, gluten-free, iron'],
  ['Bell Pepper', 'fridge', 31, 'vegan, gluten-free'],
  ['Broccoli', 'fridge', 55, 'vegan, gluten-free'],
  ['Ground Beef', 'fridge', 250, 'high-protein'],
  ['Salmon Fillet', 'fridge', 208, 'pescatarian, omega-3'],
  ['Tofu', 'fridge', 76, 'vegan, gluten-free, high-protein'],

  // freezer
  ['Frozen Peas', 'freezer', 62, 'vegan, gluten-free'],
  ['Frozen Corn', 'freezer', 88, 'vegan, gluten-free'],
  ['Shrimp', 'freezer', 99, 'pescatarian, high-protein'],

  // pantry
  ['White Rice', 'pantry', 205, 'vegan, gluten-free'],
  ['Brown Rice', 'pantry', 216, 'vegan, gluten-free, whole-grain'],
  ['Spaghetti', 'pantry', 221, 'vegetarian'],
  ['Rolled Oats', 'pantry', 154, 'vegan, whole-grain'],
  ['Black Beans', 'pantry', 227, 'vegan, gluten-free, high-fiber'],
  ['Chickpeas', 'pantry', 269, 'vegan, gluten-free, high-fiber'],
  ['Canned Tomatoes', 'pantry', 32, 'vegan, gluten-free'],
  ['All-Purpose Flour', 'pantry', 455, 'vegetarian'],
  ['Olive Oil', 'pantry', 119, 'vegan, gluten-free'],
  ['Peanut Butter', 'pantry', 188, 'vegetarian, high-protein'],
  ['Honey', 'pantry', 64, 'vegetarian, gluten-free'],

  // spice rack
  ['Black Pepper', 'spice rack', 6, 'vegan, gluten-free'],
  ['Paprika', 'spice rack', 6, 'vegan, gluten-free'],
  ['Ground Cumin', 'spice rack', 8, 'vegan, gluten-free'],
  ['Cinnamon', 'spice rack', 6, 'vegan, gluten-free'],
  ['Dried Oregano', 'spice rack', 5, 'vegan, gluten-free'],
  ['Turmeric', 'spice rack', 9, 'vegan, gluten-free'],

  // cabinet
  ['Sugar', 'cabinet', 49, 'vegetarian, gluten-free'],
  ['Baking Powder', 'cabinet', 2, 'vegetarian, gluten-free'],
  ['Vegetable Stock', 'cabinet', 12, 'vegan'],

  // counter / fruit bowl / bread box
  ['Yellow Onion', 'counter', 44, 'vegan, gluten-free'],
  ['Garlic', 'counter', 4, 'vegan, gluten-free'],
  ['Potato', 'counter', 163, 'vegan, gluten-free'],
  ['Banana', 'fruit bowl', 105, 'vegan, gluten-free'],
  ['Lemon', 'fruit bowl', 17, 'vegan, gluten-free'],
  ['Avocado', 'fruit bowl', 240, 'vegan, gluten-free, healthy-fats'],
  ['Whole Wheat Bread', 'bread box', 81, 'vegetarian, whole-grain'],
  ['Tortillas', 'bread box', 144, 'vegetarian'],
]

const seed = async () => {
  let added = 0
  let skipped = 0

  for (const [name, category, calories, dietary_tags] of INGREDIENTS) {
    // No unique constraint on ingredients.name, so guard the insert ourselves.
    const { rows } = await pool.query(
      'SELECT id FROM ingredients WHERE LOWER(name) = LOWER($1)',
      [name]
    )

    if (rows.length > 0) {
      skipped++
      continue
    }

    await pool.query(
      `INSERT INTO ingredients (name, category, calories, dietary_tags)
       VALUES ($1, $2, $3, $4)`,
      [name, category, calories, dietary_tags]
    )
    added++
  }

  console.log(`Ingredients seeded: ${added} added, ${skipped} already present.`)
  await pool.end()
}

seed().catch((err) => {
  console.error('Seeding failed:', err)
  process.exit(1)
})
