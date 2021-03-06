var express = require("express");
var router = express.Router({mergeParams: true}); //solves the undefinded problem
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//===============
//COMMENTS ROUTES
//==============

//Comments new
router.get("/new", middleware.isLoggedIn, function (req, res) {
    //find campground by id
    Campground.findById(req.params.id, function (err, campground) { 
        if (err) {
            console.log(err);
        }
        else {
            res.render("comments/new.ejs", {campground: campground});   
        }
    });     
});


//Comments Create
router.post("/", middleware.isLoggedIn, function (req, res) { 
    //lookup campground using id
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            console.log(err);
            res.redirect("/campgrounds");
        }
        else {
            Comment.create(req.body.comment, function (err, comment) { 
                if (err) {
                    req.flash("Something went wrong");
                    console.log(err);
                }
                else {
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
                }
            });   
        }
    });
    //create new comments

    //connect new comments to campground

    //redirect campground show page
});

//COMMENT EDIT
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function (req, res) { 
    Comment.findById(req.params.comment_id, function (err, foundCommment) { 
        if (err) {
            res.redirect("back");
        }
        else {
            res.render("comments/edit.ejs", { campground_id: req.params.id, comment: foundCommment });
        }
    });
});

//COMMENT UPDATE
router.put("/:comment_id", middleware.checkCommentOwnership, function (req, res) { 
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, updatedComment) { 
        if (err) {
            res.redirect("back");
        }
        else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

//COMMENT DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function (req, res) { 
    //find by id and remove
    Comment.findByIdAndRemove(req.params.comment_id, function (err) { 
        if (err) {
            res.redirect("back");
        }
        else {
            //redirect to show page
            req.flash("success", "Comments deleted");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});


module.exports = router;