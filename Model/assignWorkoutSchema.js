const mongoose = require('mongoose')
const Schema = mongoose.Schema;


const assignWorkoutSchema = new Schema({
    planname:{
        type:String,
    },
    instructions:{
        type:String,
        required:true
    },
    userId:{
        type:Schema.Types.ObjectId, ref:'User',
        required: true
    },
    date: { type: Date, default: Date.now }
});

const assignWorkout = mongoose.model('assignWorkout',assignWorkoutSchema)
module.exports = assignWorkout;