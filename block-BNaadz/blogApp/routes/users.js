var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Article = require('../models/articles');
const auth = require('../middlewares/auth');
/* GET users listing. */
router.get('/', auth.loggedInUser, function(req, res, next) {
      res.render('dashboard');
});

router.get('/register', (req, res) => {
  var exist = req.flash('exist')[0];
  var min = req.flash('min')[0];
  res.render('register', { exist, min});
});

router.get('/login', (req, res) => {
  var success = req.flash('success')[0];
  var ep = req.flash('ep')[0];
  var email = req.flash('email')[0];
  var password = req.flash('password')[0];
  res.render('login', {success, ep, email, password});
});


router.post('/register', (req, res, next) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if(err) return next(err);
    if(user) {
      req.flash('exist', 'Email is already registered');
      return res.redirect('/users/register');
    }
    if(req.body.password.length <= 5) {
      req.flash('min', 'Password less than 5 Characters');
      return res.redirect('/users/register');
    }
    User.create(req.body, (err, userCreated) => {
      if(err) return next(err);
      console.log(err, userCreated);
      req.flash('success', 'Register Successfully');
      return res.redirect('/users/login');
    })
  })
})

router.post('/login', (req, res, next) => {
  var { email , password } = req.body;
  if(!email || !password) {
    req.flash('ep', 'Email/Password is required');
    return res.redirect('/users/login');
  }
  User.findOne({ email }, (err, user) => {
    if(err) return next(err);
    if(!user) {
      req.flash('email', 'Email is not registered');
      return res.redirect('/users/login');
    }
    user.verifyPassword(password, (err, result) => {
      if(err) return next(err);
      if(!result) {
        req.flash('password', 'Password is Incorrect');
        return res.redirect('/users/login');
      }
      req.session.userId = user.id;
      return res.redirect('/users');
    })
  })
})

router.get('/logout', (req, res, next) => {
  req.session.destroy();
  res.clearCookie('connect-sid')
  return res.redirect('/users/login');
})

module.exports = router;
