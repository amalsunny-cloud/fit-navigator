const mongoose = require('mongoose')


const assignDietPlanSchema = new mongoose.Schema({
    planname:{
        type:String,
        required:true
    },
    instructions:{
        type:String,
        required:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId, ref:'User',
        required:true
    }
})

const assignDietPlan = mongoose.model('assignDietPlan',assignDietPlanSchema)

module.exports = assignDietPlan