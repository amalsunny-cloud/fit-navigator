const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubscriptionPlanSchema = new Schema({
  
  userId: {type:Schema.Types.ObjectId, ref: 'User'},
  planId: { type: Schema.Types.ObjectId, ref: 'Plan', required: true },
  payments: [{ type: Schema.Types.ObjectId, ref: 'Payment' }],
  duration: { type: String }, // e.g., "1 Month", "3 Months", etc.
  price: { type: Number, required: true },
  features: [{ type: String }], // List of features (e.g., access to workout plans, personal trainer, etc.)
  startDate: { type: Date, required: true, default: Date.now }, 
  endDate: { type: Date, required: true }, // Expiry date (auto-calculated)
  status: { type: String, enum: ['active','scheduled', 'expired'], default: 'active' },
});

const SubscriptionPlan = mongoose.model('SubscriptionPlan', SubscriptionPlanSchema);
module.exports = SubscriptionPlan;
