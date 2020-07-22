var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

var Campground = require("./models/campground");
var Comment = require("./models/comment");
var seedDB = require("./seeds.js");

mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb://localhost:27017/yelp_camp", {useNewUrlParser: true}); // mongoDB 
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs"); // no need to type .ejs

seedDB();

/* // for init only, create a few sample imgs
Campground.create({
    name: "sasdfsf", image: "https://images.unsplash.com/photo-1593451693781-d32def89a464?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"
}, function(err, campground){
    if (err){
        console.log(error);
    } else {
        console.log("Added");
        console.log(campground);
    }
    
});
*/

app.get("/", function(req, res){
    res.render("landing")
});

app.get("/campground", function(req, res){
    // get all campground from db
    Campground.find({}, function(err, allCampgrounds){ // find result will send to allCampground
        if (err){
            console.log(err)
        } else {
            res.render("campgrounds/index", {campground: allCampgrounds}); // index is for index.ejs. campground is object variable used in index.ejs
        } // campground also need to match "campground" in ejs file
    });
});

app.get("/campground/new", function(req, res){
    res.render("campgrounds/new");
});

app.get("/campground/:id", function(req, res){
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if (err){
            console.log(err);
        } else {
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
    
});

app.post("/campground", function(req, res){
    // get data from form and add to array
    // redirect to campground page
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var newCampground = {
        name: name,
        image: image, 
        description: desc
    }

    Campground.create(newCampground, function(err, newlyCreated){
        if (err){
            console.log(err);
        } else {
            res.redirect("/campground");
        }
    });

});

app.get("/campground/:id/comments/new", function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        if (err){
            console.log(err);
        } else{
            res.render("comments/new", {campground: campground})
        }
    });
});

app.post("/campground/:id/comments", function(req, res){
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


app.listen(3000, function(){
    console.log("YelpCamp started!")
});

