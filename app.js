var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    flash = require("connect-flash"),
    methodOverride = require("method-override"),
    Campground = require("./models/campground"),
    Comment = require("./models/comment"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    User = require("./models/user")
    seedDB = require("./seeds");
    
var commentRoutes = require("./routes/comments");
var campgroundRoutes = require("./routes/campgrounds");
var indexRoutes = require("./routes/index");

mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);
//mongoose.connect("mongodb://localhost:27017/yelp_camp_v3", { useNewUrlParser: true });
//mongoose.connect("mongodb+srv://psahu1:%25Miasma123%2F@cluster0-mnz10.mongodb.net/test?retryWrites=true&w=majority", { useNewUrlParser: true});
var url = process.env.DATABASEURL || "mongodb://localhost:27017/yelp_camp_v3";
mongoose.connect(url,{ useNewUrlParser: true });

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
//console.log(__dirname);
app.use(methodOverride("_method"));
app.use(flash());
//seedDB(); //seed the db

app.locals.moment = require('moment');

//Passport configuration
app.use(require("express-session")({
    secret: "Once again I repeat Voldemort is bad",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use(indexRoutes);
app.use("/campgrounds/:id/comments",commentRoutes);
app.use("/campgrounds",campgroundRoutes);

var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log("Listening on Port 3000");
});