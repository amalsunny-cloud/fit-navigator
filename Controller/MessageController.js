const Message = require("../Model/messageSchema");
const trainerToUserMessage = require("../Model/trainerToUserMessageSchema");
const User = require("../Model/userSchema");




exports.sendMessage = async(req,res)=>{
    try {
        const { subject, message, recipients } = req.body;
        console.log(subject,message,recipients);
        
        // Validate required fields
        if (!subject || !message || !recipients) {
          return res.status(400).json({
            status: 'error',
            message: 'Please provide all required fields'
          });
        }
    
        // Map the frontend recipients value to the correct sentTo value
        let sentTo;
        switch(recipients) {
            case 'all':
                sentTo = 'All Members';
                break;
            case 'users':
                sentTo = 'Users';
                break;
            case 'trainers':
                sentTo = 'Trainers';
                break;
            default:
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid recipient type'
                });
        }

        // Create new message
        const newMessage = await Message.create({
          subject,
          message,
          sentTo,
          timestamp: new Date(),
          date: new Date().toISOString().split('T')[0],
        });

        res.status(201).json({
      status: 'success',
      data: {
        message: newMessage
      }
    });

  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error sending message'
    });
  }
};



exports.getMessages = async (req, res) => {
  try {
    const { type, search } = req.query;
    console.log(type,search);
    
    
    // Build query based on filters
    let query = {};
    
    if (type && type !== 'all') {
      query.sentTo = type === 'users' ? 'Users' : 'Trainers';
    }
    
    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const messages = await Message.find(query)
      .sort({ timestamp: -1 })
      .select('subject message sentTo date timestamp');

    res.status(200).json({
      status: 'success',
      results: messages.length,
      data: {
        messages
      }
    });

  } catch (error) {
    console.error('Error in getMessages:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving messages'
    });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);

    if (!message) {
      return res.status(404).json({
        status: 'error',
        message: 'Message not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Error in deleteMessage:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting message'
    });
  }
};


// Get messages for trainers (both trainer-specific and all-member messages)
exports.getTrainerMessages = async (req, res) => {
    try {
      const messages = await Message.find({
        sentTo: { $in: ['Trainers', 'All Members'] }
      }).sort({ timestamp: -1 });
  
      res.status(200).json({
        status: 'success',
        results: messages.length,
        data: {
          messages
        }
      });
    } catch (error) {
      console.error('Error in getTrainerMessages:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error retrieving messages'
      });
    }
  };

exports.getSingleMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        status: 'error',
        message: 'Message not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        message
      }
    });

  } catch (error) {
    console.error('Error in getSingleMessage:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving message'
    });
  }
};


// Get messages sent by a specific trainer
exports.getTrainerSentMessages = async (req, res) => {
  try {
    const messages = await trainerToUserMessage.find({ 
      trainerId: req.params.trainerId 
    }).sort({ timestamp: -1 });

    res.status(200).json({
      status: 'success',
      data: { messages }
    });
  } catch (error) {
    console.error('Error fetching trainer messages:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching trainer messages'
    });
  }
};



exports.trainerToUserMessage = async (req, res) => {
  const { text, username ,trainerId } = req.body;

  console.log("Received data:", { text, username });

  try {
    if (!username || !text) {
      return res.status(400).json({
        status: "error",
        message: "Please provide all required fields",
      });
    }

    // Fetch userId using username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    console.log("User ID found:", user._id);

    // Create new message
    const newMessage = await trainerToUserMessage.create({
      username,
      userId: user._id, // Corrected userId reference
      trainerId,
      text,
      timestamp: new Date(),
      date: new Date().toISOString().split("T")[0],
    });

    console.log("Message saved:", newMessage);

    res.status(201).json({
      status: "success",
      data: {
        message: newMessage,
      },
    });
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({
      status: "error",
      message: "Error sending message",
    });
  }
};




exports.getTrainerToUserMessages = async(req,res)=>{
  const { username } = req.query; 

  try {
    const query = username ? { username } : {};

    const messages = await trainerToUserMessage.find(query).sort({ timestamp: -1 }); // Sort by most recent

    console.log(messages);
    

    res.status(200).json({
      status: 'success',
      data: {
        messages,
      },
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching messages',
    });
  }
};



exports.deleteTrainerToUserMessages = async (req, res) => {
  try {
    const message = await trainerToUserMessage.findByIdAndDelete(req.params.id);

    if (!message) {
      return res.status(404).json({
        status: 'error',
        message: 'Message not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Error in deleteMessage:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting message'
    });
  }
};