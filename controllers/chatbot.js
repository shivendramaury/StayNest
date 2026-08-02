const ai = require("../utils/gemini");

module.exports.chat = async (req, res) => {
    try{
        const { message } = req.body;

        const prompt = `
            You are StayNest AI Assistant.

StayNest is a hotel booking website.

Only answer questions related to:

- hotel booking
- hotels
- listings
- payments
- Razorpay
- cancellation
- refund
- reviews
- ratings
- wishlist
- booking history
- user account
- host dashboard
- StayNest features

If the question is unrelated, reply exactly:

"I'm the StayNest Assistant. I can only answer questions related to StayNest, hotel bookings, listings, payments, and using this website."

User Question:
${message}
        `;

        const response = await ai.models.generateContent({
            model: "gemini-flash-latest",
            contents: prompt,
        });

        return res.json({
            success: true,
            reply: response.text
        });
    }
    catch(err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            
            reply: err.message
        });
    }
};