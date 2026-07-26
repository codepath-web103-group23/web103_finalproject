import express from 'express'
import './db/dbpool.js'
import cors from 'cors'
import routes from './routes/routes.js'

const app = express();

console.log("server setup")

app.use(express.json())
app.use(cors())
app.use('/api', routes)

// app.get('/', function (req, res) {
//     res.send('hello, world!');
// });

app.listen(3000, function () {
    console.log('Server started on port 3000');
});

