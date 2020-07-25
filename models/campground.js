var mongoose = require("mongoose");
mongoose.set('useFindAndModify', false);

//schema
var campgroundSchema  = new mongoose.Schema({
    name: String,
    image: String,
    description: String,
    price: String,
    author: {
       id: {
          type: mongoose.Schema.Types.ObjectId, 
          ref: "User"
       }, 
       username: String
    }, 
    comments: [
        {
           type: mongoose.Schema.Types.ObjectId,
           ref: "Comment"
        }
     ]
});

module.exports = mongoose.model("Campground", campgroundSchema); // Need to capital Campground
