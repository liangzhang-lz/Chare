var mongoose = require("mongoose");
//schema
var campgroundSchema  = new mongoose.Schema({
    name: String,
    image: String,
    description: String,
    comments: [
        {
           type: mongoose.Schema.Types.ObjectId,
           ref: "Comment"
        }
     ]
});

module.exports = mongoose.model("Campground", campgroundSchema); // Need to capital Campground
