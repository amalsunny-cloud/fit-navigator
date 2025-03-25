const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdminSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  assignedTrainers: [{ type: Schema.Types.ObjectId, ref: 'Trainer' }],
  assignedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  paymentManagement: [{ type: Schema.Types.ObjectId, ref: 'Payment' }],
  subscriptionPlans: [{ type: Schema.Types.ObjectId, ref: 'SubscriptionPlan' }],
  messages: [{
    to: { type: String },
    from: { type: String },
    content: { type: String },
    timestamp: { type: Date, default: Date.now },
  }],
  profileImage: { type: String, default: null }

});

 const Admin = mongoose.model('Admin', AdminSchema);
 module.exports = Admin;