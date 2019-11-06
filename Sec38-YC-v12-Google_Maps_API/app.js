// As early as possible in your application, require and configure dotenv.
const dotenv = require('dotenv').config();
//
// Check if dotenv pkg reads the vars in .env file corrected
if (dotenv.error) {
  throw dotenv.error;
}
console.log(".env variables:\n", dotenv.parsed);

var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    flash       = require("connect-flash"), /***** NEWLY ADDED *****/
    passport    = require("passport"),
    LocalStrategy = require('passport-local'),
    methodOverride = require('method-override'),
    Campground  = require("./models/campground"),
    Comment     = require("./models/comment"),
    seedDB      = require("./seed"),
    User        = require("./models/user");

var commentRoutes    = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes      = require("./routes/index");


mongoose.connect("mongodb://localhost/yelp_camp_v11-Quinn", { useNewUrlParser: true });
mongoose.set('useFindAndModify', false);

seedDB();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname +'/public'));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));

app.use(flash());  

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
app.use(require("express-session")({
    secret: "Rusty is the best and cutest dog in the world",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

app.use(function(req, res, next){
  res.locals.currentUser = req.user;

  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");

  next();
});

app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/", indexRoutes);

app.listen("5666", "localhost", function(err) {
   console.log("The YelpCamp Server Has Started!");
});
