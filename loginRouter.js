const express = require('express');
const loginRouter = express.Router();

const passport = require('passport');
const bcrypt = require('bcrypt');

const { createUser } = require('./util');

// Login endpoint
loginRouter.get('/login', (req, res, next) => {
  res.send(info[2]);
});

loginRouter.post(
  '/login',
  passport.authenticate('local', {failureRedirect:'/login'}),
  (req, res) => {
    res.redirect('/');
  }
);

// Register endpoint
loginRouter.post("/register", async (req, res, next) => {
  const { username, password } = req.body;
  
  try {
    const response = await createUser({username, password});
    res.status(201).send({status: 'SUCCESS', newUser: response});

  } catch (err) {
    next(err);

  };
});

// Logout endpoint
loginRouter.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect("/login");
  });
});

module.exports = loginRouter; 