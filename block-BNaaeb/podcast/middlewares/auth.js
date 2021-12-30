var User = require('../models/user');
var Admin = require('../models/admin');


module.exports = {
    loggedInUser: (req, res, next) => {
        if(req.session && req.session.userId) {
            next();
        } else {
            res.redirect('/users/login');
        }
    },
    loggedInAdmin: (req, res, next) => {
        if(req.session && req.session.adminId) {
            next();
        } else {
            res.redirect('/users/login');
        }
    },
    userInfo: (req, res, next) => {
        var userId = req.session && req.session.userId;
        if(userId) {
            User.findById(userId, 'username', (err, user) => {
                if(err) return next(err);
                req.user = user;
                res.locals.user = user;
                next();
            })
        } else {
            req.user = null;
            res.locals.user = null;
            next();
        }
    },
    adminInfo: (req, res, next) => {
        var adminId = req.session && req.session.adminId;
        if(adminId) {
            Admin.findById(adminId, 'email', (err, admin) => {
                if(err) return next(err);
                req.admin = admin;
                res.locals.admin = admin;
                next();
            })
        } else {
            req.admin = null;
            res.locals.admin = null;
            next();
        }
    }
}