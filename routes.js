var express = require('express');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));


require('dotenv').config();


passport.use(new FacebookStrategy({
  clientID: process.env['FACEBOOK_APP_ID'],
  clientSecret: process.env['FACEBOOK_APP_SECRET'],
  callbackURL: 'https://localhost:8000/auth/facebook/callback',
  state: true
}, function verify(accessToken, refreshToken, profile, cb) {
  const user = { accessToken, refreshToken, profile }
  return cb(null, user)
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
  async (req, res) => {
    console.log("user", req.user)
    res.redirect('/success');
  }
);


router.get('/login', function (req, res, next) {
  res.render('login', { hasMessages: true, messages: ['Facebook login integration - demo'] });
});

router.get('/login/federated/facebook', passport.authenticate('facebook'));

router.get('/oauth2/redirect/facebook', passport.authenticate('facebook',
  { scope: ['business_management', 'pages_show_list', 'instagram_basic', 'pages_read_engagement'] }
));

router.post('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});




module.exports = router;