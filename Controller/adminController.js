const Admin = require('../Model/adminSchema');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../Model/userSchema');
const Trainer = require('../Model/trainerSchema');
const Assignment = require('../Model/assignmentSchema');
const mongoose = require('mongoose');
const SubscriptionPlan = require('../Model/subscriptionPlanSchema');
const Attendance = require('../Model/attendanceSchema');
const PaymentReminder = require('../Model/paymentReminderSchema');
const Payment = require('../Model/paymentSchema');



// Create a new Admin
exports.createAdmin = async(req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log(username,email,password);

    if(!username || !email || !password){
      return res.status(400).json({message:'Please fill all fields.'})
    }
    
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin with this email already exists.' });
    }


    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new Admin({ 
        username,
        email,
        password:hashedPassword
       });

    await admin.save();
    
    res.status(201).json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.adminlogin = async(req,res)=>{
    console.log("Inside the AdminLogin function");

    try{
        const {email,password} = req.body
        console.log(email);
        console.log(password);
        // console.log(username);

        if (!email || !password) {
          return res.status(400).json('Email and password are required');
        }
        
        const existingAdmin = await Admin.findOne({email})
       


        if (!existingAdmin) {
          return res.status(404).json('Admin not found');
        }
    
        // Compare passwords
        const isMatch = await bcrypt.compare(password, existingAdmin.password);

        console.log("isMatch in 78:",isMatch);
        
        if (!isMatch) {
          return res.status(401).json('Invalid credentials');
        }
    
        // Generate JWT token
        const token = jwt.sign(
          { adminId: existingAdmin._id },
          process.env.JWT_SECRET,
        );

        console.log("token in 90:",token);
        
    
        res.status(200).json({
          message: 'Login successful',
          token,
          admin: {
            id: existingAdmin._id,
            username: existingAdmin.username,
            email: existingAdmin.email
          }
        });

        
    }catch(error){
        console.error("Login error:", error);
        res.status(401).json(error)
}
}

