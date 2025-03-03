const express = require("express");
const router = express.Router({mergeParams : true});
const wrapAsync = require("../utils/wrapAsync.js");
const {listingSchema} = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing");






const validateListing = (req,res,next)=>{
    //since we cannot validate every field of schema model, we use a tool called joi
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400, error);
    }else{
        next();
    }
    }




//instaed of app we use router, when using express router

//index route
router.get("/",  wrapAsync(async (req,res)=>{
    const allListings =  await Listing.find({});

     res.render("listings/index.ejs", {allListings});
   }));
   
   
   //new router
router.get("/new", (req, res)=>{
       res.render("listings/new.ejs");
   });
   
   //show route a specific
router.get("/:id", wrapAsync( async(req, res)=>{
   let {id} = req.params;
   const listing = await Listing.findById(id).populate("reviews");
   if(!listing){
    req.flash("error", "Lisiting you requested for, does not exist!");
    res.redirect("/listings");
   }
   res.render("listings/show.ejs",{listing});
   }));
   
   
   //create route
router.post("/" ,validateListing , wrapAsync(async (req,res,next)=>{
   // let {title, description, image, price, country, location} = req.body;  //(we can use this way to extract details from the fomr but using the next line instead)
   // if(!req.body.listing){
   //     throw new ExpressError(400,"send valid data for listing");
   // }
   
   
   let listing = req.body.listing;
   const newListing = new Listing(listing);
   await newListing.save();
   req.flash("success", "New Listing added");
   res.redirect("/listings");
   
   
   }));
   
   //edit route
router.get("/:id/edit",  wrapAsync(async (req,res)=>{
       let {id} =req.params;
       const listing = await Listing.findById(id);
       if(!listing){
        req.flash("error", "Lisiting you requested for, does not exist!");
        res.redirect("/listings");
       }
       res.render("listings/edit.ejs",{listing});
   }));
   
   //update route
router.put("/:id",validateListing, wrapAsync(async (req, res)=>{
       if(!req.body.listing){
           throw new ExpressError(400,"send valid data for listing");
       }
       let {id} = req.params;
       const see = await Listing.findByIdAndUpdate(id, {...req.body.listing},{ new: true }); //add filter, then destructered, then option to print updated data in console
       req.flash("success", "Listing updated");

       res.redirect(`/listings/${id}`);
   }));
   
   
   //delete route
router.delete("/:id" , wrapAsync( async (req,res)=>{
   let {id} = req.params;
   let deleteListing = await Listing.findByIdAndDelete(id);
   console.log(deleteListing);
   req.flash("success", "Listing Deleted");

   res.redirect("/listings");
   }));


   module.exports = router;