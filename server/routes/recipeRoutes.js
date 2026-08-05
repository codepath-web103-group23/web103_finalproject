import express from 'express'
import controller from '../controllers/recipeController.js'
import { requireAuth, requireAdmin } from '../middleware/requireAuth.js'

const router = express.Router()

// reading recipes stays open so guests can browse before signing up
router.post("/create/recipe", requireAuth, controller.createRecipe)
router.get("/recipes", controller.getRecipes)
router.get("/recipe/:id", controller.getRecipe)
router.get("/recipe/:id/ingredients", controller.getRecipeIngredients)
router.get("/patch/recipe/:id/ingredients", requireAdmin, controller.patchRecipeIngredients)
router.post("/create/recipe/ingredient", requireAdmin, controller.createRecipeIngredient)
router.patch("/patch/recipe/:id", requireAdmin, controller.updateRecipe)
router.delete("/delete/recipe/:id", requireAdmin, controller.deleteRecipe)

export default router
