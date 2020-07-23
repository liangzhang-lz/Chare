var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var Campground = require("./models/campground");
var Comment = require("./models/comment");
var User = require("./models/user");
var seedDB = require("./seeds.js");

mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb://localhost:27017/yelp_camp", {useNewUrlParser: true}); // mongoDB 
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs"); // no need to type .ejs
app.use(express.static(__dirname + "/public"))

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

// Passport config
app.use(require("express-session")({
    secret: "Furong is the best",
    resave: false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){ // add user info to the request. Use as currentUser
    res.locals.currentUser = req.user;
    next();
});





app.get("/", function(req, res){
    res.render("landing")
});


// Index, main page
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


// new campground form
app.get("/campground/new", function(req, res){
    res.render("campgrounds/new");
});

// Show details of aspecific campground
app.get("/campground/:id", function(req, res){
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if (err){
            console.log(err);
        } else {
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
    
});

// Post a new campground
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

// Comment form 
app.get("/campground/:id/comments/new", isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        if (err){
            console.log(err);
        } else{
            res.render("comments/new", {campground: campground})
        }
    });
});

// Post comment route
app.post("/campground/:id/comments", isLoggedIn, function(req, res){
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



// AUTH routes

// show the regi form

app.get("/register", function(req, res){
    res.render("register");
});

// handle sign up logic
app.post("/register", function(req, res){
    var newUser = new User({
        username: req.body.username
    });
    User.register(newUser, req.body.password, function(err, user){
        if (err){
            console.log(err);
            return res.render("register")
        } 
        passport.authenticate("local")(req, res, function(){
            res.redirect("/campground");
        });
    });
})

// login route
app.get("/login", function(req, res){
    res.render("login");
});

// handle login request
app.post("/login", passport.authenticate("local", 
{
    successRedirect: "/campground", 
    failureRedirect: "/login"

}), function(req, res){ });

// logout route
app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/campground");
})


// middleware
function isLoggedIn(req, res, next){
    if (req.isAuthenticated()){
        return next();
    }
    res.redirect("/login")
}

app.listen(3000, function(){
    console.log("YelpCamp started!")
});

