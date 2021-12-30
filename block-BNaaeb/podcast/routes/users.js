var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Admin = require('../models/admin');
var Podcast = require('../models/podcast');
var auth = require('../middlewares/auth');

/* GET users listing. */
router.get('/', auth.loggedInAdmin,function(req, res, next) {
  Podcast.find({}, (err, podcasts) => {
    res.render('dashboard', { podcasts });
  })
});

router.get('/register', (req, res) => {
  var email = req.flash('email')[0];
  var username = req.flash('username')[0];
  var password = req.flash('password')[0];
  res.render('register', {email ,username, password });
});

router.get('/login', (req, res) => {
  var username = req.flash('username')[0];
  var user = req.flash('user')[0];
  var password = req.flash('password')[0];
  res.render('login', { username, user, password });
})

router.post('/register', (req, res, next) => {
User.findOne( {email: req.body.email }, (err, user) => {
  if(err) return next(err);
  if(user) {
    req.flash('email', 'User already exist');
    return res.redirect('/users/register');
  }
  User.findOne({ username: req.body.username }, (err, username) => {
    if(username) {
      req.flash('username', 'Username is alreayd in use');
      return res.redirect('/users/register');
    }
  })
  if(req.body.password.length <= 5) {
    req.flash('password', 'Password less than 5');
    return res.redirect('/users/register');
  }
  User.create(req.body, (err, userCreated) => {
    if(err) return next(err);
    return res.redirect('/users/login');
  })
})
})

router.post('/login', (req, res, next) => {
  var { username, password } = req.body;
  if(!username || !password) {
    req.flash('username', 'Username/Password is required');
    return res.redirect('/users/login');
  }
  User.findOne({ username }, (err, user) => {
    if(err) return next(err);
    if(!user) {
      req.flash('user', 'Username is not available');
      return res.redirect('/users/login');
    }
    user.verifyPassword(password, (err, result) => {
      if(err) return next(err);
      if(!result) {
        req.flash('password', 'Password is incorrect');
        return res.redirect('/users/login');
      }
      req.session.userId = user;
      return res.redirect('/podcast');
    })
  })
})

router.get('/logout', (req, res, next) => {
  req.session.destroy();
  res.clearCookie('connect-sid');
  return res.redirect('/users/login');
})

router.get('/admin', (req, res) => {
  res.redirect('/users/admin/login');
})

router.get('/admin/youcantregisterhere', (req, res) => {
  res.render('adminRegister');
})

router.post('/admin/youcantregisterhere', (req, res, next) => {
  Admin.create(req.body, (err, adminCreated) => {
    if(err) return next(err);
    return res.redirect('/users/admin/login');
  })
})

router.get('/admin/login', (req, res) => {
  var ep = req.flash('ep')[0];
  var email = req.flash('email')[0];
  var password = req.flash('password')[0];
  res.render('adminLogin', { ep, email, password });
})

router.post('/admin/login', (req, res, next) => {
  var { email , password}  = req.body;
  if(!email || !password) {
    req.flash('ep', 'Email/Password is required');
    return res.redirect('/users/admin/login');
  }
  Admin.findOne({ email }, (err, admin) => {
    if(err) return next(err);
    if(!admin) {
      req.flash('email', 'You are not admin');
      return res.redirect('/users/admin/login');
    }
    admin.verifyPassword(password, (err, result) => {
      if(err) return next(err);
      if(!result) {
        req.flash('password', 'Password is incorrect');
        return res.redirect('/users/admin/login');
      }
      req.session.adminId = admin.id;
      return res.redirect('/users');
    })
  })
})

router.get('/admin/logout', (req, res, next) => {
  req.session.destroy();
  res.clearCookie('connect-sid');
  return res.redirect('/podcast');
})

module.exports = router;