exports.userregister = async(req,res)=>{
  console.log("inside register function");
  const {username,email,password,purpose} = req.body
  console.log(username,email,password,purpose);
  
  if(!username || !email || !password  || !purpose){
      return res.status(400).json({error:"All fields are required."});
  }
  try {
    // Check if the user already exists
    console.log("Inside register function user:");

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists." });
    }

    console.log("Password received:", password);

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      // contact,
      password:hashedPassword,
      purpose,
    });

    console.log("Saving new user:", newUser);

    // Save the user
    await newUser.save();
    console.log("Saved after await");


    return res.status(201).json({ message: "User registered successfully....." });
  } catch (error) {
    console.error("Error during user registration:", error);
    return res.status(500).json({ error: "Server error. Please try again later." });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params; // Get user ID from params
  const { username, email, purpose } = req.body;

  if (!username || !email  || !purpose) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    user.username = username;
    user.email = email;
    // user.contact = contact;
    user.purpose = purpose;

    await user.save();
    res.status(200).json({ message: "User updated successfully." });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

exports.fetchAdminData = async(req,res)=>{
  const adminId = req.params.id;
  console.log("params:",req.params);
  console.log("adminId:",adminId);


   // Validate the ObjectId format
   if (!mongoose.Types.ObjectId.isValid(adminId)) {
    return res.status(400).json({ message: "Invalid admin ID format" });
  }
  
  try{
    console.log("Inside the fetchAdminData backend");
    const objectId = new mongoose.Types.ObjectId(adminId);
    console.log("objectId fetchAdminData backend:",objectId);

    const fetchedAdmin = await Admin.findById({_id:objectId});

    if (!fetchedAdmin) {
      return res.status(404).json({ message: "admin not found" });
    }

    console.log("Fetched admin:", fetchedAdmin);    
    res.status(200).json(fetchedAdmin)
  }
  catch(error){
    console.error("Error at backend fetchedAdminData");
    res.status(500).json(error)

  }
}


exports.getAdminProfile = async (req, res) => {
  try {
      const adminId = req.params.id || req.body.adminId;


    // Find the admin by ID
    const admin = await Admin.findById(adminId);
    console.log("admin at backenddd:",admin);

    if (!admin) {
      return res.status(404).json({ message: "admin not found" });
    }

    // Return the admin's details
    res.status(200).json({
      username: admin.username,
      profileImage: admin.profileImage, // Send the current profile image URL
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch admin profile", error: error.message });
  }
};


// Update admin profile image
exports.updateAdminProfileImage = async (req, res) => {
  try {
    const { id: adminId } = req.params;

    // Check if file is provided
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const imageUrl = `/uploads/${req.file.filename}`; // Path to the uploaded file

    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      { profileImage: imageUrl },
      { new: true, runValidators: true }
    );

    if (!updatedAdmin) {
      return res.status(404).json({ message: "admin not found" });
    }

    res.status(200).json({
      message: "Profile image updated successfully",
      profileImage: updatedAdmin.profileImage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to update profile image",
      error: error.message,
    });
  }
};

exports.getUsers = async(req,res)=>{
  try{
    const users = await User.find();
    res.status(200).json(users);
  }catch(error){
    console.error("Error fetching users:",error);
    res.status(500).json({error:"Server error while fetching users."})
  }
};

exports.getAllUsersAttendance = async(req,res)=>{
  try{
    console.log("inside the getAllUsersAttendance function");
    const usersAttendance = await Attendance.find({userId: {$exists: true}}).populate('userId','username').populate('trainerId', 'username');

    console.log("After the usersAttendance",usersAttendance);

    res.status(200).json(usersAttendance);
  }catch(error){
    console.error("Error fetching users:",error);
    res.status(500).json({error:"Server error while fetching users."})
  }
};


exports.trainerregister = async(req,res)=>{
  console.log("Inside trainer register function");
    const { username, email, password, specialization } = req.body;
    
    // Validate input
    if (!username || !email || !password  || !specialization) {
        return res.status(400).json({ error: "All fields are required." });
    }

    try {
        // Check if trainer already exists
        const existingTrainer = await Trainer.findOne({ email });
        if (existingTrainer) {
            return res.status(400).json({ error: "Trainer with this email already exists." });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new trainer
        const newTrainer = new Trainer({
            username,
            email,
            password:hashedPassword,
            specialization
        });

        // Save trainer
        const savedTrainer = await newTrainer.save();

        // Return success response
        res.status(201).json({
            message: "Trainer registered successfully",
            trainer: {
                _id: savedTrainer._id,
                username: savedTrainer.username,
                email: savedTrainer.email,
                // phone: savedTrainer.phone,
                specialization: savedTrainer.specialization
            }
        });

    } catch (error) {
        console.error("Error during trainer registration:", error);
        res.status(500).json({ error: "Server error. Please try again later." });
    }
};
// Get all trainers
exports.getTrainers = async (req, res) => {
    try {
        const trainers = await Trainer.find({}, '-password'); // Exclude password field
        res.status(200).json(trainers);
    } catch (error) {
        console.error("Error fetching trainers:", error);
        res.status(500).json({ error: "Server error while fetching trainers." });
    }
};

// Update trainer
exports.updateTrainer = async (req, res) => {
  console.log("In updateTrainer backend function...");
  
    const { id } = req.params;
    const { username, email, specialization } = req.body;
    console.log("username, email, specialization...",username, email, specialization);


    if (!username || !email || !specialization) {
        return res.status(400).json({ error: "All fields are required." });
    }

    try {
      console.log("Received ID:", id);
        const trainer = await Trainer.findById(id);
        console.log("Trainer found:", trainer);

        if (!trainer) {
            return res.status(404).json({ error: "Trainer not found." });
        }

        trainer.username = username;
        trainer.email = email;
        trainer.specialization = specialization;

        await trainer.save();
        console.log("Trainer saved successfully:", trainer);

        res.status(200).json({ message: "Trainer updated successfully." });
    } catch (error) {
        console.error("Error updating trainer:", error);
        res.status(500).json({ error: "Server error. Please try again later." });
    }
};

// Delete trainer
exports.deleteTrainer = async (req, res) => {
    const { id } = req.params;
    
    try {
        const trainer = await Trainer.findByIdAndDelete(id);
        if (!trainer) {
            return res.status(404).json({ error: "Trainer not found." });
        }
        res.status(200).json({ message: "Trainer deleted successfully." });
    } catch (error) {
        console.error("Error deleting trainer:", error);
        res.status(500).json({ error: "Server error. Please try again later." });
    }
};

// Get all assignments
exports.getAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate('user', 'username email')
      .populate('trainer', 'username specialization');
    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createAssignment = async (req, res) => {
  try {
    const { userId, trainerId } = req.body;

    if (!userId || !trainerId) {
      return res.status(400).json({ message: "Both userId and trainerId are required" });
    }

    // Check if assignment already exists for this user
    const existingAssignment = await Assignment.findOne({ user: userId });
    if (existingAssignment) {
      return res.status(400).json({ message: "User already has a trainer assigned" });
    }

    // Verify user and trainer exist
    const [user, trainer] = await Promise.all([
      User.findById(userId),
      Trainer.findById(trainerId)
    ]);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    const assignment = new Assignment({
      user: userId,
      trainer: trainerId
    });

    await assignment.save();

    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('user', 'username email')
      .populate('trainer', 'username specialization');

    res.status(201).json(populatedAssignment);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.updateAssignment = async (req, res) => {
  try {
    const { trainerId } = req.body;
    const assignmentId = req.params.id;

    if (!trainerId) {
      return res.status(400).json({ message: "trainerId is required" });
    }

    const [assignment, trainer] = await Promise.all([
      Assignment.findById(assignmentId),
      Trainer.findById(trainerId)
    ]);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    assignment.trainer = trainerId;
    await assignment.save();

    const updatedAssignment = await Assignment.findById(assignmentId)
      .populate('user', 'username email')
      .populate('trainer', 'username specialization');

    res.status(200).json(updatedAssignment);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }
    
    await Assignment.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Assignment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAssignmentByUser = async (req, res) => {
  try {
    const assignment = await Assignment.findOne({ user: req.params.userId })
      .populate('user', 'username email')
      .populate('trainer', 'username specialization');
    
    if (!assignment) {
      return res.status(404).json({ message: "No assignment found for this user" });
    }
    res.status(200).json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.fetchUsers = async(req,res)=>{
  try{
    console.log("Inside the backend of the fechUsers function");
    const fetchedUsers = await Assignment.find().populate('user','username').populate('trainer', 'username');
    console.log("After response in backend:",fetchedUsers);
    res.status(200).json(fetchedUsers)
  }
  catch(error){
    console.error("Error at making fetchUsers backend");
    res.status(500).json(error)

  }
}

exports.fetchAllUsers = async(req,res)=>{
  try{
    console.log("Inside the backend of the fetchAllUsers function");
    const fetchedAllUsers = await User.find()
    console.log("After response in backend:",fetchedAllUsers);
    res.status(200).json(fetchedAllUsers)
  }
  catch(error){
    console.error("Error at making fetchedAllUsers backend");
    res.status(500).json(error)

  }
}

exports.getTotalRevenue = async(req,res)=>{
  try{
    console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^");
    console.log("Inside the backend getTotalRevenue");
    const payments = await Payment.find()
    const totalAmount = payments.reduce((sum,payment)=>sum + payment.amount,0)
    console.log("Total Amount:::", totalAmount);
    res.status(200).json(totalAmount)
    
  }catch(error){
    console.error("Error at the backend getTotalRevenue");
    res.status(500).json(error)

  }
}

exports.revenueForChart = async(req,res)=>{
  try{
    console.log("Inside the revenueForChart function");
    const response = await Payment.find()
    console.log("response for revenueForChart:",response.data);
    res.status(200).json(response);
    
  }catch(error){
    console.error("Error at the backend revenueForChart",error);
    res.status(500).json(error)
  }
}

exports.fetchAllTrainers = async(req,res)=>{
  try{
    console.log("Inside the backend of the fetchAllUsers function");
    const fetchedAllUsers = await Trainer.find()
    console.log("After response in backend:",fetchedAllUsers);
    res.status(200).json(fetchedAllUsers)
  }
  catch(error){
    console.error("Error at making fetchedAllUsers backend");
    res.status(500).json(error)

  }
}

exports.fetchFullDetails = async(req,res)=>{
  try{
    console.log("inside the backend of fetchFullDetails");
    const users = await SubscriptionPlan.find({}, { _id: 1, userId: 1, planId: 1,endDate:1 }).populate('userId', 'username').populate('planId', 'name');
   

    console.log("response backend full details:",users );
    res.status(200).json(users )

  }
  catch(error){
    console.error("Error at backend fetchFullDetails");
    res.status(500).json(error)

  }
}

exports.sendPaymentReminder = async(req,res)=>{
  try{
    console.log("-------------------------------------");
    console.log("Inside backend sendPaymentReminder function");
    const userId = req.params.id;
    console.log("userId is::",userId);
 

    const PaymentReminders = new PaymentReminder({
      userId:userId,
      message:"Your plan has expired.Please Purchase plan",
      date:Date.now()
    })
    await PaymentReminders.save();
    console.log('Payment reminders saved successfully');
    
    const populatedReminder = await PaymentReminders.populate('userId', 'username')
    console.log('Populated Reminder:', populatedReminder);
    
    res.status(200).json({ PaymentReminders });
  }
  catch(error){
    console.error("Error at backend sendPaymentReminder");
    res.status(500).json(error)

  }
}

exports.fetchNoPlanUsers = async(req,res)=>{
  try{
    console.log("-------------------------------------");
    console.log("Inside the fetchNoPlanUsers function");
    const usersWithoutPlans = await User.find({
      _id: { $nin: await SubscriptionPlan.distinct('userId') }
    });

    console.log("usersWithoutPlans",usersWithoutPlans);
    res.status(200).json(usersWithoutPlans)
  }catch(error){
    console.error("Error at fetchNoPlanUsers function");
    res.status(500).json(error)

  }
}

exports.fetchAllUsersAttendances = async(req,res)=>{
  try{
    console.log("++++++++++++++++++++++++++");
    console.log("Inside the fetchAllUsersAttendances function");
    const allUsers = await Attendance.find({'userId': { $exists:true }})
    console.log("allUsers:-",allUsers);
    res.status(200).json(allUsers)
    
  }catch(error){
    console.error("Error at the fetchAllUsersAttendances function");
    res.status(500).json(error)

  }
}
exports.fetchAllTrainersAttendances = async(req,res)=>{
  try{
    console.log("_______________________________");
    console.log("Inside the fetchAllTrainersAttendances function");
    const allTrainers = await Attendance.find({'userId': { $exists:false }})
    console.log("allTrainers:-",allTrainers);
    res.status(200).json(allTrainers)
    
  }catch(error){
    console.error("Error at the fetchAllTrainersAttendances function");
    res.status(500).json(error)

  }
}


exports.adminChangePasswordSubmit = async(req,res)=>{
  try{
    console.log("Inside the adminChangePasswordSubmit backend");
    const {newPassword, confirmPassword } = req.body;

    const adminId = req.headers.authorization?.split("Bearer ")[1]; 
    console.log("AdminId in 720:",adminId);
    

    if(newPassword !== confirmPassword){
      return res.status(400).json({message:"New Password and the confirmation don't match"});
    }

    const hashedPassword = await bcrypt.hash(newPassword,10);
    console.log("hashedPassword in 728:",hashedPassword);
    

    const updatedAdminPassword = await Admin.findByIdAndUpdate(
      adminId,
      {password:hashedPassword},
      {new: true}
    );

    if (!updatedAdminPassword) {
      return res.status(404).json({
        message: "Admin not found"
      });
    }

    console.log("updatedAdminPassword in 743:",updatedAdminPassword);

    res.status(200).json({
      message: "Admin Password updated successfully"
    });

  }catch(error){
    console.error("Error at backend adminChangePasswordSubmit");
    
  }
}