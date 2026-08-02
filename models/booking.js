const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    listing: {
        type: Schema.Types.ObjectId,
        ref: "Listing",
        required: true,
    },

    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    checkIn: {
        type: Date,
        required: true,
    },
    
    checkOut: {
        type: Date,
        required: true,
    },

    totalPrice: {
        type: Number,
        required: true,
    },

    paymentStatus: {
        type: String,
        enum: ["Pending", "Paid", "Failed"],
        default: "Pending",
    },

    bookingStatus: {
        type: String,
        enum: ["Confirmed", "Cancelled"],
        default: "Confirmed",
    },

    // Razorpay Details

    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
},
{
    timestamps: true,
});

module.exports = mongoose.model(
    "Booking",
    bookingSchema
);