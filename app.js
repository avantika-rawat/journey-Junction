const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path =require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate"); //helps creating different layouts
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("./schema.js");
const Review = require("./models/review");
const session= require("express-session");
const flash= require("connect-flash");
const passport = require("passport");
const localStratergy = require("passport-local");
const User = require("./models/user.js");



const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");


const MONGO_URL = "mongodb://127.0.0.1:27017/journeyJunction";

main().then(() =>{
    console.log("conn to db");
})
.catch((err)=>{
console.log(err);
});


async function main() {
    await mongoose.connect(MONGO_URL)
}


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")));





const sessionOptions = {
    secret : "mysuperseceretcode",
    resave:false,
    saveUninitialized : true,
    cookies : {
        expires : Date.now() +7*24*60*60*1000,
        maxAge : 7*24*60*60*1000,
        httpOnly : true,
    },
};


app.get("/" , (req, res)=>{
    res.send("THIS IS AN ONGOING PROJECT, CHECK THE OTHERS OUT");
});

app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());


app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");

    next();
});







app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);

//for all routes
app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not found"));
});

//error handler
app.use((err,req,res,next)=>{
    let {statusCode=500, message="something went wrong!"} = err;
    res.status(statusCode).render("error.ejs",{message});
    // res.status(statusCode).send(message);
    // res.send("SOMETHING WENT WRONG!");
});



app.listen(8080, ()=>{
    console.log("listening at port 8080");
});
