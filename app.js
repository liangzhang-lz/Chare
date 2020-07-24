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
var methodOverride = require("method-override");


// requring route
var campgroundRoutes = require("./routes/campground");
var commentRoutes = require("./routes/comments");
var authRoutes = require("./routes/auth")

mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb://localhost:27017/yelp_camp", {useNewUrlParser: true}); // mongoDB 
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs"); // no need to type .ejs
app.use(express.static(__dirname + "/public"))
app.use(methodOverride("_method"));

// seedDB(); // seed the database

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

// Index route
app.get("/", function(req, res){
    res.render("landing")
});

app.use(authRoutes);
app.use("/campground", campgroundRoutes); // this will automaticlly add "/campground" in front of route path in campgroundRoutes
app.use("/campground/:id/comments", commentRoutes); 

app.listen(3000, function(){
    console.log("YelpCamp started!")
});

