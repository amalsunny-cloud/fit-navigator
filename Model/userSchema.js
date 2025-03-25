//userSchema.js

const mongoose = require('mongoose');  // Import mongoose
const Schema = mongoose.Schema;  // Define Schema using mongoose

const UserSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  contact: { type: Number },
  subscriptionPlansId: [{ type: Schema.Types.ObjectId, ref: 'SubscriptionPlan' }],
  
  membershipDetails: {
    planType: { type: String },
    expirationDate: { type: Date },
  },
  
  subscription: {
    renewalDate: { type: Date },
    status: { type: String, enum: ['Active', 'Expired'] },
  },
  purpose: {
    type: String,
    enum: ['Muscle Building', 'Weight Loss', 'Endurance'],
    required: [true, 'Purpose is required'],
  },
  profileImage: { type: String, default: null }

});

const User = mongoose.model('User', UserSchema);  // Export the model
module.exports = User;
