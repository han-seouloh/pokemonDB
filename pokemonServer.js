const express = require('express');
const app = express();
require('dotenv').config();
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
app.use(morgan('dev'));

// Utility Imports
const { isAuthenticated, initializeAdmin, finishServerSetup } = require('./util');


// Session Configuration
const session = require('express-session');
const store = new session.MemoryStore();

app.use(session({
  secret: "p0kemon_Rul3z", // This is not meant to be hardcoded!
  cookie: { maxAge: 300000, secure: false },
  saveUninitialized: false,
  resave: false,
  store
}));

// Passport Configuration
const passport = require('passport');
require('./passportConfig');

app.use(passport.initialize());
app.use(passport.session());

// Check if session is authenticated
app.use(isAuthenticated);

// ==================== GET ====================
app.get('/', (req, res, next) => {
  res.send(info[0]);
});

app.get('/help', (req, res, next) => {
  res.send(info[1]);
});

// ==================== ROUTES ==================
// Pokedex Routes
app.use('/pokedex', pokedexRouter);

// User Login and Registration Routes
app.use('/', loginRouter);

// =================== ERRORS ===================
// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).send({ error: err.status, message: err.message});
});


// =================== FINAL CONFIGS ===================
const setupFnArray = [
  {
    "fn": initializeAdmin,
    "params": [process.env.ADMIN_USERNAME, process.env.ADMIN_PASSWORD]
  }
];

finishServerSetup(setupFnArray)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on Port:${PORT}`);
    });  
  })
  .catch((err) => {
    console.log('Error setting up final configs...');
    console.log(err);
  });


module.exports = app;