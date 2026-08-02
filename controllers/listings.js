const Listing = require("../models/listing");
const axios = require("axios");


// =====================================================
// INDEX - SHOW ALL LISTINGS
// =====================================================

module.exports.index = async (req, res) => {
    const { category, search } = req.query;

    let filter = {};

    if (category) {
        filter.category = category;
    }

    if(search) {
        filter.location = {
            $regex : search,
            $options : "i",
        };
    }

    const allListings = await Listing.find(filter);

    res.render("listings/index.ejs", {
        allListings,
        selectedCategory: category || "",
        search : search || "",
    });
};



// =====================================================
// RENDER NEW LISTING FORM
// =====================================================

module.exports.renderNewForm = (req, res) => {

    res.render("listings/new.ejs");

};



// =====================================================
// SHOW PARTICULAR LISTING
// =====================================================

module.exports.showListing = async (req, res) => {

    let { id } = req.params;


    const listing = await Listing.findById(id)

        .populate({
            path: "reviews",

            populate: {
                path: "author",
            },

        })

        .populate("owner");


    if (!listing) {

        req.flash("error", "Listing does not exist!");

        return res.redirect("/listings");

    }


    console.log(listing);


    res.render("listings/show.ejs", {
        listing
    });

};




module.exports.createListing = async (req, res, next) => {
    const newListing = new Listing(req.body.listing);

    newListing.owner = req.user._id;

    if (req.file) {
        const url = req.file.path;
        const filename = req.file.filename;

        newListing.image = {
            url,
            filename,
        };
    }

    const address = `${newListing.location}, ${newListing.country}`;

    console.log("Searching address:", address);

    const response = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
            params: {
                q: address,
                format: "json",
                limit: 1,
                addressdetails: 1,
            },

            headers: {
                // IMPORTANT: Nominatim expects an identifiable User-Agent
                "User-Agent": "WanderlustLearningProject/1.0 shivendramaury@gmail.com",
                "Accept-Language": "en",
            },
        }
    );

    console.log("FULL NOMINATIM RESPONSE:", response.data);

    // LOCATION NOT FOUND
    if (response.data.length === 0) {
        req.flash(
            "error",
            "Location not found. Please enter a more specific location."
        );

        return res.redirect("/listings/new");
    }

    // GET COORDINATES
    const latitude = Number(response.data[0].lat);
    const longitude = Number(response.data[0].lon);

    console.log("Latitude:", latitude);
    console.log("Longitude:", longitude);

    // VALIDATE COORDINATES
    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
    ) {
        req.flash(
            "error",
            "Invalid coordinates received for this location."
        );

        return res.redirect("/listings/new");
    }

    // SAVE COORDINATES
    newListing.latitude = latitude;
    newListing.longitude = longitude;

    await newListing.save();

    console.log("SAVED LISTING:", newListing);

    req.flash("success", "New Listing Created!");

    res.redirect(`/listings/${newListing._id}`);
};



// =====================================================
// RENDER EDIT FORM
// =====================================================

module.exports.renderEditForm = async (req, res) => {


    let { id } = req.params;


    const listing =
        await Listing.findById(id);



    if (!listing) {


        req.flash(

            "error",

            "Listing does not exist!"

        );


        return res.redirect("/listings");

    }



    // Existing Cloudinary transformation

    let originalImageUrl = listing.image.url;


    originalImageUrl =

        originalImageUrl.replace(

            "/upload",

            "/upload/w_250"

        );


    res.render(

        "listings/edit.ejs",

        {

            listing,

            originalImageUrl

        }

    );

};



// =====================================================
// UPDATE LISTING
// =====================================================

module.exports.updateListing = async (req, res) => {


    let { id } = req.params;



    // =================================================
    // UPDATE EXISTING LISTING DATA
    // =================================================


    let listing = await Listing.findByIdAndUpdate(

        id,

        {
            ...req.body.listing
        },

        {
            new: true
        }

    );



    // =================================================
    // UPDATE COORDINATES
    // If location/country changes
    // =================================================


    const address =

        `${listing.location}, ${listing.country}`;



    const response = await axios.get(

        "https://nominatim.openstreetmap.org/search",

        {

            params: {

                q: address,

                format: "json",

                limit: 1,

                email: "shivendramaury@gmail.com"

            },


            headers: {

                "User-Agent":
                    "WanderlustProject/1.0 shivendramaury@gmail.com",
            "Accept-Language": "en"

            }

        }

    );



    // Update coordinates only when location exists

    if (response.data.length > 0) {


        listing.latitude =

            Number(response.data[0].lat);



        listing.longitude =

            Number(response.data[0].lon);


    } else {


        console.log(

            "Location coordinates not found:",

            address

        );


    }



    // =================================================
    // IMAGE UPDATE
    // Existing Cloudinary functionality
    // =================================================


    if (typeof req.file !== "undefined") {


        let url = req.file.path;


        let filename = req.file.filename;



        listing.image = {

            url,

            filename

        };

    }



    // =================================================
    // SAVE UPDATED LISTING
    // =================================================


    await listing.save();



    req.flash(

        "success",

        "Listing Updated!"

    );


    res.redirect(

        `/listings/${id}`

    );

};



// =====================================================
// DELETE LISTING
// =====================================================

module.exports.destroyListing = async (req, res) => {


    let { id } = req.params;



    let deletedListing =

        await Listing.findByIdAndDelete(id);



    console.log(deletedListing);



    req.flash(

        "success",

        "Listing is Deleted!"

    );


    res.redirect("/listings");

};