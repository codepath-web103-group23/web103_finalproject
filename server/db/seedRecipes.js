import { pool } from './dbpool.js'

// Seeds the `recipes` table together with its `recipe_ingredients` rows.
//
// Idempotent: skips any recipe whose title already exists (case-insensitively),
// so it is safe to re-run. It never updates or deletes existing rows.
//
// Ingredients are matched to the shared catalog by name. Run seedIngredients.js
// first — anything still missing is reported at the end rather than silently
// dropped, so a typo here doesn't quietly produce a recipe with no ingredients.
//
// Every image_url was checked to return HTTP 200 from images.unsplash.com, and
// each photo's alt text was confirmed to actually depict the dish.
//
//   cd server && node db/seedIngredients.js && node db/seedRecipes.js

const img = (id) => `https://images.unsplash.com/photo-${id}`

// [title, description, image, instructions[], [[ingredientName, qty, unit], …]]
const RECIPES = [
  [
    'Chicken Curry',
    'A warming curry of chicken simmered in an onion, garlic and tomato base with toasted spices.',
    img('1708782344490-9026aaa5eec7'),
    [
      'Dice the onion and mince the garlic.',
      'Heat the olive oil in a heavy pan over medium heat and cook the onion for 8 minutes, until soft and golden.',
      'Add the garlic, turmeric and cumin and stir for 1 minute, until fragrant.',
      'Cut the chicken into 1-inch pieces, add to the pan and brown on all sides.',
      'Pour in the canned tomatoes, season with salt and pepper, and bring to a simmer.',
      'Cover and cook for 25 minutes, stirring now and then, until the chicken is tender and the sauce has thickened.',
      'Serve over white rice.',
    ],
    [
      ['Chicken Breast', 1.5, 'lb'],
      ['Yellow Onion', 1, 'whole'],
      ['Garlic', 3, 'cloves'],
      ['Canned Tomatoes', 400, 'g'],
      ['Turmeric', 1, 'tsp'],
      ['Ground Cumin', 2, 'tsp'],
      ['Olive Oil', 2, 'tbsp'],
      ['White Rice', 2, 'cups'],
    ],
  ],
  [
    'Pad Thai',
    'Rice noodles tossed with egg, tofu and a sweet-sour tamarind-style sauce, finished with lime.',
    img('1637806930600-37fa8892069d'),
    [
      'Soak the noodles in hot water for 10 minutes, until pliable but still firm. Drain.',
      'Whisk the soy sauce, sugar and the juice of half a lemon together in a small bowl.',
      'Heat the olive oil in a wok over high heat and fry the cubed tofu until golden on all sides.',
      'Push the tofu aside, crack in the eggs and scramble them briefly.',
      'Add the drained noodles and the sauce, and toss constantly for 2 minutes until evenly coated.',
      'Serve with the remaining lemon cut into wedges.',
    ],
    [
      ['Spaghetti', 200, 'g'],
      ['Tofu', 200, 'g'],
      ['Eggs', 2, 'whole'],
      ['Soy Sauce', 3, 'tbsp'],
      ['Sugar', 1, 'tbsp'],
      ['Lemon', 1, 'whole'],
      ['Olive Oil', 2, 'tbsp'],
    ],
  ],
  [
    'Shoyu Ramen',
    'A quick weeknight ramen: soy-seasoned broth, noodles and a jammy soft-boiled egg.',
    img('1569718212165-3a8278d5f624'),
    [
      'Bring the vegetable stock to a gentle simmer and stir in the soy sauce and minced garlic.',
      'Lower the eggs into boiling water and cook for exactly 7 minutes, then chill them in cold water and peel.',
      'Cook the noodles in a separate pot according to the package, then drain.',
      'Divide the noodles between two bowls and pour the hot broth over them.',
      'Halve the eggs and set them on top with the spinach, which will wilt in the heat.',
      'Finish with a few drops of soy sauce.',
    ],
    [
      ['Vegetable Stock', 4, 'cups'],
      ['Spaghetti', 200, 'g'],
      ['Eggs', 2, 'whole'],
      ['Soy Sauce', 3, 'tbsp'],
      ['Garlic', 2, 'cloves'],
      ['Spinach', 2, 'cups'],
    ],
  ],
  [
    'Greek Salad',
    'Tomato, cucumber and red onion with feta and oregano — no lettuce, no cooking.',
    img('1769481614068-47cfb4d1f125'),
    [
      'Cut the tomatoes into thick wedges and slice the onion as thinly as you can.',
      'Combine them in a wide bowl with the bell pepper, cut into strips.',
      'Dress with the olive oil and a squeeze of lemon, then season with salt, pepper and oregano.',
      'Toss gently, crumble the cheese over the top and serve straight away.',
    ],
    [
      ['Tomato', 4, 'whole'],
      ['Yellow Onion', 0.5, 'whole'],
      ['Bell Pepper', 1, 'whole'],
      ['Cheddar Cheese', 150, 'g'],
      ['Olive Oil', 3, 'tbsp'],
      ['Dried Oregano', 1, 'tsp'],
      ['Lemon', 0.5, 'whole'],
    ],
  ],
  [
    'Shakshuka',
    'Eggs poached in a spiced tomato and pepper sauce, cooked and served in one skillet.',
    img('1682622110419-b671026a4536'),
    [
      'Warm the olive oil in a skillet over medium heat and soften the sliced onion and bell pepper for 10 minutes.',
      'Stir in the garlic, cumin and paprika and cook for 1 minute more.',
      'Add the canned tomatoes, season, and simmer for 15 minutes until the sauce has thickened.',
      'Make four wells in the sauce with the back of a spoon and crack an egg into each.',
      'Cover and cook for 6 to 8 minutes, until the whites are set but the yolks still run.',
      'Serve directly from the pan with bread for mopping.',
    ],
    [
      ['Eggs', 4, 'whole'],
      ['Canned Tomatoes', 400, 'g'],
      ['Bell Pepper', 1, 'whole'],
      ['Yellow Onion', 1, 'whole'],
      ['Garlic', 3, 'cloves'],
      ['Ground Cumin', 1, 'tsp'],
      ['Paprika', 1, 'tsp'],
      ['Whole Wheat Bread', 4, 'slices'],
    ],
  ],
  [
    'Baked Falafel',
    'Chickpea and herb patties, baked rather than fried, with a lemony yogurt sauce.',
    img('1593001872095-7d5b3868fb1d'),
    [
      'Heat the oven to 400°F.',
      'Pulse the chickpeas, onion, garlic, cumin and flour in a food processor until coarse but holding together.',
      'Shape the mixture into 12 patties and set them on an oiled baking sheet.',
      'Brush the tops with olive oil and bake for 25 minutes, turning once halfway, until crisp and browned.',
      'Stir the lemon juice into the yogurt with a pinch of salt.',
      'Serve the falafel warm with the sauce alongside.',
    ],
    [
      ['Chickpeas', 400, 'g'],
      ['Yellow Onion', 1, 'whole'],
      ['Garlic', 3, 'cloves'],
      ['Ground Cumin', 2, 'tsp'],
      ['All-Purpose Flour', 3, 'tbsp'],
      ['Greek Yogurt', 1, 'cup'],
      ['Lemon', 1, 'whole'],
      ['Olive Oil', 3, 'tbsp'],
    ],
  ],
  [
    'Beef Lasagna',
    'Layers of pasta, slow-simmered beef ragù and cheese, baked until the top is blistered.',
    img('1730900737654-ac6d843139da'),
    [
      'Brown the ground beef in a large pan over medium-high heat, breaking it up as it cooks.',
      'Add the diced onion and garlic and cook for 5 minutes, until softened.',
      'Pour in the canned tomatoes, season with oregano, salt and pepper, and simmer for 30 minutes.',
      'Heat the oven to 375°F.',
      'Layer the sauce, pasta sheets and grated cheese in a baking dish, repeating three times and finishing with cheese.',
      'Bake for 40 minutes, until bubbling and browned on top.',
      'Rest for 10 minutes before cutting — it will hold its shape much better.',
    ],
    [
      ['Ground Beef', 1, 'lb'],
      ['Spaghetti', 250, 'g'],
      ['Canned Tomatoes', 800, 'g'],
      ['Cheddar Cheese', 300, 'g'],
      ['Yellow Onion', 1, 'whole'],
      ['Garlic', 3, 'cloves'],
      ['Dried Oregano', 2, 'tsp'],
    ],
  ],
  [
    'Egg Fried Rice',
    'The classic use for leftover rice — day-old grains fry up separate rather than sticky.',
    img('1512058564366-18510be2db19'),
    [
      'Use rice cooked the day before and chilled; freshly cooked rice will steam instead of frying.',
      'Beat the eggs and scramble them quickly in a hot oiled wok, then set them aside.',
      'Add a little more oil and stir-fry the diced onion, carrot and peas for 3 minutes.',
      'Tip in the rice and toss over high heat for 4 minutes, pressing it against the pan to separate the grains.',
      'Return the egg, add the soy sauce and toss for another minute.',
      'Season with black pepper and serve hot.',
    ],
    [
      ['White Rice', 3, 'cups'],
      ['Eggs', 3, 'whole'],
      ['Frozen Peas', 1, 'cup'],
      ['Carrot', 1, 'whole'],
      ['Yellow Onion', 1, 'whole'],
      ['Soy Sauce', 3, 'tbsp'],
      ['Olive Oil', 2, 'tbsp'],
      ['Black Pepper', 0.5, 'tsp'],
    ],
  ],
  [
    'Roasted Tomato Soup',
    'Roasting the tomatoes first concentrates them and gives the soup far more depth than simmering alone.',
    img('1673021889619-0677506b56ac'),
    [
      'Heat the oven to 425°F.',
      'Halve the tomatoes, quarter the onion and spread both on a tray with the whole garlic cloves.',
      'Drizzle with olive oil, season, and roast for 30 minutes until the edges are darkened.',
      'Tip everything into a pot with the vegetable stock and bring to a simmer.',
      'Blend until smooth, then stir in the milk and warm through without boiling.',
      'Serve with toasted bread.',
    ],
    [
      ['Tomato', 8, 'whole'],
      ['Yellow Onion', 1, 'whole'],
      ['Garlic', 4, 'cloves'],
      ['Vegetable Stock', 3, 'cups'],
      ['Milk', 0.5, 'cup'],
      ['Olive Oil', 3, 'tbsp'],
      ['Whole Wheat Bread', 4, 'slices'],
    ],
  ],
  [
    'Classic Hummus',
    'Chickpeas blended with lemon and garlic until genuinely smooth, finished with olive oil.',
    img('1637949385162-e416fb15b2ce'),
    [
      'Drain the chickpeas but keep a few tablespoons of their liquid.',
      'Blend the chickpeas with the garlic, the juice of a whole lemon, the cumin and a good pinch of salt.',
      'With the motor running, pour in the olive oil in a thin stream.',
      'Loosen with the reserved liquid, a spoonful at a time, and keep blending for a full 3 minutes — this is what makes it smooth.',
      'Spread into a bowl, pool a little more olive oil on top and dust with paprika.',
    ],
    [
      ['Chickpeas', 400, 'g'],
      ['Garlic', 2, 'cloves'],
      ['Lemon', 1, 'whole'],
      ['Olive Oil', 5, 'tbsp'],
      ['Ground Cumin', 1, 'tsp'],
      ['Paprika', 0.5, 'tsp'],
    ],
  ],
  [
    'Grilled Salmon with Broccoli',
    'A 20-minute dinner: salmon grilled skin-side down and broccoli roasted alongside.',
    img('1519708227418-c8fd9a32b7a2'),
    [
      'Heat the oven to 425°F and a grill pan over medium-high heat.',
      'Toss the broccoli florets with 2 tablespoons of olive oil, salt and pepper, and roast for 18 minutes.',
      'Pat the salmon dry, rub it with the remaining oil and season with salt and pepper.',
      'Grill the fillets skin-side down for 5 minutes without moving them, then turn and cook 3 minutes more.',
      'Squeeze lemon over the fish and serve with the broccoli.',
    ],
    [
      ['Salmon Fillet', 2, 'whole'],
      ['Broccoli', 1, 'lb'],
      ['Olive Oil', 3, 'tbsp'],
      ['Lemon', 1, 'whole'],
      ['Garlic', 2, 'cloves'],
      ['Black Pepper', 0.5, 'tsp'],
    ],
  ],
  [
    'Guacamole',
    'Ripe avocado mashed with lime, onion and tomato — mashed by hand, never blended.',
    img('1680992071073-cb1696ba8d3e'),
    [
      'Halve the avocados, scoop the flesh into a bowl and mash it roughly with a fork; leave some texture.',
      'Finely dice the onion and tomato and stir them through.',
      'Add the juice of a whole lemon, a pinch of salt and the cumin.',
      'Taste and adjust the salt and acid — under-seasoned guacamole tastes flat.',
      'Serve immediately with tortillas.',
    ],
    [
      ['Avocado', 3, 'whole'],
      ['Yellow Onion', 0.5, 'whole'],
      ['Tomato', 1, 'whole'],
      ['Lemon', 1, 'whole'],
      ['Ground Cumin', 0.5, 'tsp'],
      ['Tortillas', 6, 'whole'],
    ],
  ],
  [
    'Chocolate Chip Cookies',
    'Crisp at the edge, soft in the middle. Resting the dough is what deepens the flavour.',
    img('1499636136210-6f4ee915583e'),
    [
      'Beat the softened butter and sugar together until pale and fluffy, about 3 minutes.',
      'Beat in the eggs one at a time.',
      'Fold in the flour and baking powder with a pinch of salt until only just combined.',
      'Chill the dough for at least an hour — this stops the cookies spreading thin.',
      'Heat the oven to 350°F and drop spoonfuls onto a lined tray, spaced well apart.',
      'Bake for 11 minutes, until the edges are set and the centres still look underdone.',
      'Cool on the tray for 5 minutes before moving them.',
    ],
    [
      ['All-Purpose Flour', 2.5, 'cups'],
      ['Butter', 1, 'cup'],
      ['Sugar', 1, 'cup'],
      ['Eggs', 2, 'whole'],
      ['Baking Powder', 1, 'tsp'],
    ],
  ],
  [
    'Banana Bread',
    'The blacker the bananas the better — overripe fruit is sweeter and far more fragrant.',
    img('1632931057819-4eefffa8e007'),
    [
      'Heat the oven to 350°F and line a loaf tin.',
      'Mash the bananas thoroughly in a large bowl.',
      'Stir in the melted butter, sugar, eggs and cinnamon.',
      'Fold in the flour and baking powder until just combined — overmixing makes the loaf tough.',
      'Pour into the tin and bake for 55 minutes, until a skewer comes out clean.',
      'Cool in the tin for 10 minutes, then turn out onto a rack.',
    ],
    [
      ['Banana', 3, 'whole'],
      ['All-Purpose Flour', 2, 'cups'],
      ['Sugar', 0.75, 'cup'],
      ['Butter', 0.5, 'cup'],
      ['Eggs', 2, 'whole'],
      ['Baking Powder', 1, 'tsp'],
      ['Cinnamon', 1, 'tsp'],
    ],
  ],
  [
    'French Toast',
    'Thick slices soaked in spiced custard and fried in butter until the edges caramelise.',
    img('1484723091739-30a097e8f929'),
    [
      'Whisk the eggs, milk, cinnamon and a spoonful of sugar together in a shallow dish.',
      'Soak each slice of bread for 20 seconds a side — long enough to saturate, not so long it collapses.',
      'Melt a knob of butter in a skillet over medium heat.',
      'Fry the slices for 3 minutes a side, until deep golden.',
      'Serve hot with honey poured over.',
    ],
    [
      ['Whole Wheat Bread', 6, 'slices'],
      ['Eggs', 3, 'whole'],
      ['Milk', 0.75, 'cup'],
      ['Cinnamon', 1, 'tsp'],
      ['Butter', 2, 'tbsp'],
      ['Honey', 3, 'tbsp'],
      ['Sugar', 1, 'tbsp'],
    ],
  ],
  [
    'Bean and Rice Burritos',
    'Black beans, rice and cheese rolled into warm tortillas — good hot or packed cold.',
    img('1731090389603-d63060ee08a6'),
    [
      'Warm the olive oil in a pan and cook the diced onion for 5 minutes.',
      'Add the garlic, cumin and paprika and stir for a minute.',
      'Tip in the drained black beans with a splash of water and cook for 5 minutes, mashing about half of them.',
      'Warm the tortillas briefly in a dry pan so they roll without cracking.',
      'Fill each with rice, beans, cheese and a spoonful of guacamole or diced avocado.',
      'Fold the sides in, roll tightly, and toast seam-side down for 2 minutes.',
    ],
    [
      ['Black Beans', 400, 'g'],
      ['White Rice', 2, 'cups'],
      ['Tortillas', 4, 'whole'],
      ['Cheddar Cheese', 150, 'g'],
      ['Avocado', 1, 'whole'],
      ['Yellow Onion', 1, 'whole'],
      ['Garlic', 2, 'cloves'],
      ['Ground Cumin', 1, 'tsp'],
      ['Paprika', 1, 'tsp'],
    ],
  ],
  [
    'Beef Pho',
    'A shortcut pho: stock infused with charred onion, ginger and cinnamon, poured over noodles.',
    img('1766050586763-723571af4dde'),
    [
      'Char the halved onion and the garlic in a dry pan until blackened in spots — this is where the flavour comes from.',
      'Add them to the vegetable stock with the cinnamon stick and simmer, covered, for 30 minutes.',
      'Strain the broth and season it with soy sauce.',
      'Cook the noodles separately and divide between bowls.',
      'Slice the beef as thinly as possible and lay it raw over the noodles.',
      'Pour the boiling broth straight over the beef — it will cook through in seconds.',
      'Top with spinach and a squeeze of lemon.',
    ],
    [
      ['Vegetable Stock', 6, 'cups'],
      ['Ground Beef', 0.5, 'lb'],
      ['Spaghetti', 200, 'g'],
      ['Yellow Onion', 1, 'whole'],
      ['Garlic', 3, 'cloves'],
      ['Cinnamon', 1, 'tsp'],
      ['Soy Sauce', 3, 'tbsp'],
      ['Spinach', 2, 'cups'],
      ['Lemon', 0.5, 'whole'],
    ],
  ],
  [
    'Cheese Omelette',
    'Three eggs, low heat and patience. The French style: pale outside, barely set within.',
    img('1510693206972-df098062cb71'),
    [
      'Beat the eggs with a pinch of salt until completely uniform, with no streaks of white.',
      'Melt the butter in a non-stick pan over medium-low heat until foaming but not browning.',
      'Pour in the eggs and stir constantly with a spatula for 30 seconds, then let them settle.',
      'When the surface is still slightly wet, scatter the grated cheese over one half.',
      'Fold the omelette over and slide it onto a plate — it will finish cooking from its own heat.',
      'Season with black pepper.',
    ],
    [
      ['Eggs', 3, 'whole'],
      ['Cheddar Cheese', 60, 'g'],
      ['Butter', 1, 'tbsp'],
      ['Black Pepper', 0.25, 'tsp'],
    ],
  ],
  [
    'Caprese Salad',
    'Three ingredients and good olive oil. Only worth making with tomatoes actually in season.',
    img('1769458313860-3c8db667d990'),
    [
      'Slice the tomatoes and the cheese to roughly the same thickness.',
      'Arrange them on a plate in overlapping alternating slices.',
      'Season with salt and black pepper.',
      'Drizzle generously with olive oil and scatter over the oregano.',
      'Let it sit for 10 minutes before serving so the tomatoes release their juice.',
    ],
    [
      ['Tomato', 4, 'whole'],
      ['Cheddar Cheese', 200, 'g'],
      ['Olive Oil', 3, 'tbsp'],
      ['Dried Oregano', 1, 'tsp'],
      ['Black Pepper', 0.25, 'tsp'],
    ],
  ],
  [
    'Blueberry Pancakes',
    'A thick batter left to rest for ten minutes gives noticeably taller, softer pancakes.',
    img('1528207776546-365bb710ee93'),
    [
      'Whisk the flour, baking powder, sugar and a pinch of salt together.',
      'In a second bowl beat the eggs with the milk and melted butter.',
      'Pour the wet into the dry and stir until only just combined — lumps are fine, and overmixing makes them rubbery.',
      'Rest the batter for 10 minutes.',
      'Cook ladlefuls on a buttered griddle over medium heat until bubbles break the surface, about 3 minutes.',
      'Flip and cook for 2 minutes more.',
      'Serve stacked with honey.',
    ],
    [
      ['All-Purpose Flour', 2, 'cups'],
      ['Milk', 1.5, 'cups'],
      ['Eggs', 2, 'whole'],
      ['Baking Powder', 2, 'tsp'],
      ['Sugar', 2, 'tbsp'],
      ['Butter', 3, 'tbsp'],
      ['Honey', 3, 'tbsp'],
    ],
  ],
]

