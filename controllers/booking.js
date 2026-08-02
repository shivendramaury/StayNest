const Booking = require("../models/booking");
const Listing = require("../models/listing");
const razorpay = require("../utils/razorpay");
const crypto = require("crypto");

module.exports.createBooking = async (req, res) => {
    const{ id } = req.params;

    const { checkIn, checkOut } = req.body;

    const listing = await Listing.findById(id);

    if(!listing){
        req.flash("error", "Listing not found.");
        return res.redirect("/listings");
    }
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);

    if(startDate >= endDate){
        req.flash("error", "Invalid booking dates.");
        return res.redirect(`listings/${id}`);
    }

    const existingBooking = await Booking.findOne({
        listing: id,

        bookingStatus: "Confirmed",

        checkIn: {
            $lt : endDate,
        },

        checkOut: {
            $gt: startDate,
        },
    });

    if(existingBooking) {
        req.flash(
            "error",
            "This Property is already booked for the selected dates."
        );
        return res.redirect(`/listings/${id}`);
    }

    const nights = Math.ceil(
        (endDate - startDate)/(1000*60*60*24)
    );

    const totalPrice = nights * listing.price;

    const booking = new Booking ({
        listing: id,
        user: req.user._id,
        checkIn: startDate,
        checkOut: endDate,
        totalPrice,
    });

    await booking.save();

    req.flash(
        "success",
        "Booking created successfully."
    );

    res.redirect(`/listings/${id}`);
};

module.exports.checkAvailability = async(req, res) => {
    const { id } = req.params;

    const { checkIn, checkOut } = req.body;

    if(!checkIn || !checkOut) {
        return res.json({
            available: false,
            message: "Please select both dates."
        });
    }

    const Booking = require("../models/booking");
    const booking = await Booking.findOne({
        listing: id,
        bookingStatus: "Confirmed",
        checkIn: { $lt : new Date(checkOut)},
        checkOut: { $gt: new Date(checkIn)}
    });

    if(booking) {
        return res.json({
            available: false,
            message: "Booked by someone else",
            bookedFrom: booking.checkIn,
            bookedTo: booking.checkOut
        });
    }
    res.json({
        available: true
    });
};

module.exports.createOrder = async (req, res) => {
    const { id } = req.params;
    const { checkIn, checkOut } = req.body;

    const listing = await Listing.findById(id);

    const nights = 
        (new Date(checkOut) - new Date(checkIn)) /
        (1000*60*60*24);

    const totalPrice = nights * listing.price;

    const options = {
        amount : totalPrice * 100,
        currency : "INR",
        receipt : `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    res.json({
        order,
        key: process.env.RAZORPAY_KEY_ID,
        totalPrice
    });
};

module.exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            checkIn,
            checkOut,
        } = req.body;

        const { id } = req.params;

        // Signature

        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(
                razorpay_order_id + "|" + razorpay_payment_id
            )
            .digest("hex");

        if(generatedSignature != razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed."
            });
        }

        const listing = await Listing.findById(id);

        const nights = 
            (new Date(checkOut) - new Date(checkIn)) / 
            (1000 * 60 * 60 * 24);

        const totalPrice = nights * listing.price;

        const existingBooking = await Booking.findOne({
            listing: id,
            bookingStatus: "Confirmed",
            checkIn: {$lt : new Date(checkOut)},
            checkOut: {$gt : new Date(checkIn)}
        });

        if(existingBooking) {
            return res.status(409).json({
                success: false,
                message: "Booked by someone else."
            });
        }

        const booking = new Booking({
            listing: id,
            user: req.user._id,
            checkIn,
            checkOut,
            totalPrice,
            paymentStatus: "Paid",
            bookingStatus: "Confirmed",
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature
        });

        await booking.save();

        return res.json({
            success: true
        });
    }

    catch(err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};