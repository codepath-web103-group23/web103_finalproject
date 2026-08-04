import express from 'express'
import passport from 'passport'

const router = express.Router()

// 1 user gets directed to github auth login
router.get(
  '/github',
  passport.authenticate('github', {
    scope: [ 'read:user' ]
  })
)

// 2 session cookie is set
router.get(
  '/github/callback',
  passport.authenticate('github', {
    failureRedirect: `${process.env.CLIENT_URL}/`,
  }),
  (req, res) => {
    res.redirect(`${process.env.CLIENT_URL}/home`)
  }
)

// 3 returns user data back to client
router.get('/login/success', (req, res) => {
    if (req.user) {
      res.status(200).json({ success: true, user: req.user })
    } else {
      res.status(401).json({
        success: false,
        message: "Not logged in"
      })
  }
})

router.get('/login/failed', (req, res) => {
    res.status(401).json({ success: true, message: "failure" })
})

router.get('/logout', (req, res, next) => {
    req.logout((err) => {
      if (err) {
        console.log('logout failed')
        return next(err)
      }
      console.log('logout successful')
      req.session.destroy((err) => {
        res.clearCookie('connect.sid')
        res.json({ status: "logout", user: {} })
      })
    })
})


// router.get(
//   '/github/callback',
//   passport.authenticate('github', {
//     successRedirect: '/',
//     failureRedirect:'/destinations',
//   })
// )


export default router
