import controller from '/controllers/userController.js' 
import express from 'express' 

const router = express.Router()

router.get('/users', controller.getUsers)
router.get('/users/:id', controller.getUser)
router.post('/create/user', controller.createUser)
router.patch('/patch/user/:id', controller.updateUser)
router.delete('/delete/user/:id', controller.deleteUser)

export defult router


