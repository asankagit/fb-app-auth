// curl -k https://localhost:8000/
const https = require('node:https');
const http = require('http')
const fs = require('node:fs');
const passport = require('passport');
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();
const routes = require("./routes");
const session = require("express-session");


const app = express();


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.set("port", 3000);
const options = {
  key: fs.readFileSync('./certificates/key.pem'),
  cert: fs.readFileSync('./certificates/cert.pem'),
  passphrase: process.env['PASSPHRASE']
};



app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))
app.use(passport.initialize());
app.use(passport.session());
app.use("/", routes )


http.createServer(app).listen(3000); 
https.createServer(options, app).listen(8000); 