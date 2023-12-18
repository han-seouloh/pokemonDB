const express = require('express');
const loginRouter = express.Router();

// Imports
const passport = require('passport');
const bcrypt = require('bcrypt');

// Utility functions
const { createUser } = require('./util');

// Hardcoded database
const users = require('./db/users.json');
const info = require ('./db/pokemonAPI-help.json');

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
  if (req.user) return res.redirect('/');

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

// Test Endpoint
loginRouter.get('/test/login', (req, res, next) => {
  res.send(users);
});

module.exports = loginRouter; 