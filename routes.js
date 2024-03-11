var express = require('express');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));


require('dotenv').config();


passport.use(new FacebookStrategy({
  clientID: process.env['FACEBOOK_APP_ID'],
  clientSecret: process.env['FACEBOOK_APP_SECRET'],
  callbackURL: 'https://localhost:8000/auth/facebook/callback',
  state: true
}, function verify(accessToken, refreshToken, profile, cb) {

  console.log("this is calling")
  return cb(accessToken, refreshToken, profile)
  // db.get('SELECT * FROM federated_credentials WHERE provider = ? AND subject = ?', [
  //   'https://www.facebook.com',
  //   profile.id
  // ], function(err, row) {
  //   if (err) { return cb(err); }
  //   if (!row) {
  //     db.run('INSERT INTO users (name) VALUES (?)', [
  //       profile.displayName
  //     ], function(err) {
  //       if (err) { return cb(err); }
  //       var id = this.lastID;
  //       db.run('INSERT INTO federated_credentials (user_id, provider, subject) VALUES (?, ?, ?)', [
  //         id,
  //         'https://www.facebook.com',
  //         profile.id
  //       ], function(err) {
  //         if (err) { return cb(err); }
  //         var user = {
  //           id: id,
  //           name: profile.displayName
  //         };
  //         return cb(null, user);
  //       });
  //     });
  //   } else {
  //     db.get('SELECT * FROM users WHERE id = ?', [ row.user_id ], function(err, row) {
  //       if (err) { return cb(err); }
  //       if (!row) { return cb(null, false); }
  //       return cb(null, row);
  //     });
  //   }
  // });
}));

passport.serializeUser(function (user, cb) {
  console.log("serialize user")
  process.nextTick(function () {
    cb(null, { id: user.id, username: user.username, name: user.name });
  });
});

passport.deserializeUser(function (user, cb) {
  console.log("de-serialize user")
  process.nextTick(function () {
    return cb(null, user);
  });
});


var router = express.Router();
router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect('/success');
  }
);


router.get('/login', function (req, res, next) {
  res.render('login', { hasMessages: true, messages: [1] });
});

router.get('/login/federated/facebook', passport.authenticate('facebook'));

router.get('/oauth2/redirect/facebook', passport.authenticate('facebook', 
{
  successReturnToOrRedirect: '/',
  failureRedirect: '/login'
}));

router.post('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});


router.get('/user-token/:token', async function (req, res, next) {
  const token = req.params.token;
  const result =  await fetch(`https://graph.facebook.com/v19.0/me?fields=accounts&access_token=${token}`).then(res => res.json())

  console.log(result)
  res.send(JSON.stringify(result))
});



module.exports = router;