const Razorpay = require("razorpay");

// Configure Razorpay instance
const razorpay = new Razorpay({
  key_id: "rzp_test_zvhdwkoNVISiYI",
  key_secret: "KxzcfLyFl9O445orw49pR0vy", 
});

module.exports = razorpay;
