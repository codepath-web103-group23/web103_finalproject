import express from 'express'
import './db/dbpool.js'
import cors from 'cors'
import IngredientsRoutes from './routes/ingredientsRoutes.js'
import RecipeRoutes from './routes/recipeRoutes.js'

const app = express();

console.log("server setup")

app.use(express.json())
app.use(cors())
app.use('/api', IngredientsRoutes)
app.use('/api', RecipeRoutes)

// app.get('/', function (req, res) {
//     res.send('hello, world!');
// });

app.listen(3000, function () {
    console.log('Server started on port 3000');
});

