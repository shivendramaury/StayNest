const checkIn = document.getElementById("checkIn");
const checkOut = document.getElementById("checkOut");
const bookingStatus = document.getElementById("bookingStatus");
const bookBtn = document.getElementById("bookBtn");
const totalPrice = document.getElementById("totalPrice");
const totalNights = document.getElementById("totalNights");
const pricePerNight = Number(
    document.getElementById("pricePerNight").value
);

async function checkAvailability() {
    const checkInDate = checkIn.value;
    const checkOutDate = checkOut.value;

    if(checkInDate && checkOutDate){

        const start = new Date(checkInDate);
        const end = new Date(checkOutDate);

        const diffTime = end-start;

        const nights = diffTime/(1000*60*60*24);

        if(nights<=0){
            bookingStatus.className = "alert alert-danger";
            bookingStatus.innerText = "Check-Out must be after Check-In";

            totalNights.innerText = "0";
            totalPrice.innerText = "₹0";

            bookBtn.disabled = true;

            return;
        }

        totalNights.innerText = nights;

        totalPrice.innerText = 
            "₹" + (nights * pricePerNight).toLocaleString("en-IN");
    }

    if(!checkInDate || !checkOutDate) {
        bookingStatus.className = "alert alert-secondary",
        bookingStatus.innerText = "Select Check-In & Check-Out";
        bookBtn.disabled = true;
        return;
    }

    const listingId = window.location.pathname.split("/")[2];

    const response = await fetch(`/listings/${listingId}/availability`, {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify({
            checkIn: checkInDate,
            checkOut: checkOutDate
        })
    });

    const data = await response.json();

    if(data.available){
        bookingStatus.className = "alert alert-success";
        bookingStatus.innerText = "Available";

        bookBtn.disabled = false;
    }
    else{
        bookingStatus.className = "alert alert-danger";

        bookingStatus.innerHTML = 
            `❌ ${data.message}
            <br>
            ${new Date(data.bookedFrom).toLocaleDateString("en-IN")}
            -
            ${new Date(data.bookedTo).toLocaleDateString("en-IN")}`;

        bookBtn.disabled = true;
    }
}

checkIn.addEventListener("change", checkAvailability);
checkOut.addEventListener("change", checkAvailability);

const bookingForm = document.getElementById("bookingForm");

bookingForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const listingId = window.location.pathname.split("/")[2];

    const response = await fetch(`/listings/${listingId}/create-order`, {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            checkIn: checkIn.value,
            checkOut: checkOut.value
        })
    });

    const data = await response.json();

    openRazorpay(data);
});

function openRazorpay(data) {
    const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "StayNest",
        description: "Hotel Booking",
        order_id: data.order.id,
        handler: function (response) {
            verifyPayment(response);
        }
    };

    const rzp = new Razorpay(options);

    rzp.open();
}

async function verifyPayment(payment) {
    const listingId = window.location.pathname.split("/")[2];

    const response = await fetch(`/listings/${listingId}/verify-payment`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            checkIn: checkIn.value,
            checkOut: checkOut.value,

            razorpay_order_id: payment.razorpay_order_id,
            razorpay_payment_id: payment.razorpay_payment_id,
            razorpay_signature: payment.razorpay_signature
        })
    });

    const result = await response.json();

    if(result.success) {
        alert("Booking Confirmed!");

        window.location.href = "/bookings";
    }
    else{
        alert("Payment Verification Failed.");
    }
}