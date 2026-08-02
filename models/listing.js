const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        url: String,
        filename: String,
    },
    // price: Number,
    

    price: Number,

    category: {
        type: String,
        
        enum: [
            "Trending",
            "Rooms",
            "Iconic Cities",
            "Castles",
            "Amazing Pool",
            "Camping",
            "Farms",
            "Arctic",
            "Domes"
        ],
        default: "Trending"
    },

    location: String,
    country: String,

    latitude: Number,
    longitude: Number,
    
    reviews: [
    {
        type: Schema.Types.ObjectId,
        ref: "Review",
    },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    }
});

listingSchema.post("findOneAndDelete", async (listing) => {
    console.log("Middleware executed");
    console.log(listing);

    if(listing){
    await Review.deleteMany({
        _id : {$in: listing.reviews}
    });
    console.log("review deleted");
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;