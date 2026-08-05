import express from 'express'
import controller from '../controllers/scheduledMealsController.js'
// import { requireAuth } from '../middleware/requireAuth.js'

const router = express.Router()

router.get('/scheduled-meals', controller.getScheduledMeals)
router.post('/create/scheduled-meal', controller.createScheduledMeal)
router.delete('/delete/scheduled-meal/:id', controller.deleteScheduledMeal)

export default router
