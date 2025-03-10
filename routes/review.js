const express = require("express");
const router = express.Router({mergeParams : true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema} = require("../schema.js");
const Review = require("../models/review");
const Listing = require("../models/listing");




const validateReview = (req,res,next)=>{
    //since we cannot validate every field of schema model, we use a tool called joi
    
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
    }

//route for review form
router.post("/",validateReview, wrapAsync(async (req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    
    listing.reviews.push(newReview);
    
    await newReview.save();
    await listing.save();
    req.flash("success", "New Review added");

    res.redirect(`/listings/${listing.id}`);
    }));
    
    
    //delete review route
    router.delete("/:reviewId", wrapAsync(async(req,res)=>{
    let {id,reviewId} = req.params;
    
    await Listing.findByIdAndUpdate(id, {$pull : {reviews : reviewId}});
     await Review.findByIdAndDelete(reviewId);
     req.flash("success", "Review Deleted");

    res.redirect(`/listings/${id}`);
    }
    
    ));


    module.exports = router;