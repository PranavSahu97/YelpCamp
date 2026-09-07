var express = require("express");
var router = express.Router({mergeParams: true}); //solves the undefinded problem
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//===============
//COMMENTS ROUTES
//==============

//Comments new
router.get("/new", middleware.isLoggedIn, async function (req, res) {
    //find campground by id
    try {
        const campground = await Campground.findById(req.params.id);
        res.render("comments/new.ejs", {campground: campground});
    } catch (err) {
        console.log(err);
    }
});


//Comments Create
router.post("/", middleware.isLoggedIn, async function (req, res) {
    //lookup campground using id
    try {
        const campground = await Campground.findById(req.params.id);
        try {
            const comment = await Comment.create(req.body.comment);
            //add username and id to comment
            //console.log(req.user.username);
            comment.author.id = req.user._id;
            comment.author.username = req.user.username;
            //save comment
            comment.save();
            campground.comments.push(comment);
            campground.save();
            req.flash("success", "Successfully added comment")
            res.redirect("/campgrounds/" + campground._id);
        } catch (err) {
            req.flash("Something went wrong");
            console.log(err);
        }
    } catch (err) {
        console.log(err);
        res.redirect("/campgrounds");
    }
    //create new comments

    //connect new comments to campground

    //redirect campground show page
});

//COMMENT EDIT
router.get("/:comment_id/edit", middleware.checkCommentOwnership, async function (req, res) {
    try {
        const foundCommment = await Comment.findById(req.params.comment_id);
        res.render("comments/edit.ejs", { campground_id: req.params.id, comment: foundCommment });
    } catch (err) {
        res.redirect("back");
    }
});

//COMMENT UPDATE
router.put("/:comment_id", middleware.checkCommentOwnership, async function (req, res) {
    try {
        const updatedComment = await Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment);
        res.redirect("/campgrounds/" + req.params.id);
    } catch (err) {
        res.redirect("back");
    }
});

//COMMENT DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, async function (req, res) {
    //find by id and remove
    try {
        await Comment.findByIdAndDelete(req.params.comment_id);
        //redirect to show page
        req.flash("success", "Comments deleted");
        res.redirect("/campgrounds/" + req.params.id);
    } catch (err) {
        res.redirect("back");
    }
});


module.exports = router;