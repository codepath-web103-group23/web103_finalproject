import express from 'express'
// import controller from '../controllers/controller.js'
import controller from '../controllers/recipeController.js'

const router = express.Router()

router.post("/create/recipe", controller.createRecipe)
// router.get("/ingredients", controller.getIngredients)
// router.get("/ingredient/:id", controller.getIngredient)
// router.patch("/ingredient/:id", controller.updateIngredient)


export default router
