const express = require('express');
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
// const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
// multer for img
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage })


const listingController = require("../controllers/listings.js");


router.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn, upload.single('listing[image]'), validateListing, wrapAsync(listingController.createListing))
// .post( upload.single('listing[image]'), (req, res) => {
//     res.send(req.file)
// })

// New route. 
router.get("/new", isLoggedIn, listingController.listingNewForm);

router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(isLoggedIn, isOwner, upload.single('listing[image]'), validateListing, wrapAsync(listingController.updateListing))
.delete(isLoggedIn, isOwner, wrapAsync(listingController.destroy))

//Index route
// router.get("/",wrapAsync(listingController.index));

// Show route.
// router.get("/:id", wrapAsync(listingController.showListing));

// create route
// router.post("/",isLoggedIn, validateListing, wrapAsync(listingController.createListing));

//Edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editListing));

// Update route
// router.put("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(listingController.updateListing));

// Delete route
// router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.destroy));

module.exports = router;