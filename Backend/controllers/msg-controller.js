const Message = require("../models/Message");
const Sprint = require("../models/Sprint");

// Get messages for a sprint
const getMessagesForSprint = async (req, res) => {
  try {
    const messages = await Message.find({ sprint: req.params.id })
      .populate('sender', 'username')
      .sort({ timestamp: 1 }); // Sort by timestamp ascending (oldest first)
    res.status(200).json({ messages });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Send a message
const sendMessage = async (req, res) => {
  const { sprintId, text } = req.body;
  const senderId = req.user.id; // from auth middleware

  try {
    if (!sprintId || !text) {
      return res.status(400).json({ message: "Sprint ID and text are required" });
    }

    const message = await Message.create({
      sprint: sprintId,
      sender: senderId,
      text,
      timestamp: new Date()
    });

    // Optional: Add message to sprint's messages array
    await Sprint.findByIdAndUpdate(sprintId, { $push: { messages: message._id } });

    // Populate sender info before sending response
    const populatedMessage = await Message.findById(message._id).populate('sender', 'username');
    
    res.status(201).json({ message: populatedMessage });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getMessagesForSprint,
  sendMessage
};
