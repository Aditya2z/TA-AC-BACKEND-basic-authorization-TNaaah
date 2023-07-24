var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var flash = require("connect-flash");

var session = require("express-session");
const MongoStore = require("connect-mongo");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var adminRouter = require("./routes/admin");
var podcastsRouter = require('./routes/podcasts');
const seedAdmin = require("./middlewares/seed");
const auth = require('./middlewares/auth');

var app = express();

// Configuring environment variables
require("dotenv").config();

//Connecting to database
mongoose
  .connect("mongodb://127.0.0.1/podcast")
  .then(() => {
    console.log("Connected Successfully to podcast DB");
  })
  .catch((err) => {
    console.log("Error Connecting to DB", err);
  });

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Serve static files from the 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//Setting up sessions
app.use(
  session({
    secret: process.env.secret,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
      mongoUrl: "mongodb://127.0.0.1/podcast",
    }),
  })
);

app.use(flash());
seedAdmin().then(() => {
  console.log("Admin user seeding completed.");
}); //To run it only once at start and not run on every incoming request we don't use app.use middleware

app.use(auth.userInfo);

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/admin", adminRouter);
app.use("/podcasts", podcastsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