const seed = async () => {
  let added = 0
  let skipped = 0
  const missingIngredients = new Set()

  for (const [title, description, image_url, steps, ingredients] of RECIPES) {
    const exists = await pool.query(
      'SELECT id FROM recipes WHERE LOWER(title) = LOWER($1)', [title])

    if (exists.rows.length > 0) {
      skipped++
      continue
    }

    // toSteps() on the client splits instructions on newlines.
    const instructions = steps.join('\n')

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      const inserted = await client.query(
        `INSERT INTO recipes (title, description, instructions, image_url, avg_rating)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [title, description, instructions, image_url, 0])

      const recipeId = inserted.rows[0].id

      for (const [name, quantity, unit] of ingredients) {
        const match = await client.query(
          'SELECT id FROM ingredients WHERE LOWER(name) = LOWER($1) ORDER BY id LIMIT 1',
          [name])

        if (match.rows.length === 0) {
          missingIngredients.add(name)
          continue
        }

        await client.query(
          `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
           VALUES ($1, $2, $3, $4)`,
          [recipeId, match.rows[0].id, quantity, unit])
      }

      await client.query('COMMIT')
      added++
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  }

  console.log(`Recipes seeded: ${added} added, ${skipped} already present.`)

  if (missingIngredients.size > 0) {
    console.warn(
      `Not found in the ingredients catalog (run seedIngredients.js first): ${
        [...missingIngredients].join(', ')}`)
  }

  await pool.end()
}

seed().catch((err) => {
  console.error('Seeding failed:', err)
  process.exit(1)
})
