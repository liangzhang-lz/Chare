const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new mongoose.Schema({
    username: String,
    passport: String, 
    avatar: String,
    firstname: String,
    lastname: String, 
    campground: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Campground"
        }
    ]
});

UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", UserSchema);