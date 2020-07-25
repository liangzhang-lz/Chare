var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
// const { route } = require("./comments");
// const campground = require("../models/campground");

var middleware = require("../middleware")  // will automaticlly include index.js



// Index, main page
router.get("/", function(req, res){
    
    // get all campground from db
    Campground.find({}, function(err, allCampgrounds){ // find result will send to allCampground
        if (err){
            console.log(err)
        } else {
            res.render("campgrounds/index", {campground: allCampgrounds, page: 'campgrounds'}); // index is for index.ejs. campground is object variable used in index.ejs
        } // campground also need to match "campground" in ejs file
    });
});


// new campground form
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("campgrounds/new");
});

// Show details of aspecific campground
router.get("/:id", function(req, res){
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if (err || !foundCampground){
            req.flash("error", "Campground not found!");
            res.redirect("/campground");
        } else {
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});


// Post a new campground
router.post("/",  middleware.isLoggedIn, function(req, res){
    // get data from form and add to array
    // redirect to campground page
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id, 
        username: req.user.username
    }
    var newCampground = {
        name: name,
        price: price,
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

// Edit form
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    // check login status
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});

// Update route
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
        Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
            if (err){
                res.redirect("/campground");
            } else {
                res.redirect("/campground/" + req.params.id);
            }
        });
});


// Delete route
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    //res.send("delete");
    Campground.findByIdAndRemove(req.params.id, function(err){
        if (err){
            res.redirect("/campground");
        } else {
            res.redirect("/campground");
        }
    })
});




module.exports = router;