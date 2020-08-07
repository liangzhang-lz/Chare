const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const Campground = require("./models/campground");
const Comment = require("./models/comment");
const User = require("./models/user");
const seedDB = require("./seeds.js");
const methodOverride = require("method-override");
const flash = require("connect-flash");
require('dotenv').config();


// requring route
const campgroundRoutes = require("./routes/campground");
const commentRoutes = require("./routes/comments");
const authRoutes = require("./routes/auth");
const reviewRoutes     = require("./routes/reviews");


mongoose.set('useUnifiedTopology', true);

mongoose.connect(process.env.DATABASEURL || "mongodb://localhost:27017/yelp_camp", 
    {
        useNewUrlParser: true, 
        useCreateIndex: true
    }).then(()=> {
        console.log("Connected to DB");
    }).catch(err => {
        console.log("ERROR:", err.message);
    }); // mongoDB 
    


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs"); // no need to type .ejs
app.use(express.static(__dirname + "/public"))
app.use(methodOverride("_method"));
app.use(flash());
// seedDB(); // seed the database

app.locals.moment = require('moment');

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

app.use(function(req, res, next){ // add user info to the request in every page. Use as currentUser
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

// Index route
app.get("/", function(req, res){
    res.render("landing")
});

app.use(authRoutes);
app.use("/campground", campgroundRoutes); // this will automaticlly add "/campground" in front of route path in campgroundRoutes
app.use("/campground/:id/comments", commentRoutes); 
app.use("/campground/:id/reviews", reviewRoutes);



if ((process.env.PORT && process.env.IP)){ // production
    app.listen(process.env.PORT, process.env.IP, function(){
        console.log("YelpCamp started!")
    });
} else { // localhost
    app.listen(3000, function(){
        console.log("YelpCamp started! Listening to port:3000")
    });
}


