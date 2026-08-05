import express from 'express'
import controller from '../controllers/kitchenController.js'
// import { requireAuth } from '../middleware/requireAuth.js'

const router = express.Router()

router.get('/kitchen', controller.getKitchen)
router.post('/create/kitchen-item', controller.addToKitchen)
router.delete('/delete/kitchen-item/:ingredientId', controller.removeFromKitchen)

export default router
