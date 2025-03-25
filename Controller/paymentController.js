const Payment = require('../Model/paymentSchema');
const Plan = require('../Model/planSchema');
const User = require('../Model/userSchema');
const Razorpay = require('razorpay');
const mongoose = require('mongoose');
const SubscriptionPlan = require('../Model/subscriptionPlanSchema');

const ObjectId = mongoose.Types.ObjectId;



const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Create Razorpay Order
exports.createOrder = async (req, res) => {
  try {
    console.log("Inside createOrder function");
    
    let { amount, currency, planId, userId } = req.body;
    currency = currency || "INR";

    console.log("amount, currency, planId, userId",amount, currency, planId, userId);


    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    if (!planId || !userId) {
      return res.status(400).json({ 
        success: false, 
        message: "Plan ID and User ID are required" 
      });
    }

    console.log("before userExists");

    const userExists = await User.findById(userId);
    console.log("before planExists");

    const planExists = await Plan.findById(planId);
    if (!userExists || !planExists) {
      return res.status(404).json({ success: false, message: "Invalid User or Plan ID" });
}

     
// Create a pending payment record

console.log("before new payment");

    const payment = new Payment({
      userId: new mongoose.Types.ObjectId(userId),
      planId: new mongoose.Types.ObjectId(planId),
      amount: amount,
      status: 'pending'
    });
    await payment.save();
    console.log("saved new payment");



    const shortPaymentId = payment._id.toString().slice(-4);
    const timestamp = Date.now().toString().slice(-6);
    const receipt = `rcpt_${timestamp}${shortPaymentId}`;

    const options = {
      amount: amount * 100, // Convert to paise
      currency: currency || "INR",
      receipt: receipt, // Use payment ID as receipt
      notes: {
        paymentId: payment._id.toString(),
        planId: planId,
        userId: userId
      }
    };

    console.log("order......");

    const order = await razorpay.orders.create(options);
    
    res.status(201).json({ 
      success: true, 
      order,
      paymentId: payment._id 
    });

  } catch (error) {
    console.error("Razorpay Order Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error creating Razorpay order" 
    });
  }
};



// Verify Payment
exports.verifyPayment = async (req, res) => {
  try {
    console.log("Inside the backend verifyPayment controller");
    
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature,notes,planDetails } = req.body;

    console.log("razorpay_order_id, razorpay_payment_id, razorpay_signature",razorpay_order_id, razorpay_payment_id, razorpay_signature,notes);
    
    
    console.log("plan details...",planDetails);
    console.log("Before the crypto require...");
    
     // Verify signature
     const crypto = require("crypto");
     const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
     hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
     const generatedSignature = hmac.digest("hex");
 


     if (generatedSignature !== razorpay_signature) {
       return res.status(400).json({ 
         success: false, 
         message: "Payment verification failed" 
       });
     }
 
     console.log("Before the razorpay order");
     
     // Get order details to retrieve payment ID from notes
     const order = await razorpay.orders.fetch(razorpay_order_id);
     const paymentId = order.notes.paymentId;
     const userId = notes.userId;
     
     console.log("Before the active payment .. ..");
     
 // Find all active and scheduled plans for the user, sorted by expiration date
 const activePayments = await Payment.find({
  userId: userId,
  status: 'paid',
  'planDetails.expirationDate': { $gt: new Date() } // Only get non-expired plans
}).sort({ 'planDetails.expirationDate': -1 });

console.log("activePayments:",activePayments);


let newStartDate = new Date();

if (activePayments.length > 0) {
  // Get the latest expiring plan
  const latestPlan = activePayments[0];
  console.log("Latest active plan expires:", latestPlan.planDetails.expirationDate);
  
  // Set start date to the day AFTER the current plan expires
  newStartDate = new Date(latestPlan.planDetails.expirationDate);
  newStartDate.setDate(newStartDate.getDate() + 1);
}

// Calculate new plan expiration date
const newExpirationDate = new Date(newStartDate);
console.log("newExpirationDate:",newExpirationDate);

const daysInMonth = 30; // Using 30 days as average month length
const totalDays = planDetails.duration * daysInMonth;
console.log("totalDays:",totalDays);

newExpirationDate.setDate(newStartDate.getDate() + totalDays);

console.log("New plan schedule:", {
  startDate: newStartDate,
  expirationDate: newExpirationDate
});

// Update payment record
const payment = await Payment.findById(paymentId);
if (!payment) {
  return res.status(404).json({ 
    success: false, 
    message: "Payment record not found" 
  });
}

payment.status = 'paid';
payment.transactionId = razorpay_payment_id;
payment.paymentDate = new Date();
payment.planDetails = {
  name: planDetails.name,
  duration: planDetails.duration,
  price: planDetails.price,
  startDate: newStartDate,
  expirationDate: newExpirationDate
};
await payment.save();
console.log("payment saved 168 th line.");



// Create new subscription plan
const subscriptionPlan = new SubscriptionPlan({
  userId: new mongoose.Types.ObjectId(userId),
  planId: payment.planId,
  payments: [payment._id],
  duration: `${planDetails.duration} Months`,
  price: planDetails.price,
  startDate: newStartDate,
  endDate: newExpirationDate,
  status: newStartDate > new Date() ? 'scheduled' : 'active'
});



await subscriptionPlan.save();
console.log("subscription plan saved line 198");



res.status(200).json({ 
  success: true, 
  message: activePayments.length > 0 ? 
  "Payment successful. New plan scheduled after current plan expiration." : 
  "Payment successful. Plan activated.",
  payment: {
    id: payment._id,
    amount: payment.amount,
    transactionId: payment.transactionId,
    paymentDate: payment.paymentDate,
    userId: payment.userId,
    planId: payment.planId,
    startDate: newStartDate,
    expirationDate: newExpirationDate
  },
  subscription: subscriptionPlan
});

} catch (error) {
console.error("Error verifying payment:", error);
res.status(500).json({ 
  success: false, 
  message: "Error verifying payment" 
});
}
};



 // New controller to get payment history
exports.getPaymentHistory = async (req, res) => {
  try {
    console.log("Inside the controller of payment history:");

    const payments = await Payment.find()
      .populate('userId', 'username email') 
      .populate('planId', 'name duration price')
      .sort({ paymentDate: -1 });

      console.log("Payments after populate:",payments);
      

    const formattedPayments = payments.map(payment => ({
      id: payment._id,
      userId: payment.userId._id,
      userName: payment.userId.username,
      plan: payment.planId.name,
      amount: payment.amount,
      date: payment.paymentDate.toISOString().split('T')[0],
      status: payment.status,
      transactionId: payment.transactionId
    }));

    res.status(200).json({
      success: true,
      data: formattedPayments
    });

  } catch (error) {
    console.error("Error fetching payment history:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payment history"
    });
  }
};

