if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}
// console.log(process.env.SECRET);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
// const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
// const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
// const {listingSchema} = require("./schema.js");
// const Review = require("./models/review.js");
// const {reviewSchema} = require("./schema.js");
const session = require("express-session");
const MongoStore = require('connect-mongo'); //at last
const flash = require("connect-flash");
// passport
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");

// Routers.
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// const MONGO_URL  = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;
// console.log(dbUrl);

main().then(() => {
    console.log("connected to DataBase");
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(dbUrl);
};

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


// sessions

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", () => {
    console.log("ERROR IN MONGO SESSION STORE", err);    
})

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    },
}; 

// app.get("/", (req, res) => {
//     res.send("hi, i am root");
// });


app.use(session(sessionOptions));
app.use(flash());

// passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next()
});

// app.get("/demouser", async (req, res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "dhirPatel",
//     });

//      let registeredUser = await User.register(fakeUser, "helloworld")
//      res.send(registeredUser);
// });

// listings Router.
app.use("/listings", listingRouter);

// Review Router.
app.use("/listings/:id/reviews", reviewRouter);

// User Router.
app.use("/", userRouter);

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// error handling
app.use((err, req, res, next) => {
    let {statusCode=400, message="Something Wents Wrong", name} = err
    res.render("error2.ejs", {err});
});

app.listen(8080, () => {
    console.log("server listening to port 8080.");
});