const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");
const Comment = require("../models/comment");
const Review = require("../models/review");
const User = require("../models/user");
const middleware = require("../middleware")  // will automaticlly include index.js

require('dotenv').config({ path: '/.env' });

var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname); // filename
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
const upload = multer({ storage: storage, fileFilter: imageFilter})


const cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


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

// User post a new campground
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {

    cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
        // add cloudinary url for the image to the campground object under image property
        // req.body.campground.image = result.secure_url;
        if(err) {
            req.flash('error', err.message);
            return res.redirect('back');
        }
        const name = req.body.name;
        const image = result.secure_url;
        const imageId = result.public_id;
        const desc = req.body.description;
        const author = {
            id: req.user._id, 
            username: req.user.username
        }
        const newCampground = {
            name: name,
            image: image, 
            imageId: imageId,
            description: desc,
            author: author
        }

        // add author to campground
        Campground.create(newCampground, function(err, newlyCreated){
            if (err){
                req.flash('error', err.message);
                res.redirect('back');
            } else {
                User.findById(req.user._id, function(err, foundUser){
                    if (err){
                        console.log(err);
                    } else {
                        foundUser.campground.push(newlyCreated);
                        foundUser.save();
                        req.flash("success", "Post created!");
                        res.redirect("/campground/"+ newlyCreated.id);
                    }
                });
            }
        });
      });
    


});


// new campground form
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("campgrounds/new");
});



// Show page: details of aspecific campground
router.get("/:id", function(req, res){
    Campground.findById(req.params.id).populate("comments").populate({
        path: "reviews",
        options: {sort: {createdAt: -1}}
    }).exec(function(err, foundCampground){
        if (err || !foundCampground){
            req.flash("error", "Campground not found!");
            res.redirect("/campground");
        } else {
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});




// Edit page
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    // check login status
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});

// Update route
router.put("/:id", middleware.checkCampgroundOwnership, upload.single('image'), function(req, res){
    Campground.findById(req.params.id, async function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if (req.file) {
              try { // change image          
                  await cloudinary.v2.uploader.destroy(campground.imageId);
                  const result = await cloudinary.v2.uploader.upload(req.file.path);
                  campground.imageId = result.public_id;
                  campground.image = result.secure_url;
              } catch(err) {
                  req.flash("error", err.message);
                  return res.redirect("back");
              }
            }
            delete req.body.campground.rating;
            campground.name = req.body.campground.name;
            campground.description = req.body.campground.description;
            campground.save();
            req.flash("success","Successfully Updated!");
            res.redirect("/campground/" + campground._id);
        }
    });
});


// Delete route
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    //res.send("delete");
    Campground.findById(req.params.id, function(err, campground){
        if (err){
            res.redirect("/campground");
        } else {
            // deletes all comments associated with the campground
            Comment.remove({"_id": {$in: campground.comments}}, function (err) {
                if (err) {
                    console.log(err);
                    return res.redirect("/campground");
                }
                // deletes all reviews associated with the campground
                Review.remove({"_id": {$in: campground.reviews}}, function (err) {
                    if (err) {
                        console.log(err);
                        return res.redirect("/campground");
                    }
                    User.findById(campground.author.id,  async function(err, foundUser){
                        if (err) {
                            console.log(err);
                            return res.redirect("/campground");
                        }
                        foundUser.campground.pull({_id: req.params.id});
                        foundUser.save();
                        try {
                            await cloudinary.v2.uploader.destroy(campground.imageId);
                            campground.deleteOne();
                            req.flash('success', 'Campground deleted successfully!');
                            res.redirect('/campground');
                        } catch(err) {
                            if(err) {
                              req.flash("error", err.message);
                              res.redirect("back");
                            }
                        }
                    });
                    
                });
            });
        }
    })
});




module.exports = router;