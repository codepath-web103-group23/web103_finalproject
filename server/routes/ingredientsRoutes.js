import express from 'express'
// import controller from '../controllers/controller.js'
import controller from '../controllers/ingredientsController.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = express.Router()

router.post("/create/ingredient", requireAuth, controller.createIngredient)
router.get("/ingredients", controller.getIngredients)
router.get("/ingredient/:id", controller.getIngredient)
router.patch("/ingredient/:id", requireAuth, controller.updateIngredient)

export default router

