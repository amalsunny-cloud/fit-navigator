const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WorkoutPlanSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  exercises: [{ type: String }], // List of exercises included in the plan
  createdBy: { type: Schema.Types.ObjectId, ref: 'Trainer' },
  usersAssigned: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

module.exports = mongoose.model('WorkoutPlan', WorkoutPlanSchema);
