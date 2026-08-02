import express from 'express'
import './db/dbpool.js'
import cors from 'cors'
import ingredientsroutes from './routes/ingredientsroutes.js'
import reciperoutes from './routes/reciperoutes.js'
import userroutes from './routes/userroutes.js'
import preferenceroutes from './routes/preferencesroutes.js'
import favoriteroutes from './routes/favoritesroutes.js'
import kitchenroutes from './routes/kitchenroutes.js'
import scheduledmealsroutes from './routes/scheduledmealsroutes.js'
import path from 'path'
import { fileURLToPath } from 'url'

// authentication libraries
import passport from 'passport'
import session from 'express-session'
import { GitHub } from './config/auth.js'
import authroutes from './routes/auth.js'

const app = express();

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log("server setup")

app.use(express.json())

// auth


app.use(cors({
  origin: 'http://localhost:5173',
  methods: 'get, post, put, delete, patch',
  credentials: true
}))

app.use(session({
  secret: 'codepath',
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())
passport.use(GitHub)
passport.serializeUser((user,done) => {
  done(null, user)
})
passport.deserializeUser((user, done) => {
  done(null, user)
})

// routes
app.use('/api', ingredientsroutes)
app.use('/api', reciperoutes)
app.use('/api', userroutes)
app.use('/api', preferenceroutes)
app.use('/api', favoriteroutes)
app.use('/api', kitchenroutes)
app.use('/api', scheduledmealsroutes)

app.use('/auth', authroutes)

// app.get('/', function (req, res) {
//     res.send('hello, world!');
// });

app.use(express.static(path.join(__dirname, 'public')))

app.get('*splat', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.listen(3000, function () {
    console.log('server started on port 3000');
});

