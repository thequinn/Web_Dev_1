var mongoose = require("mongoose");
var Comment = require("../models/comment");

// SCHEMA SETUP
var campgroundSchema = new mongoose.Schema({
   name: String,
   image: String,
   description: String,
   comments: [
     {  type: mongoose.Schema.Types.ObjectId, 
        ref: 'Comment' 
     }
    ]
});

// CONVERT SCHEMA TO MODEL
module.exports = mongoose.model("Campground", campgroundSchema);

 