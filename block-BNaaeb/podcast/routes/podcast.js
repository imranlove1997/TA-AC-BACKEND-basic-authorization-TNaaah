var express = require('express');

var router = express.Router();
var Podcast = require('../models/podcast');
var auth = require('../middlewares/auth');

router.get('/', (req, res, next) => {
    Podcast.find({}, (err, podcasts) => {
        if(err) return next(err);
        res.render('podcast', { podcasts });
    })
})

router.use(auth.loggedInUser);

router.get('/new', (req, res) => {
    res.render('podcastForm');
})

router.post('/', (req, res, next) => {
    Podcast.create(req.body, (err, podcastCreated) => {
        if(err) return next(err);
        return res.redirect('/podcast');
    })
})

module.exports = router;