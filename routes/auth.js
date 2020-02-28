let express = require('express');
let router = express.Router();
const passport = require('../auth/passport');
const { genPasswordDigest, loginRequired } = require('../auth/helpers');
let { Users } = require('../db');

router.post("/signup", async (req, res, next) => {
  const { username, password, email } = req.body;
  try {
    let user = {
      username,
      password,
      email,
      password_digest: await genPasswordDigest(req.body.password),
      points: 0
    };

    let registeredUser = await Users.createUser(user);
    delete registeredUser.password_digest;

    req.logIn(registeredUser, err => {
      if (err) return next(err)
      res
        .status(201)
        .json({
          payload: {
            user: registeredUser,
          },
          message: "User registered and logged in",
          error: false
        })
    })

  } catch (err) {
    // Username already taken 
    if (err.code === "23505" && err.detail.includes("already exists")) {
      res.status(409).json({
        payload: null,
        message: "Username not available. Please try a different one.",
        error: true
      })
    } else {
      next(err);
    }
  }
})

router.post("/login", (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err)
    if (!user) {
      res.status(401).json({
        payload: null,
        message: "Wrong username or password",
        error: true
      })
    } else {
      req.logIn(user, err => {
        if (err) return next(err)
        res.json({
          payload: {
            user: req.user,
          },
          message: "Log-in successful",
          error: false
        })
      })
    }
  })(req, res, next)
})

router.get('/logout', loginRequired, (req, res) => {
  req.logout();
  res.json({
    payload: null,
    message: "Log-out successful",
    error: false
  })
})

router.get('/user', loginRequired, (req, res) => {
  res.json({
    payload: {
      user: req.user
    },
    message: "Retrieved logged in user",
    error: false
  })
})

module.exports = router;
