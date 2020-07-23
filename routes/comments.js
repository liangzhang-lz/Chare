var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment")

// Comment form 
router.get("/new", isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        if (err){
            console.log(err);
        } else{
            res.render("comments/new", {campground: campground})
        }
    });
});

// Post comment route
router.post("/comments", isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        if (err){
            console.log(err);
            redirect("/campground");
        } else {
            Comment.create(req.body.comment, function(err, comment){
                if (err){
                    console.log(err);
                } else {
                    campground.comments.push(comment);
                    campground.save();
                    res.redirect("/campground/" + campground._id);
                }
            })
        }
    });
});

// middleware
function isLoggedIn(req, res, next){
    if (req.isAuthenticated()){
        return next();
    }
    res.redirect("/login")
}


module.exports = router;