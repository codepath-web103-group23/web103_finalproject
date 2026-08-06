import { pool } from './dbpool.js'

// Fills in the twelve recipes that predate seedRecipes.js.
//
// Eleven of them stored their whole method as a single line, so the client's
// toSteps() produced one giant "step 1" and the cook-mode checklist on the
// instructions page was useless. Six had no recipe_ingredients rows at all, so
// the Recipe page showed "No ingredients listed". Two had unusable images: one
// pointed at example.com (404) and one was an empty string.
//
// Unlike the other seeders this one UPDATEs existing rows, so it is deliberately
// conservative:
//   - instructions are only rewritten when the stored value is a single line
//   - ingredients are only added when the recipe has none
//   - image_url is only replaced when it is empty or a known-dead URL
// Re-running it is a no-op once every recipe has been filled in.
//
//   cd server && node db/backfillRecipes.js

const img = (id) => `https://images.unsplash.com/photo-${id}`

// title -> { steps, ingredients, image }
const BACKFILL = {
  'Spaghetti Carbonara': {
    // Already multi-line; only the dead example.com image needs replacing.
    image: img('1764586119076-61711e8ed25a'),
    ingredients: [
      ['Spaghetti', 400, 'g'],
      ['Eggs', 4, 'whole'],
      ['Cheddar Cheese', 100, 'g'],
      ['Black Pepper', 1, 'tsp'],
      ['Olive Oil', 1, 'tbsp'],
      ['Garlic', 1, 'cloves'],
    ],
  },
  'Spaghetti Bolognese': {
    steps: [
      'Bring a large pot of salted water to the boil for the pasta.',
      'Brown the ground beef in a wide pan over medium-high heat, breaking it up as it cooks.',
      'Add the diced onion and garlic and cook for 5 minutes until softened.',
      'Pour in the canned tomatoes, season with oregano, salt and pepper, and simmer for 25 minutes.',
      'Cook the spaghetti until al dente, then drain, reserving a cup of the water.',
      'Toss the pasta through the sauce, loosening with the reserved water, and serve with grated cheese.',
    ],
    ingredients: [
      ['Spaghetti', 400, 'g'],
      ['Ground Beef', 1, 'lb'],
      ['Canned Tomatoes', 400, 'g'],
      ['Yellow Onion', 1, 'whole'],
      ['Garlic', 3, 'cloves'],
      ['Dried Oregano', 1, 'tsp'],
      ['Cheddar Cheese', 80, 'g'],
    ],
  },
  'Margherita Pizza': {
    steps: [
      'Heat the oven as high as it will go, ideally 475°F, with a tray or stone inside.',
      'Stretch the dough by hand to about 12 inches, leaving the rim thicker.',
      'Spread a thin layer of crushed tomatoes over the base, stopping short of the edge.',
      'Tear the cheese over the top and season with salt.',
      'Bake on the preheated tray for 12 minutes, until the crust is blistered.',
      'Drizzle with olive oil and scatter with fresh basil before serving.',
    ],
    ingredients: [
      ['All-Purpose Flour', 300, 'g'],
      ['Canned Tomatoes', 200, 'g'],
      ['Cheddar Cheese', 200, 'g'],
      ['Olive Oil', 2, 'tbsp'],
      ['Dried Oregano', 1, 'tsp'],
    ],
  },
  'Classic Cheeseburger': {
    steps: [
      'Divide the beef into four loose balls; do not compact them or the patties turn dense.',
      'Heat a heavy skillet or grill until very hot.',
      'Flatten each ball onto the pan and season generously with salt and pepper.',
      'Cook for 3 minutes without moving, then flip and lay a slice of cheese on top.',
      'Cook 2 minutes more, covering the pan briefly so the cheese melts.',
      'Toast the buns cut-side down in the same pan and build with tomato and onion.',
    ],
    ingredients: [
      ['Ground Beef', 1.5, 'lb'],
      ['Cheddar Cheese', 4, 'slices'],
      ['Whole Wheat Bread', 4, 'slices'],
      ['Tomato', 1, 'whole'],
      ['Yellow Onion', 1, 'whole'],
      ['Black Pepper', 0.5, 'tsp'],
    ],
  },
  'Fluffy Pancakes': {
    steps: [
      'Whisk the flour, baking powder, sugar and a pinch of salt in a large bowl.',
      'Beat the eggs with the milk and melted butter in a second bowl.',
      'Fold the wet into the dry until only just combined — lumps are fine and overmixing flattens them.',
      'Let the batter rest for 10 minutes so the flour hydrates.',
      'Cook ladlefuls on a buttered griddle over medium heat until bubbles break the surface.',
      'Flip once and cook 2 minutes more, then serve with honey.',
    ],
    ingredients: [
      ['All-Purpose Flour', 2, 'cups'],
      ['Milk', 1.5, 'cups'],
      ['Eggs', 2, 'whole'],
      ['Baking Powder', 2, 'tsp'],
      ['Sugar', 2, 'tbsp'],
      ['Butter', 3, 'tbsp'],
      ['Honey', 3, 'tbsp'],
    ],
  },
  'Caesar Salad': {
    steps: [
      'Tear the lettuce into bite-sized pieces, wash and dry it thoroughly — wet leaves will not hold dressing.',
      'Cube the bread, toss with olive oil and a little garlic, and bake at 400°F for 10 minutes until crisp.',
      'Whisk the yogurt with lemon juice, minced garlic, black pepper and a pinch of salt.',
      'Toss the leaves with the dressing until lightly coated.',
      'Add the croutons and grated cheese, toss once more and serve straight away.',
    ],
    ingredients: [
      ['Spinach', 6, 'cups'],
      ['Whole Wheat Bread', 3, 'slices'],
      ['Greek Yogurt', 0.5, 'cup'],
      ['Lemon', 1, 'whole'],
      ['Garlic', 2, 'cloves'],
      ['Cheddar Cheese', 60, 'g'],
      ['Olive Oil', 2, 'tbsp'],
      ['Black Pepper', 0.5, 'tsp'],
    ],
  },
  'California Roll': {
    steps: [
      'Rinse the rice until the water runs clear, then cook it and let it cool to room temperature.',
      'Season the rice with a spoonful of sugar and a pinch of salt, folding gently so the grains stay intact.',
      'Lay a sheet of nori on a rolling mat and spread rice over it with wet hands, leaving a clear inch at the top.',
      'Arrange strips of avocado and cucumber across the middle.',
      'Roll tightly away from you, sealing the bare edge with a little water.',
      'Slice into eight pieces with a wet knife, wiping the blade between cuts.',
    ],
    ingredients: [
      ['White Rice', 2, 'cups'],
      ['Avocado', 1, 'whole'],
      ['Carrot', 1, 'whole'],
      ['Sugar', 1, 'tbsp'],
      ['Soy Sauce', 3, 'tbsp'],
    ],
  },
  'Chocolate Cake': {
    steps: [
      'Heat the oven to 350°F and line two 8-inch tins.',
      'Cream the butter and sugar together until pale and fluffy.',
      'Beat in the eggs one at a time, then the milk.',
      'Fold in the flour and baking powder until just combined.',
      'Divide between the tins and bake for 30 minutes, until a skewer comes out clean.',
      'Cool completely in the tins before turning out — a warm cake will tear.',
      'Sandwich and cover with frosting.',
    ],
    ingredients: [
      ['All-Purpose Flour', 2, 'cups'],
      ['Sugar', 1.5, 'cups'],
      ['Butter', 1, 'cup'],
      ['Eggs', 3, 'whole'],
      ['Milk', 1, 'cup'],
      ['Baking Powder', 2, 'tsp'],
    ],
  },
  'Chicken Tacos': {
    steps: [
      'Slice the chicken into strips and toss with cumin, paprika, salt and pepper.',
      'Sear in a hot oiled pan for 6 minutes, turning once, until cooked through and charred at the edges.',
      'Rest the chicken for 5 minutes, then slice it across the grain.',
      'Warm the tortillas in a dry pan until pliable.',
      'Fill each with chicken, diced tomato and onion.',
      'Top with cheese and a squeeze of lemon.',
    ],
    ingredients: [
      ['Chicken Breast', 1, 'lb'],
      ['Tortillas', 8, 'whole'],
      ['Tomato', 2, 'whole'],
      ['Yellow Onion', 1, 'whole'],
      ['Cheddar Cheese', 100, 'g'],
      ['Ground Cumin', 2, 'tsp'],
      ['Paprika', 1, 'tsp'],
      ['Lemon', 1, 'whole'],
    ],
  },
  'Peruvian Cebiche': {
    // Left without an image on purpose: nothing in Unsplash's ceviche results
    // actually depicted the dish, and the card renders a placeholder tile,
    // which beats an unrelated photo.
    steps: [
      'Cut the fish into even half-inch cubes and keep it cold until the moment you dress it.',
      'Slice the onion as thinly as possible and rinse it under cold water to take the harshness off.',
      'Toss the fish with plenty of lemon juice and a good pinch of salt.',
      'Leave it to cure for 10 minutes — the flesh should turn opaque at the edges but stay tender inside.',
      'Fold through the onion, chili powder and chopped herbs.',
      'Serve immediately, while the fish is still firm.',
    ],
    ingredients: [
      ['Salmon Fillet', 1, 'lb'],
      ['Lemon', 6, 'whole'],
      ['Yellow Onion', 1, 'whole'],
      ['Chili Powder', 1, 'tsp'],
      ['Potato', 2, 'whole'],
      ['Frozen Corn', 1, 'cup'],
    ],
  },
  'Creamy Chicken Pasta': {
    steps: [
      'Bring a large pot of salted water to the boil and cook the pasta until al dente.',
      'Season the chicken and sear it in a hot pan for 6 minutes a side, until golden and cooked through.',
      'Rest the chicken on a board while you build the sauce in the same pan.',
      'Melt the butter, soften the garlic for a minute, then pour in the milk and bring to a gentle simmer.',
      'Stir in the grated cheese off the heat until the sauce is smooth.',
      'Add the broccoli and the drained pasta, slice in the chicken, and toss to coat.',
    ],
    ingredients: [
      ['Spaghetti', 400, 'g'],
      ['Chicken Breast', 1, 'lb'],
      ['Milk', 1.5, 'cups'],
      ['Cheddar Cheese', 120, 'g'],
      ['Butter', 2, 'tbsp'],
      ['Garlic', 3, 'cloves'],
      ['Broccoli', 2, 'cups'],
      ['Black Pepper', 0.5, 'tsp'],
    ],
  },
  'Air Fryer Chicken Wings': {
    steps: [
      'Pat the wings completely dry — surface moisture is what stops them crisping.',
      'Toss with olive oil, paprika, garlic powder, salt and pepper.',
      'Arrange in a single layer in the air fryer basket, leaving space between them.',
      'Cook at 380°F for 12 minutes, then shake the basket.',
      'Raise the heat to 400°F and cook 8 minutes more, until deeply golden.',
      'Toss with soy sauce and honey while still hot.',
    ],
    ingredients: [
      ['Chicken Wings', 2, 'lb'],
      ['Olive Oil', 2, 'tbsp'],
      ['Paprika', 2, 'tsp'],
      ['Garlic Powder', 1, 'tsp'],
      ['Black Pepper', 1, 'tsp'],
      ['Soy Sauce', 2, 'tbsp'],
      ['Honey', 2, 'tbsp'],
    ],
  },
}

