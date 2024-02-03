const express = require('express');
const app = express();
module.exports = app;
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
require('./loggerConfig');
const { logger, testLogger } = require('./loggerConfig');

// Utility Imports
const { isAuthenticated, initializeAdmin, finishServerSetup, runAsyncFunctions } = require('./util');


// Session Configuration
const session = require('express-session');
const store = new session.MemoryStore();

app.use(session({
  secret: process.env.SESSION_ENCRYPTION_SECRET,
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
  if (process.env.NODE_ENV !== 'test') {
    logger.error(err);
  } else {
    testLogger.error(err);
  };
  res.status(err.status || 500).send({error: err.message, status: err.status});
});


// =================== FINAL CONFIGS ===================
const setupFnArray = [
  {
    "fn": initializeAdmin,
    "params": [process.env.ADMIN_USERNAME, process.env.ADMIN_PASSWORD]
  }
];

runAsyncFunctions(setupFnArray)
  .then(() => {
    process.env.SERVER_SETUP_COMPLETE = 'true';
  })
  .catch((err) => {
    logger.error('Error setting up final configs...');
    logger.error(err);
  });

app.listen(PORT, () => {
  logger.log(`Server listening on Port:${PORT}`);
});  