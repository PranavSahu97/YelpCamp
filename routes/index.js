var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Campground = require("../models/campground");
var async = require("async");
var nodemail = require("nodemailer");
var crypto = require("crypto");

//Root route
router.get("/", function (req, res) {
    res.render("landing.ejs");
});


//===========
//AUTH ROUTES
//===========

//show register form
router.get("/register", function (req, res) {
    res.render("register.ejs", {page: 'register'}); 
});

//handle sign up logic
router.post("/register", function (req, res) {
    var newUser = new User({ username: req.body.username });
    User.register(newUser, req.body.password, function (err, user) { 
        if (err) {
          //  req.flash("error", err.message);
            return res.render("register.ejs", {error: err.message});  //solves the bug of clicking sign up button twice to display error message
        }
        passport.authenticate("local")(req, res, function () {
            req.flash("success", "Welcome to YelpCamp " + user.username);
            res.redirect("/campgrounds");
        });
    }); 
});

//show login form
router.get("/login", function (req, res) {
    res.render("login.ejs", {page: 'login'});
});


//handling login logic
//beware made use of middleware
router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login",
        failureFlash: true,
        successFlash: 'Welcome To YelpCamp!',
        failureFlash: 'Incorrect username or password'
    }), function (req, res) { 
    
});

//logout route
router.get("/logout", function (req, res) { 
    req.logout();
    req.flash("success", "Logged You Out!");
    res.redirect("/campgrounds");
});


  

module.exports = router;
