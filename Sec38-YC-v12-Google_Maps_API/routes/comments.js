var express     = require("express");
var router  = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");

var middleware = require("../middleware");

// NEW route - show form to create new comment
router.get("/new", middleware.isLoggedIn, function(req, res) {
  Campground.findById(req.params.id, function(err, campground){
    if(err){
      console.log(err);
    } else {
      res.render("comments/new", {campground: campground});
    }
  })
});

// CREATE route - add new comment to DB
router.post("/", middleware.isLoggedIn, function(req, res) {
  Campground.findById(req.params.id, function(err, foundCampground) {
    if (err) {
      console.log(err);
    }
    else {
    Comment.create(req.body.comment, function(err, newComment) {
      if (err) {
        req.flash("error", "Something went wrong");
        console.log(err);
        res.redirect("/campgrounds");
      }
      else {
        newComment.author.id = req.user.id;
        newComment.author.username = req.user.username;
        newComment.save();

        foundCampground.comments.push(newComment);
        foundCampground.save();

        /***** NEWLY ADDED *****/
        req.flash("success", "Successfully added comment");
        res.redirect('/campgrounds/' + foundCampground._id);
      }
      });
    }
  });
});

// EDIT route - show edit form for one comment
//router.get("/campgrounds/:id/comments/:comment_id/edit", function() {
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res) {

  // 流程:
  // -s1. The middleware.checkCommentOwnership last ln checks if the user who wants to edit the comment is the owner.  If yes, it will go to the edit comment route here.
  // -s2. Now we are on the edit comment page, look at the browser addr bar.  A hacker can change to a problemic campground id (shorter than the valid length or valid length w/ non-existing id) if we don't check it in DB.  
  // - s3. If the campground id exists in DB, check the comment id in DB.
  Campground.findById(req.params.id, function(err, foundCampground) {
    if (err || !foundCampground) {
      req.flash("error", "No campground found!");
      return res.redirect("back");
    }
    Comment.findById(req.params.comment_id, function(err, foundComment) {
      if (err) {
        res.redirect("back");
      }
      res.render("comments/edit", {campgroundId: req.params.id, comment: foundComment});
    });
  });
});

// UPDATE route - Update a particular comment, then redirect somewhere
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
  var update = req.body.comment;
  Comment.findByIdAndUpdate(req.params.comment_id, update, function(err, foundComment){
    if (err) {
      res.redirect("back");
    } else {
      res.redirect("/campgrounds/" + req.params.id);
    }
  });

});

// DESTROY route - Delete a particular comment
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
  Comment.findByIdAndRemove(req.params.comment_id, function(err, foundComment) {
    if (err) {
      res.redirect("back");
    } else {
      /***** NEWLY ADDED *****/
      req.flash("success", "Comment deleted successfully"); 
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
});

module.exports = router;
