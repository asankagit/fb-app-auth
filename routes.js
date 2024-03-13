var express = require('express');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const {callGraphAPI} = require('./utils/graphAPIcalls')


require('dotenv').config();

const getPageAccessToken = (accessToken) => {
  console.log("get page token", accessToken)
  return new Promise((resolve, reject) => {
    const https = require('https');
    const options = {
      hostname: 'graph.facebook.com',
      path: '/v19.0/me/accounts?access_token=' + accessToken,
      method: 'GET'
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      })

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log({ jsonData })
          if (jsonData.data && jsonData.data.length > 0) {
            resolve(jsonData.data[0].access_token);

          } else {
            reject(new Error('insuffient permissions'))
          }
        } catch (error) {
          reject(new Error('failed to parse the response' + error.messages));
        }
      });

      res.on('error', (error) => {
        reject(new Error('Error during API request' + error.message))
      })
    });
    req.end();

  });
  
}

passport.use(new FacebookStrategy({
  clientID: process.env['FACEBOOK_APP_ID'],
  clientSecret: process.env['FACEBOOK_APP_SECRET'],
  callbackURL: 'https://localhost:8000/auth/facebook/callback',
  state: true
}, async function verify(accessToken, refreshToken, profile, cb) {
  const user = { accessToken, refreshToken, profile }
  try {
    const pageAccessToken = await getPageAccessToken(accessToken);
    return cb(null, { accessToken, refreshToken, profile, pageAccessToken })
  } catch(error) {
      console.log(error)
    return   cb(error)
  }
  // return cb(null, user)
}));

passport.serializeUser(function (user, cb) {
  console.log("serialize user")
  process.nextTick(function () {
    cb(null, { id: user.profile.id, pageAccessToken: user.pageAccessToken, accessToken: user.accessToken});
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
  (req, res) => {
    console.log("user", req.user)
    // res.send("OK")
    res.redirect('/api/page-details');
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


router.get('/api/page-details',
// passport.authenticate('facebook', { failureRedirect: '/login'})
async (req, res, next) => {

  const pageAccessToken = req.user?.pageAccessToken
  const userToken = req.user?.accessToken;

  
  if (req.user) {
    const pageDetails = await callGraphAPI({
      accessToken: pageAccessToken,  pathUri: 'me?fields=instagram_business_account&', method: 'GET'
    })
    console.log({ pageDetails })
    const {instagram_business_account } = pageDetails || {}
    console.log('insta_id', instagram_business_account.id)
    if (!instagram_business_account) {
      res.send(resp)
    }
    const mediaList = await callGraphAPI({
      accessToken: pageAccessToken,  pathUri: `${instagram_business_account.id}/media?`, method: 'GET'
    })
    if (!Array.isArray(mediaList.data)) {
      res.send(mediaList)
    }
    const promises = mediaList.data.map(({id}) => {
      return callGraphAPI({
        accessToken: pageAccessToken,  pathUri: `${id}?fields=caption,media_type,media_url&limit=100&`, method: 'GET'
      })
    })
    const mediaResult = await Promise.allSettled(promises)
    
    
    res.send(mediaResult);
    console.log(mediaList)
    
  } else {
    res.send({
      pageAccessToken, userToken
    })
  }
})


module.exports = router;