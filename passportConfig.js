const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// Utility Import
const { authenticateUser, findByUsername } = require('./util');
const { ReturnCodes } = require('./returnCodes');

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

// Serialize and deserialize users to persist session
passport.serializeUser((user, done) => done(null, user.username));
passport.deserializeUser((username, done) => {
  findByUsername(username, (retCode, user, err) => {
    if(retCode === ReturnCodes.SUCCESS) return done(err, user);
    return done(err);
  })
});