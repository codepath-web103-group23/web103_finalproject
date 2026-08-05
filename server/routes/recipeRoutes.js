import express from 'express'
import controller from '../controllers/recipeController.js'
// import { requireAdmin } from '../middleware/requireAuth.js'

const router = express.Router()

router.post("/create/recipe", controller.createRecipe)
router.get("/recipes", controller.getRecipes)
router.get("/recipe/:id", controller.getRecipe)
// <<<<<<< HEAD
router.get("/recipe/:id/ingredients", controller.getRecipeIngredients)
router.get("/patch/recipe/:id/ingredients", controller.patchRecipeIngredients)
router.post("/create/recipe/ingredient", controller.createRecipeIngredient)
router.patch("/patch/recipe/:id", controller.updateRecipe)
router.delete("/delete/recipe/:id", controller.deleteRecipe)
// =======
// router.patch("/patch/recipe/:id", requireAdmin, controller.updateRecipe)
// router.delete("/delete/recipe/:id", requireAdmin, controller.deleteRecipe)
// >>>>>>> origin/main

export default router
