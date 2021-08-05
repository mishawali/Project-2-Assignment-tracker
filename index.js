const express = require('express');
const { MongoClient } = require("mongodb");
const mongo = require("mongodb");
const app = express()
const hbs = require('hbs');
const path = require('path')
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session')
const passport = require('passport');
const isLoggedIn = require('./middleware/auth');
const FacebookStrategy = require('passport-facebook').Strategy;
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
app.use('/js', express.static(__dirname + '/js'));
app.use(passport.initialize());
app.use(passport.session());
app.get('/auth/error', (req, res) => res.send('Unknown Error'))
app.get('/auth/facebook', passport.authenticate('facebook',{scope:'email'}));
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect : '/home', failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

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
app.get('/facebook', (req,res)=>{
  res.render('fblogin.hbs');
})
app.get('/home', isLoggedIn, async(req, res) => {
  var disname = req.user.displayName;
  var photo = req.user.photos;
  var image = photo[0].value;
  var tasks = await Listtasks();
  // console.log(tasks);
  res.render('home.hbs',{userdata:{
    name:disname,
    image:image,
    tasks:tasks
  }

  });

})
app.get('/createtask', isLoggedIn, (req, res) => {
  res.render('createtask.hbs');
})
app.get('/viewtasks',async(req, res) => {
  var tasks = await Listtasks();
  res.render('viewtasks.hbs',{tasks:tasks});
  
})
app.get('/edittask', async(req,res)=>{
  var tasks = await Listtasks();
  res.render('edittask.hbs',{tasks:tasks});
})
app.get('/deletetask', async (req, res) => {
  var tasks = await Listtasks();
  res.render('deletetask.hbs',{tasks:tasks});
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
  res.redirect('/home');
})

app.post('/edittask', async(req,res)=>{
  var taskid = req.body.taskid;
  var taskname = req.body.taskname;
  var desc = req.body.taskdesc;
  var course = req.body.taskcourse;
  var date = req.body.taskdate;
  var o_id = new mongo.ObjectId(taskid);
  const filter = {'_id': o_id};
  const options = { upsert: false };

  const record = { name: taskname, description: desc, taskcourse: course, taskdate: date };
  Updatetask(record,filter,options).catch(console.dir)
  res.redirect('/viewtasks');
})

app.post('/deletetask', async(req,res)=>{
  var taskid = req.body.taskid;
  var o_id = new mongo.ObjectId(taskid);
  var op = await DeleteTask(o_id);
  if (op==true) {
    res.redirect('./viewtasks');    
  }
})

app.post('/gettaskdetail',async(req,res)=>{
  var taskid = req.body.id;
  var detail = await GettaskDetail(taskid);
  res.send(JSON.stringify(detail));
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

async function GettaskDetail(taskid){
  try{
    await client.connect();
    const database = client.db("taskdb");
    var o_id = new mongo.ObjectId(taskid);
    const data = await database.collection("tasks").findOne({'_id': o_id});
   return data;

  }finally{
    await client.close();
  }
}

async function Updatetask(record,filter,options){
  try{
    await client.connect();
    const database = client.db("taskdb");
    const tasks = database.collection("tasks");
    const result = await tasks.replaceOne(filter, record, options);
    console.log(
      `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
    );
  }finally{
    await client.close();
    
  }  
}

async function DeleteTask(taskid){
  try{
    await client.connect();
    const database = client.db("taskdb");
    const tasks = database.collection("tasks");
    const result = await tasks.deleteOne({'_id': taskid});
    // console.log(
    //   `${result.matchedCount} document(s) matched the filter, deleted ${result.modifiedCount} document(s)`,
    // );
    return true;

  }finally{
    await client.close();
  }
}


app.listen(8000, () => {
  console.log('Serve is up and running at the port 8000')
})