import express from 'express'
import './db/dbpool.js'
import cors from 'cors'
import ingredientsroutes from './routes/ingredientsRoutes.js'
import reciperoutes from './routes/recipeRoutes.js'
import userroutes from './routes/userRoutes.js'
import preferenceroutes from './routes/preferencesRoutes.js'
import favoriteroutes from './routes/favoritesRoutes.js'
import kitchenroutes from './routes/kitchenRoutes.js'
import scheduledmealsroutes from './routes/scheduledMealsRoutes.js'
import path from 'path'
import { fileURLToPath } from 'url'

// authentication libraries
import passport from 'passport'
import session from 'express-session'
import connectPgSimple from 'connect-pg-simple'
import { pool } from './db/dbpool.js'
import { GitHub } from './config/auth.js'
import authroutes from './routes/auth.js'

const app = express();

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log("server setup")

app.use(express.json())

// Render terminates TLS in front of the app, so without this Express sees
// http:// and refuses to set the `secure` session cookie in production.
app.set('trust proxy', 1)

// auth


app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  // methods: 'get, post, put, delete, patch',
  credentials: true
}))

// Sessions live in Postgres, not in memory.
//
// The default MemoryStore threw every session away whenever the process
// restarted, so each `nodemon` reload — i.e. every server file save — silently
// logged everyone out. That is the "login stops working" behaviour, not
// anything wrong with the GitHub flow.
const PgSession = connectPgSimple(session)

app.use(session({
  store: new PgSession({
    pool,
    tableName: 'user_sessions',
    // Creates the table on first boot so a fresh clone needs no extra step.
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET || 'codepath',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // a week
    // Render terminates TLS, so only mark the cookie secure in production.
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  },
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

app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.listen(3000, function () {
    console.log('server started on port 3000');
});

