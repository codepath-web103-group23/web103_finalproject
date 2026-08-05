import express from 'express'
import controller from '../controllers/kitchenController.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = express.Router()

router.get('/kitchen', requireAuth, controller.getKitchen)
router.post('/create/kitchen-item', requireAuth, controller.addToKitchen)
router.delete('/delete/kitchen-item/:ingredientId', requireAuth, controller.removeFromKitchen)

// Custom non-RESTful action: cooking a recipe consumes its ingredients out of
// the signed-in user's kitchen.
router.post('/kitchen/cook/:recipeId', requireAuth, controller.cookRecipe)

export default router
