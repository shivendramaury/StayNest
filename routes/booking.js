const express = require("express");
const router = express.Router();

const bookingController = require("../controllers/booking");

const { isLoggedIn } = require("../middleware");

router.post(
    "/listings/:id/availability",
    isLoggedIn,
    bookingController.checkAvailability
);

router.post(
    "/listings/:id/book",
    isLoggedIn,
    bookingController.createBooking
);

router.post(
    "/listings/:id/create-order",
    isLoggedIn,
    bookingController.createOrder
);

router.post(
    "/listings/:is/verify-payment",
    isLoggedIn,
    bookingController.verifyPayment
);

module.exports = router;