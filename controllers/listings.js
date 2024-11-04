const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings })
};

module.exports.listingNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" }, }).populate("owner");
    if (!listing) {
        req.flash("error", "Listing Does Not Exists!");
        res.redirect("/listings");
    };
    // console.log(listing)
    // console.log(id);
    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
    // let {title, description, image, price, location, country} = req.body;
    // let newListing2 = req.body.listing;

    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    })
        .send();

    let url = req.file.path;
    let filename = req.file.filename;
    // console.log(url, "....." ,filename);
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    
    newListing.geometry = response.body.features[0].geometry;

    let savedListing = await newListing.save();
    // console.log(savedListing.geometry.coordinates);

    req.flash("success", "New Listing Added");
    res.redirect("/listings")
    // console.log(newListing2);
};



module.exports.editListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing Does Not Exists!");
        res.redirect("/listings");
    };

    let origninalImageUrl = listing.image.url;
    let filename = listing.image.filename
    // console.log(filename);

    if (filename === "listingimage") {
        origninalImageUrl = origninalImageUrl.replace("&w=800&q=60", "&w=250&h=300&e_blur:300");
    }
    origninalImageUrl = origninalImageUrl.replace("/upload", "/upload/h_300,w_250/e_blur:300");
    console.log(listing);

    res.render("listings/edit.ejs", { listing, origninalImageUrl });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if (typeof req.file !== 'undefined') {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save()
    };

    req.flash("success", "Listing Edited");
    res.redirect(`/listings/${id}`);
};

module.exports.destroy = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    // console.log(deletedListing);
    req.flash("success", "Listing Deleted");
    res.redirect("/listings");
};
