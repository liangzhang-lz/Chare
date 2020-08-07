const express = require("express");
const router = express.Router({mergeParams: true});
const Campground = require("../models/campground");
const Comment = require("../models/comment");
// const { route } = require("./campground");

const middleware = require("../middleware")  // will automaticlly include index.js

// Comment form 
router.get("/new", middleware.isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        if (err){
            console.log(err);
        } else{
            res.render("comments/new", {campground: campground})
        }
    });
});

// Post comment route
router.post("/", middleware.isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        if (err){
            console.log(err);
            redirect("/campground");
        } else {
            Comment.create(req.body.comment, function(err, comment){
                if (err){
                    req.flash("error", "Something went wrong!");
                    console.log(err);
                } else {
                    // add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save(); // save comment
                    
                    campground.comments.push(comment);
                    campground.save();
                    req.flash("sucess", "Comment added!")
                    res.redirect("/campground/" + campground._id);
                }
            })
        }
    });
});

// edit comment form
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if (err || !foundComment){
            res.redirect("back");
        }else {
            // check campground_id to make sure it is valid ( use could modify the campground_id in the browser)
            Campground.findById(req.params.id, function(err, foundCampground){
                if (err || !foundCampground){
                    req.flash("error", "No campground found!");
                    res.redirect("back");
                } else {
                    res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
                }
            });
            

        }
    });
});


// Update comment: PUT route for comments/edit
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if (err){
            res.redirect("back");
        } else {
            req.flash("success", "Comment updated!")
            res.redirect("/campground/" + req.params.id);
        }
    });
});

// Delete comment
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if (err){
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted!")
            res.redirect("/campground/" + req.params.id);
        }
    });
});



module.exports = router;