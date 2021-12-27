var express = require('express');

var router = express.Router();
var User = require('../models/user');
var Article = require('../models/articles');
var Comment = require('../models/comment');
var auth = require('../middlewares/auth');

router.get('/', (req, res) => {
        Article.find({}, (err, articles) => {
            if(err) return next(err);
            res.render('articles', { articles });
        })
})

router.get('/new', auth.loggedInUser ,(req, res) => {
    res.render('articleForm');
})

router.get('/:slug', (req, res, next) => {
    var slug = req.params.slug;
    Article.findOne({ slug }).populate('author', 'fullName').populate({path: 'comments', populate: {path: 'author', select: 'fullName'}}).exec((err, article) => {
        if(err) return next(err);
        res.render('singleArticle', { article });
    })
})

router.use(auth.loggedInUser);

router.get('/:id/like', (req, res, next) => {
    var id = req.params.id;
    Article.findByIdAndUpdate(id, {$inc: {likes: 1}}, (err, likes) => {
        if(err) return next(err);
        res.redirect('/articles/' + likes.slug);
    })
})

router.post('/', (req, res, next) => {
    req.body.author = req.user._id;
    Article.create(req.body, (err, article) => {
        if(err) return next(err);
        return res.redirect('/articles');
    })
})

router.get('/:slug/edit', (req, res) => {
    var slug = req.params.slug;
    Article.findOne({ slug }).populate('author', 'fullName').exec((err, article) => {
        if(err) return next(err);
        if(article.author.id !== req.user.id) {
            return res.redirect('/articles/' + slug);
        }
        res.render('editArticle', { article });
    })
})

router.post('/:slug', (req, res, next) => {
    var slug = req.params.slug;
    Article.findOne({ slug }).populate('author','fullName').exec((err, article) => {
        if(err) return next(err);
        if(article.author.id !== req.user.id) {
            return res.redirect('/articles/' + slug);
        }
        Article.findOneAndUpdate({ slug }, req.body, (err, articleUpdated) => {
            if(err) return next(err);
            return res.redirect('/articles/' + articleUpdated.slug);
        })
    })
})

router.get('/:slug/delete', (req, res, next) => {
    var slug = req.params.slug;
    Article.findOne({ slug }).populate('author', 'fullName').exec((err, article) => {
        if(err) return next(err);
        if(article.author.id !== req.user.id) {
            return res.redirect('/articles/' + slug);
        }
        Article.findOneAndDelete({ slug }, (err, articleDeleted) => {
            if(err) return next(err);
            Comment.deleteMany({ articleId: articleDeleted.id }, (err, deletedComment) => {
                if(err) return next(err);
                return res.redirect('/articles');
            })
        })
    })
})

router.post('/:slug/comment', (req, res, next) => {
    var slug = req.params.slug;
    req.body.articleId = slug;
    req.body.author = req.user.id;
    Comment.create(req.body, (err, comment) => {
        if(err) return next(err);
        Article.findOneAndUpdate({ slug: slug}, { $push: { comments: comment.id }}, (err, articleUpdate) => {
            if(err) return next(err);
            return res.redirect('/articles/' + articleUpdate.slug);
        })
    })
})

module.exports = router;