const mongoose = require("mongoose");
mongoose.set('useFindAndModify', false);

//schema
const campgroundSchema  = new mongoose.Schema({
    name: String,
    image: String,
    imageId: String,
    description: String,
    createdAt: {
       type: Date,
       default: Date.now
    },
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
     ],
   reviews: [
   {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Review"
   }
   ],
   rating: {
         type: Number,
         default: 0
   }
});

module.exports = mongoose.model("Campground", campgroundSchema); // Need to capital Campground
