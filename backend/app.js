const express = require("express");
const bodyParser = require("body-parser");
const https = require('https');
const firebase = require('firebase');
firebase.initializeApp({
  apiKey: "AIzaSyCqt8b2m49wJvmjSy57OkgeueRe5aNDw4g",
  authDomain: "ketomanager-75ccb.firebaseapp.com",
  databaseURL: "https://ketomanager-75ccb.firebaseio.com",
  projectId: "ketomanager-75ccb",
  storageBucket: "ketomanager-75ccb.appspot.com",
  messagingSenderId: "122501969752",
  appId: "1:122501969752:web:463ba9eed13be1fae6172d"
});

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  next();
});

app.get('/', function(req, res) {
  res.end('Test');
});

app.get("/api/user/:userid", (req, res, next) => {


  res.status(200).json({
    message: "Posts fetched successfully!",
    posts: posts
  });
});

app.post("/api/user", (req, res, next) => {

  email = req.body.email;
  password = req.body.password;

  firebase.auth().createUserWithEmailAndPassword(email,password)
    .then(response => {

      console.log(response);

      res.status(201).json({
        message: 'User created successfully',
      });

    })
    .catch(error => {
      res.status(400).json({
        message: error
      });
    });

});

app.patch("/api/user/:userid", (req, res, next) => {
  const post = req.body;
  console.log(post);
  res.status(201).json({
    message: 'Post added successfully'
  });
});

app.delete("/api/user/:userid", (req, res, next) => {
  const post = req.body;
  console.log(post);
  res.status(201).json({
    message: 'Post added successfully'
  });
});


app.get("/api/timetable/:tid", (req, res, next) => {


  res.status(201).json({
    message: 'Post added successfully'
  });
});

app.post("/api/timetable/", (req, res, next) => {


  res.status(201).json({
    message: 'Post added successfully'
  });
});

app.patch("/api/timetable/:tid", (req, res, next) => {


  res.status(201).json({
    message: 'Post added successfully'
  });
});

app.delete("/api/timetable/:tid", (req, res, next) => {


  res.status(201).json({
    message: 'Post added successfully'
  });
});

module.exports = app;
