var Campground = require("../models/campground");
var Comment = require("../models/comment");

//all the middleware goes here
var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = async function(req,res,next) {
    //check if user is logged in?
    if (req.isAuthenticated()) {
        try {
            const foundCampground = await Campground.findById(req.params.id);
            //does user own the campground?
            //console.log(foundCampground.author.id);   -> returns a mongoose object
            //console.log(req.user._id);                -> returns a string. Both cannot be compared directly

            if (foundCampground.author.id.equals(req.user._id)) {
                next();
            } else {
                //otherwise , redirect
                req.flash("error", "You don't have the permission to do that");
                res.redirect("back");
            }
        } catch (err) {
            req.flash("error", "Campground not found");
            res.redirect("back");
        }
    }
    else {
        //if not redirect somewhere
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");  //take user back to where they came from i.e previous page
    }
}

middlewareObj.checkCommentOwnership = async function(req,res,next) {
    //check if user is logged in?
    if (req.isAuthenticated()) {
        try {
            const foundComment = await Comment.findById(req.params.comment_id);
            //does user own the comment?
            //console.log(foundComment.author.id);   -> returns a mongoose object
            //console.log(req.user._id);                -> returns a string. Both cannot be compared directly

            if (foundComment.author.id.equals(req.user._id)) {
                next();
            } else {
                //otherwise , redirect
                req.flash("error", "You don't have permission to do that");
                res.redirect("back");
            }
        } catch (err) {
            res.redirect("back");
        }
    }
    else {
        //if not redirect somewhere
        res.redirect("back");  //take user back to where they came from i.e previous page
    }
}

middlewareObj.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next(); //renders the new campground  for the new comment page
    }
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
}

module.exports = middlewareObj;