const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DietPlanSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  meals: [{ type: String }], // List of meals included in the diet plan
  createdBy: { type: Schema.Types.ObjectId, ref: 'Trainer' },
  usersAssigned: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

module.exports = mongoose.model('DietPlan', DietPlanSchema);
