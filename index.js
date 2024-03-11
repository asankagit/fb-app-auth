// curl -k https://localhost:8000/
const https = require('node:https');
const http = require('http')
const fs = require('node:fs');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook');
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();
const routes = require("./routes");
console.log({ routes })

const app = express();

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.set("port", 3000);
const options = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem'),
  passphrase: "123456",
};



app.use("/", routes )

passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "https://localhost:8000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ facebookId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));


http.createServer(app).listen(3000); 
https.createServer(options, app).listen(8000); 