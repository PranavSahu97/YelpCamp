var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");

// Define escapeRegex function for search feature
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

//INDEX - show all campgrounds
router.get("/", function (req, res) {
    var noMatch = null;
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Campground.find({name: regex}, function (err, allCampgrounds) {
            if (err) {
                console.log(err);
            }
            else {
                
                if (allCampgrounds.length < 1) {
                    noMatch = "No campgrounds matched your search, please try again.";
                }
                res.render("campgrounds/index.ejs", { campgrounds: allCampgrounds, noMatch: noMatch});
            }
        });
    }
    //console.log(req.user); //this field will work when a user puts in login details, so passport puts username and id in one variable once login is hit
    //Get all campgrounds from db
    else {
        Campground.find({}, function (err, allCampgrounds) {
            if (err) {
                console.log(err);
            }
            else {
                res.render("campgrounds/index.ejs", { campgrounds: allCampgrounds, noMatch: noMatch });
            }
        });
    }
});

//CREATE - add new campgrounds to DB
router.post("/", middleware.isLoggedIn,function (req, res) {
    //get data from form and add to campground array
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = { name: name, price: price, image: image, description: desc, author: author }
    //console.log(req.user);
    //campgrounds.push(newCampground);

    //create a new campground and save to database
    Campground.create(newCampground, function (err, newlyCreated) {
        if (err) {
            console.log(err);
        }
        else {
            //console.log(newlyCreated);
            res.redirect("/campgrounds");
        }
    });
});


//NEW - show form to create campground
router.get("/new", middleware.isLoggedIn,function (req, res) {
    res.render("campgrounds/new.ejs");
});


//SHOW-  shows more info about one campground
router.get("/:id", function (req, res) {
    //find the campground with provided id, then populate comments on that campground
    Campground.findById(req.params.id).populate("comments").exec(function (err, foundCampground) {
        if (err) {
            console.log(err);
        }
        else {
            //render show template with that campground
            res.render("campgrounds/show.ejs", { campground: foundCampground });
        }
    });
});

//EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership,function (req, res) { 
        Campground.findById(req.params.id, function (err, foundCampground) {
           res.render("campgrounds/edit.ejs", {campground: foundCampground});     //campgrounds is present in views folder
        }); 
});

//UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function (req, res) { 
    //find and update the correct campground

    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function (err, updatedCampground) {
        if (err) {
            res.redirect("/campgrounds");
        }
        else {
            //redirect on the show page after update
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

//DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function (req, res) { 
    Campground.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            res.redirect("/campgrounds");
        }
        else {
            res.redirect("/campgrounds");
        }
    })
});


module.exports = router;
