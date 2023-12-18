const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;

// Hardcoded database
const info = require ('./db/pokemonAPI-help.json');

// Router imports
const pokedexRouter = require('./pokedexRouter');
const loginRouter = require('./loginRouter');

// Request Body Parser
const bodyParser = require('body-parser');
app.use(bodyParser.json());

// Logger
const morgan = require('morgan');
const { authenticateUser, findByUsername, isAuthenticated } = require('./util');
const { ReturnCodes } = require('./returnCodes');
app.use(morgan('dev'));

// Authentication
const session = require('express-session');
const store = new session.MemoryStore();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

app.use(session({
  secret: "p0kemon_Rul3z", // This is not meant to be hardcoded!
  cookie: { maxAge: 300000, secure: false },
  saveUninitialized: false,
  resave: false,
  store
}));

app.use(passport.initialize());
app.use(passport.session());

// Serialize and deserialize users to persist session
passport.serializeUser((user, done) => done(null, user.username));
passport.deserializeUser((username, done) => {
  findByUsername(username, (retCode, user, err) => {
    if(retCode === ReturnCodes.SUCCESS) return done(err, user);
    return done(err);
  })
});

// Set local strategy for authentication
passport.use(new LocalStrategy(async (username, password, done) => {
  await authenticateUser(username, password, (retCode, user, err) => {
    switch (retCode) {      
      case ReturnCodes.NOT_FOUND:
        return done(err, false);
      
      case ReturnCodes.INVALID_PASSWORD:
        return done(err, false);
      
      case ReturnCodes.SUCCESS:
        return done(err, user);
      
      default:
        return done(err);

    }
  });
}));

app.use(isAuthenticated);

// ==================== GET ====================
app.get('/', (req, res, next) => {
  res.send(info[0]);
});

app.get('/help', (req, res, next) => {
  res.send(info[1]);
});

// Pokedex Routes
app.use('/pokedex', pokedexRouter);

// User Login and Registration Routes
app.use('/', loginRouter);

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).send({ error: err.status, message: err.message});
});

app.listen(PORT, () => {
  console.log(`Server listening on Port:${PORT}`);
});