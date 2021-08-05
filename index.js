const express = require('express');
const { MongoClient } = require("mongodb");
const app = express()
const hbs = require('hbs');
const path = require('path')
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session')
const passport = require('passport');
const isLoggedIn = require('./middleware/auth');
const config = require('./db/config.json');
const uri = config.db.uri;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
app.use(express.static('views'));
require('./passport')
app.set('viewengine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(cookieSession({
  name: 'github-auth-session',
  keys: ['key1', 'key2']
}))
app.use(express.urlencoded());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());
app.get('/auth/error', (req, res) => res.send('Unknown Error'))
app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/auth/error' }),
  function (req, res) {
    res.redirect('/');
  });

hbs.registerPartials(__dirname + '/views/partials')
app.get('/', (req, res, next) => {
  let data = {
    layout: false
  }
  res.render('login.hbs', data);
})
app.get('/github', (req, res) => {
  res.redirect('/home');
})
app.get('/home', isLoggedIn, (req, res) => {
  res.render('home.hbs');

})
app.get('/createtask', isLoggedIn, (req, res) => {
  res.render('createtask.hbs');
})
app.get('/viewtasks',async(req, res) => {
  var tasks = await Listtasks();
  res.render('viewtasks.hbs',{tasks:tasks});
  
})
app.get('/deletetask', isLoggedIn, (req, res) => {
  res.render('deletetask.hbs');
})
app.get('/logout', (req, res) => {
  req.session = null;
  req.logout();
  res.redirect('/');
})

app.post('/createtask', (req, res) => {
  var taskname = req.body.taskname;
  var desc = req.body.taskdesc;
  var course = req.body.taskcourse;
  var date = req.body.date;
  const record = { name: taskname, description: desc, taskcourse: course, taskdate: date };
  InsertTask(record).catch(console.dir);
  res.redirect('/viewtasks');
})
app.listen(8000, () => {
  console.log('Serve is up and running at the port 8000')
})

async function InsertTask(record) {
  try {
    await client.connect();

    const database = client.db("taskdb");
    const tasks = database.collection("tasks");
    // create a document to be inserted
    const result = await tasks.insertOne(record);

    console.log(
      `${result.insertedCount} documents were inserted with the _id: ${result.insertedId}`,
    );
  } finally {
    await client.close();
  }
}

async function Listtasks() {
  try {
    await client.connect();
    const database = client.db("taskdb");
    const data = await database.collection('tasks').find().toArray();
    return data;

  } finally {
    await client.close();
    
  }

}