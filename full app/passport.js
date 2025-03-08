const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;

require('dotenv').config();

passport.use(new GoogleStrategy(
  {
    clientID: process.env.clientID, 
    clientSecret: process.env.clientSecret, 
    callbackURL: 'http://localhost:5001/auth/google/callback', 
    passReqToCallback: true, 
  },
  (request, accessToken, refreshToken, profile, done) => {
//     console.log("CLIENT_ID:", process.env.CLIENT_ID);
// console.log("CLIENT_SECRET:", process.env.CLIENT_SECRET);

    return done(null, profile);
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = passport;