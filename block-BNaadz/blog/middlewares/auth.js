var User = require('../models/user');
var Article = require('../models/article');
var Comment = require('../models/comment');

auth = {
    // Define a middleware function to check if the user is logged in
    isLoggedIn: (req, res, next) => {
    // Check if the user is authenticated
    if (req.session.userId) {
      // User is logged in, proceed to the next middleware
      next();
    } else {
      // User is not logged in, redirect to the login page
      req.flash("error", "Authentication Required, Login first!")
      res.redirect("/users/login");
    }
  },

  userInfo: (req, res, next) => {
    var userId = req.session.userId;
    if(userId) {
        User.findById(userId, "fullname email")
        .then((user) => {
            req.user = user;
            res.locals.user = user;
            next();
        })
        .catch((err) => {
            next(err);
        })
    } else {
        req.user = null;
        res.locals.user = null;
        next();
    }
  },

  isAuthor:(req, res, next) => {
    var userId = req.session.userId;
        Article.findById(req.params.id).then((article) => {
            if(article.author._id.toString() === userId) {
                next();
            } else {
                req.flash("error", "Cannot edit article written by others");
                res.redirect("/articles");
            }
        });
    },


    isCommentAuthor: (req, res, next) => {
        var userId = req.session.userId;
        Comment.findById(req.params.id).then((comment) => {
            if(comment.author._id.toString() === userId) {
                next();
            } else {
                req.flash("error", "Cannot edit comment written by others");
                res.redirect("/articles");
            }
        });
    }
}

module.exports = auth;