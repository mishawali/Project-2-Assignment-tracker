const express = require('express')
const app = express()
const hbs = require('hbs');
const path    = require('path')
const cookieSession = require('cookie-session')
const passport = require('passport');
const isLoggedIn = require('./middleware/auth');
require('./passport')
app.set('viewengine','hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(cookieSession({
  name: 'github-auth-session',
  keys: ['key1', 'key2']
}))
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());
app.get('/auth/error', (req, res) => res.send('Unknown Error'))
app.get('/auth/github',passport.authenticate('github',{ scope: [ 'user:email' ] }));
app.get('/auth/github/callback',passport.authenticate('github', { failureRedirect: '/auth/error' }),
function(req, res) {
  res.redirect('/');
});

hbs.registerPartials(__dirname+'/views/partials')
app.get('/',(req,res,next)=>{
    let data = {
        layout: false
      }
  res.render('login.hbs',data);
})
app.get('/github',(req,res)=>{
    res.redirect('/home');
})
app.get('/home',isLoggedIn,(req,res)=>{
    res.render('home.hbs');

})
app.get('/createtask',isLoggedIn,(req,res)=>{
    res.render('createtask.hbs');
})
app.get('/viewtasks',isLoggedIn,(req,res)=>{
    res.render('viewtasks.hbs');
})
app.get('/deletetask',isLoggedIn,(req,res)=>{
    res.render('deletetask.hbs');
})
app.get('/logout', (req, res) => {
  req.session = null;
  req.logout();
  res.redirect('/');
})
app.listen(8000,()=>{
console.log('Serve is up and running at the port 8000')
})