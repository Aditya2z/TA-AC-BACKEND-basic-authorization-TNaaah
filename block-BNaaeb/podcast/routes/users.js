var express = require("express");
var router = express.Router();
var User = require("../models/user");
var bcrypt = require("bcrypt");
const auth = require("../middlewares/auth");
var Podcast = require("../models/podcast");

/* GET users listing. */
router.get("/", auth.isAdmin, function (req, res, next) {
  const successMessage = req.flash("success");
  const errorMessage = req.flash("error");
  res.render("users.ejs", { successMessage, errorMessage });
});

// New User
router.get("/new", (req, res, next) => {
  const successMessage = req.flash("success");
  const errorMessage = req.flash("error");
  res.render("createUser", { successMessage, errorMessage });
});

router.post("/new", (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (user) {
        req.flash("error", "Email already registered. Use another email.");
        return res.redirect("/users/new");
      }

      User.create(req.body)
        .then((newUser) => {
          console.log(newUser);
          req.flash("success", "User created successfully.");
          res.redirect("/users/login");
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
});

// Login a user
router.get("/login", (req, res, next) => {
  const successMessage = req.flash("success");
  const errorMessage = req.flash("error");
  res.render("login", { successMessage, errorMessage });
});

// Handle user login form submission
router.post("/login", (req, res, next) => {
  var { email, password } = req.body;

  if (!email || !password) {
    req.flash("error", "Email/Password required!");
    return res.redirect("/users/login");
  }

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        req.flash("error", "Email not registered! Sign Up first.");
        return res.redirect("/users/new");
      }

      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          return next(err);
        }

        if (!result) {
          req.flash("error", "Wrong Password!");
          return res.redirect("/users/login");
        }

        req.session.userId = user._id;

        // Check if the user is an admin
        if (user.isAdmin) {
          req.flash("success", "Admin Login Successful.");
          return res.redirect("/admin/dashboard");
        } else {
          req.flash("success", "User Login Successful.");
          return res.redirect("/users/dashboard");
        }
      });
    })
    .catch((err) => {
      next(err);
    });
});

// User Dashboard
router.get("/dashboard", auth.isUserLogged, (req, res) => {
  const successMessage = req.flash("success");
  const errorMessage = req.flash("error");
  Podcast.find({}).populate("host", "name coverImageURL").then((allPodcasts) => {
    res.render("userDashboard", {allPodcasts, successMessage, errorMessage});
  });
});

//Logout a user
router.get("/logout", (req, res, next) => {
  req.session.destroy();
  res.clearCookie("connect.sid");
  res.redirect("/users/login");
});

module.exports = router;
