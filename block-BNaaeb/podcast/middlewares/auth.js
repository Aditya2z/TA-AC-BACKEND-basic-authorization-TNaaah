var User = require("../models/user");

var auth = {
    isUserLogged: (req, res, next) => {
        const userId = req.session.userId;
        if(!userId) {
            req.flash("error", "Login and try again!");
            res.redirect("/users/login");
        } else {
            next();
        }
    },

    userInfo: (req, res, next) => {
        const userId = req.session.userId;
        if (userId) {
          User.findById(userId, "-password")
            .then((user) => {
              if (user) {
                req.user = user;
                res.locals.user = user;
                next();
              } else {
                req.user = null;
                res.locals.user = null;
                next();
              }
            })
            .catch((err) => {
              req.user = null;
              res.locals.user = null;
              next(err);
            });
        } else {
          req.user = null;
          res.locals.user = null;
          next();
        }
      },      

    isAdmin: (req, res, next) => {
        var userId = req.session.userId;

        User.findById(userId)
        .then((user) => {
            if(user.isAdmin) {
                next();
            } else {
                req.flash("error", "Access not granted!");
                res.end();
            }
        })
    },

    isVip: (req, res, next) => {
      var userId = req.session.userId;

      User.findById(userId)
        .then((user) => {
            if(user.membership === "vip" || user.isAdmin) {
                next();
            } else {
                req.flash("error", "Access not granted!");
                res.end();
            }
        })
    },


    isPremium: (req, res, next) => {
      var userId = req.session.userId;

      User.findById(userId)
        .then((user) => {
            if(user.membership === "premium" || user.isAdmin) {
                next();
            } else {
                req.flash("error", "Access not granted!");
                res.end();
            }
        })
    },
    
}

module.exports = auth;