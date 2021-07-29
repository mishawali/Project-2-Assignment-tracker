const express = require('express')
const app = express()
const cookieSession = require('cookie-session')
const passport = require('passport');
const isLoggedIn = require('./middleware/auth');
require('./passport')
app.use(cookieSession({
  name: 'github-auth-session',
  keys: ['key1', 'key2']
}))
app.use(passport.initialize());
app.use(passport.session());
app.get('/auth/error', (req, res) => res.send('Unknown Error'))
app.get('/auth/github',passport.authenticate('github',{ scope: [ 'user:email' ] }));
app.get('/auth/github/callback',passport.authenticate('github', { failureRedirect: '/auth/error' }),
function(req, res) {
  res.redirect('/');
});


app.get('/',isLoggedIn,(req,res)=>{
  res.send("Hello");
})
app.get('/logout', (req, res) => {
  req.session = null;
  req.logout();
  res.redirect('/auth/github');
})
app.listen(8000,()=>{
console.log('Serve is up and running at the port 8000')
})