const jwt = require('jsonwebtoken');
const User = require('../Model/userSchema');
const mongoose  = require('mongoose');



const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized. Token is missing.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user data to the request
    console.log("after token decoded");
    console.log("decoded is :",decoded);
    
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

const authorizeAdmin = (req, res, next) => {
  console.log("beofre checking...");
  
  if (!req.user?.adminId) {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};



//authenticate2

const authenticate2 = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  console.log(token);
  

  if (!token) {
    return res.status(401).json({ message: 'Access Denied. No Token Provided.' });
  }

  try {
    console.log("brfore the decode");
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("after the decode",decoded);

    console.log('Decoded ID type:', typeof decoded.id);    
    
    req.user = await User.findById(decoded.id);
    // req.user = await User.findById(mongoose.Types.ObjectId(decoded.id));
    console.log(req.user);
    
    if (!req.user) {
      return res.status(401).json({ message: 'User not found. Authentication failed.' });
    }
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Invalid token.' });
  }
};

module.exports = { authenticate2, authenticate, authorizeAdmin };
