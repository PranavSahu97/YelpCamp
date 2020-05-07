var Campground = require("../models/campground");
var Comment = require("../models/comment");

//all the middleware goes here
var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req,res,next) {
    //check if user is logged in?
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id, function (err, foundCampground) {
            if (err) {
                req.flash("error", "Campground not found");
                res.redirect("back");
            } else {
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
            }
        }); 
    }
    else {
        //if not redirect somewhere
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");  //take user back to where they came from i.e previous page
    }
}

middlewareObj.checkCommentOwnership = function(req,res,next) {
    //check if user is logged in?
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function (err, foundComment) {
            if (err) {
                res.redirect("back");
            } else {
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
            }
        }); 
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