const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});
passport.use(new GitHubStrategy({
  clientID: "7e648e84dd9b2dd84b2d",
  clientSecret: "f11b9ab01abd51e01cb71908154dd5cdda26417a",
  callbackURL: "http://localhost:8000/auth/github/callback"
},
function(accessToken, refreshToken, profile, done) {
  return done(null, profile);
}
));

passport.serializeUser(function(user, done) {
    done(null, user);
  });
  passport.deserializeUser(function(user, done) {
    done(null, user);
  });
  passport.use(new FacebookStrategy({
    clientID: "206759228063159",
    clientSecret: "44025bbcc1669bc74f2f887eb5e2adab",
    callbackURL: "http://localhost:8000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }
  ));