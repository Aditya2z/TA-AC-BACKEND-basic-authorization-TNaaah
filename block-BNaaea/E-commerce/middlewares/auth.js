var User = require("../models/user");

var auth = {
  isLoggedIn: function (req, res, next) {
    var userId = req.session.userId;
    if (!userId) {
      req.flash("error", "Authentication required! Login first.");
      res.redirect("/users/login");
    } else {
      next();
    }
  },

  isBlocked: (req, res, next) => {
    var { email } = req.body;
    User.findOne({email}).then((user) => {
        if (user.isBlocked) {
          req.flash("error", "Your Account has been suspended.");
          res.redirect("/users/login");
        } else {
          next();
        }
    })
    .catch((err) => {
        next(err);
    })
  },

  userInfo: function (req, res, next) {
    var userId = req.session.userId;
    if (userId) {
      User.findById(userId, "firstName lastName email isAdmin")
        .then((user) => {
          req.user = user;
          res.locals.user = user;
          next();
        })
        .catch((err) => {
          next(err);
        });
    } else {
      req.user = null;
      res.locals.user = null;
      next();
    }
  },

  isAdmin: function (req, res, next) {
    // Check if the user is authenticated
    User.findById(req.session.userId).then((user) => {
      if (user.isAdmin) {
        // User is admin, proceed to the next middleware
        next();
      } else {
        // User is not admin, redirect to the login page
        req.flash("error", "Access Not authorised!");
        res.redirect("/products");
      }
    });
  },
};

module.exports = auth;
