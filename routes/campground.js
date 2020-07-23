var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");


// Index, main page
router.get("/", function(req, res){
    
    // get all campground from db
    Campground.find({}, function(err, allCampgrounds){ // find result will send to allCampground
        if (err){
            console.log(err)
        } else {
            res.render("campgrounds/index", {campground: allCampgrounds}); // index is for index.ejs. campground is object variable used in index.ejs
        } // campground also need to match "campground" in ejs file
    });
});


// new campground form
router.get("/new", isLoggedIn, function(req, res){
    res.render("campgrounds/new");
});

// Show details of aspecific campground
router.get("/:id", function(req, res){
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if (err){
            console.log(err);
        } else {
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
    
});

// Post a new campground
router.post("/",  isLoggedIn, function(req, res){
    // get data from form and add to array
    // redirect to campground page
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user_id, 
        username: req.user.username
    }
    var newCampground = {
        name: name,
        image: image, 
        description: desc,
        author: author
    }
    Campground.create(newCampground, function(err, newlyCreated){
        if (err){
            console.log(err);
        } else {
            res.redirect("/campground");
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