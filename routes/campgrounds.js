var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");

// Define escapeRegex function for search feature
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

//INDEX - show all campgrounds
router.get("/", async function (req, res) {
    var noMatch = null;
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        try {
            const allCampgrounds = await Campground.find({name: regex});
            if (allCampgrounds.length < 1) {
                noMatch = "No campgrounds matched your search, please try again.";
            }
            res.render("campgrounds/index.ejs", { campgrounds: allCampgrounds, noMatch: noMatch});
        } catch (err) {
            console.log(err);
        }
    }
    //console.log(req.user); //this field will work when a user puts in login details, so passport puts username and id in one variable once login is hit
    //Get all campgrounds from db
    else {
        try {
            const allCampgrounds = await Campground.find({});
            res.render("campgrounds/index.ejs", { campgrounds: allCampgrounds, noMatch: noMatch });
        } catch (err) {
            console.log(err);
        }
    }
});

//CREATE - add new campgrounds to DB
router.post("/", middleware.isLoggedIn, async function (req, res) {
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
    try {
        const newlyCreated = await Campground.create(newCampground);
        //console.log(newlyCreated);
        res.redirect("/campgrounds");
    } catch (err) {
        console.log(err);
    }
});


//NEW - show form to create campground
router.get("/new", middleware.isLoggedIn,function (req, res) {
    res.render("campgrounds/new.ejs");
});


//SHOW-  shows more info about one campground
router.get("/:id", async function (req, res) {
    //find the campground with provided id, then populate comments on that campground
    try {
        const foundCampground = await Campground.findById(req.params.id).populate("comments");
        //render show template with that campground
        res.render("campgrounds/show.ejs", { campground: foundCampground });
    } catch (err) {
        console.log(err);
    }
});

//EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, async function (req, res) {
        const foundCampground = await Campground.findById(req.params.id);
        res.render("campgrounds/edit.ejs", {campground: foundCampground});     //campgrounds is present in views folder
});

//UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, async function (req, res) {
    //find and update the correct campground

    try {
        const updatedCampground = await Campground.findByIdAndUpdate(req.params.id, req.body.campground);
        //redirect on the show page after update
        res.redirect("/campgrounds/" + req.params.id);
    } catch (err) {
        res.redirect("/campgrounds");
    }
});

//DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, async function (req, res) {
    try {
        await Campground.findByIdAndDelete(req.params.id);
        res.redirect("/campgrounds");
    } catch (err) {
        res.redirect("/campgrounds");
    }
});


module.exports = router;
