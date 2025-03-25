const Payment = require("../Model/paymentSchema");
const Plan = require("../Model/planSchema");



// Get all plans
exports.getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ status: 'active' }).sort('duration');
    res.status(200).json({
      status: 'success',
      data: plans
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Create new plan
exports.createPlan = async (req, res) => {
  try {
    const { name, duration, price } = req.body;

    // Validate input
    if (!name || !duration || !price) {
        return res.status(400).json({
          status: 'error',
          message: 'All fields (name, duration, price) are required'
        });
      }


      if (typeof duration !== 'number' || duration <= 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Duration must be a positive number'
        });
      }
  
      if (typeof price !== 'number' || price <= 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Price must be a positive number'
        });
      }

    // Check if plan with same name exists
    const existingPlan = await Plan.findOne({ name });
    if (existingPlan) {
      return res.status(400).json({
        status: 'error',
        message: 'A plan with this name already exists'
      });
    }

    const plan = await Plan.create({
      name,
      duration,
      price
    });

    console.log(`New plan created: ${plan.name}, Duration: ${plan.duration}, Price: ${plan.price}`);

    res.status(201).json({
      status: 'success',
      data: { plan }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        status: 'error',
        message: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update plan
exports.updatePlan = async (req, res) => {
  try {
    const { name, duration, price } = req.body;
    const planId = req.params.id;

    // Check if plan exists
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        status: 'error',
        message: 'Plan not found'
      });
    }

    // Check if new name conflicts with existing plan
    if (name !== plan.name) {
      const existingPlan = await Plan.findOne({ name });
      if (existingPlan) {
        return res.status(400).json({
          status: 'error',
          message: 'A plan with this name already exists'
        });
      }
    }

    const updatedPlan = await Plan.findByIdAndUpdate(
      planId,
      { name, duration, price },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: updatedPlan
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        status: 'error',
        message: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Delete plan
exports.deletePlan = async(req, res) => {
  try {
    const deletedPlan = await Plan.findOneAndDelete({ _id: req.params.id });
        if (!deletedPlan) {
        return res.status(404).json({
            status: 'error',
            message: 'Plan not found'
        });
    }

    // Check if there are active payments for this plan
    const activePayments = await Payment.find({ 
      planId: req.params.id,
      status: { $in: ['pending', 'paid'] }
    });

    if (activePayments.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete plan with active payments'
      });
    }

    await Plan.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Plan deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};