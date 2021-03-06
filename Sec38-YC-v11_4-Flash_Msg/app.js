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
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname +'/public'));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));

app.use(flash());  /***** NEWLY ADDED *****/

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

  /* res.locals
  - https://expressjs.com/en/api.html#res.locals
  - It's an obj for exposing request-level info such as the request path name, authenticated user, user settings, and so on.  
  - res.locals properties are valid only for the lifetime of the request
  - When we want to make a req's info accessable in the whole app, assign it to res.locals obj.
  */

  // - Adding req.flash() to res.locals obj, so the whole app can access it
  // - Using the key "error" of req.flash to distinguish what msg val it is
  //res.locals.message = req.flash("error"); 
  //
  // Distinguish error and success msgs w/ keys "error" and "success"
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");

  next();
});

app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/", indexRoutes);

app.listen("8080", "localhost", function(err) {
   console.log("The YelpCamp Server Has Started");
});