const DEAD_IMAGES = ['', 'https://example.com/images/carbonara.jpg']

const run = async () => {
  let stepsFixed = 0
  let ingredientsAdded = 0
  let imagesFixed = 0
  const missing = new Set()

  for (const [title, plan] of Object.entries(BACKFILL)) {
    const { rows } = await pool.query(
      'SELECT id, instructions, image_url FROM recipes WHERE LOWER(title) = LOWER($1)',
      [title])

    if (rows.length === 0) continue
    const recipe = rows[0]

    // Instructions: only when the stored method is a single line.
    if (plan.steps) {
      const lineCount = (recipe.instructions ?? '').split('\n').filter(Boolean).length
      if (lineCount <= 1) {
        await pool.query('UPDATE recipes SET instructions = $1 WHERE id = $2',
          [plan.steps.join('\n'), recipe.id])
        stepsFixed++
      }
    }

    // Image: only when it is empty or a known-dead URL.
    if (plan.image && DEAD_IMAGES.includes(recipe.image_url ?? '')) {
      await pool.query('UPDATE recipes SET image_url = $1 WHERE id = $2',
        [plan.image, recipe.id])
      imagesFixed++
    }

    // Ingredients: top up any recipe that has fewer than three. Several had a
    // token one or two attached, which is not a usable shopping list — but we
    // never touch the links that are already there.
    if (plan.ingredients) {
      const { rows: existing } = await pool.query(
        'SELECT ingredient_id FROM recipe_ingredients WHERE recipe_id = $1',
        [recipe.id])

      if (existing.length < 3) {
        const alreadyLinked = new Set(existing.map((row) => row.ingredient_id))

        for (const [name, quantity, unit] of plan.ingredients) {
          const match = await pool.query(
            'SELECT id FROM ingredients WHERE LOWER(name) = LOWER($1) ORDER BY id LIMIT 1',
            [name])

          if (match.rows.length === 0) {
            missing.add(name)
            continue
          }

          const ingredientId = match.rows[0].id
          if (alreadyLinked.has(ingredientId)) continue

          await pool.query(
            `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
             VALUES ($1, $2, $3, $4)`,
            [recipe.id, ingredientId, quantity, unit])
          alreadyLinked.add(ingredientId)
          ingredientsAdded++
        }
      }
    }
  }

  console.log(
    `Backfill: ${stepsFixed} recipes given step-by-step instructions, ` +
    `${ingredientsAdded} ingredient links added, ${imagesFixed} images replaced.`)

  if (missing.size > 0) {
    console.warn(`Not found in the ingredients catalog: ${[...missing].join(', ')}`)
  }

  await pool.end()
}

run().catch((err) => {
  console.error('Backfill failed:', err)
  process.exit(1)
})
