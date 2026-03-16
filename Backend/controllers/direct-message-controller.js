const DirectMessage = require('../models/DirectMessage');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get all conversations for a user
const getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const toObjectId = (id) => {
      try { return new mongoose.Types.ObjectId(id); } catch (_) { return null; }
    };
    const userObjectId = toObjectId(userId);
    
    const conversations = await Conversation.find({
      participants: { $in: [userId, userObjectId].filter(Boolean) },
      isActive: true
    })
    .populate({
      path: 'participants',
      select: 'username email'
    })
    .populate({
      path: 'lastMessage',
      populate: {
        path: 'sender',
        select: 'username'
      }
    })
    .sort({ lastMessageTime: -1 });

    res.status(200).json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations',
      error: error.message
    });
  }
};

// Get messages for a specific conversation
const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Verify user is participant in this conversation
    const conversation = await Conversation.findById(conversationId);

    if (!conversation || !conversation.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or access denied'
      });
    }

    // Enforce access control in app layer to avoid type mismatch issues
    const userInConversation = (conversation.participants || [])
      .map(p => String(p))
      .includes(String(userId));

    if (!userInConversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or access denied'
      });
    }

    const messages = await DirectMessage.find({ conversation: conversationId })
      .populate('sender', 'username email')
      .populate('recipient', 'username email')
      .sort({ timestamp: 1 });

    // Mark messages as read
    await DirectMessage.updateMany(
      {
        conversation: conversationId,
        recipient: userId,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    res.status(200).json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message
    });
  }
};

// Create or get conversation between two users
const getOrCreateConversation = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const currentUserId = req.user.id;

    if (currentUserId === otherUserId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create conversation with yourself'
      });
    }

    // Check if users are connected
    const ConnectionRequest = require('../models/ConnectionRequest');
    const connection = await ConnectionRequest.findOne({
      $or: [
        { fromUser: currentUserId, toUser: otherUserId, status: 'accepted' },
        { fromUser: otherUserId, toUser: currentUserId, status: 'accepted' }
      ]
    });

    if (!connection) {
      return res.status(403).json({
        success: false,
        message: 'You can only chat with your connections'
      });
    }
    // Normalize ids as ObjectIds and strings for robust querying
    const toObjectId = (id) => {
      try {
        return new mongoose.Types.ObjectId(id);
      } catch (_) {
        return null;
      }
    };

    const currentObjectId = toObjectId(currentUserId);
    const otherObjectId = toObjectId(otherUserId);

    const sortedStringIds = [String(currentUserId), String(otherUserId)].sort();
    const participantHash = sortedStringIds.join('_');

    // Try to find existing conversation using several strategies (covers legacy data)
    let conversation = await Conversation.findOne({
      $or: [
        { participantHash, isActive: true },
        { participants: { $all: [currentObjectId, otherObjectId] }, isActive: true },
        { participants: { $all: [String(currentUserId), String(otherUserId)] }, isActive: true },
        { participants: [currentUserId, otherUserId], isActive: true },
        { participants: [otherUserId, currentUserId], isActive: true }
      ]
    });

    if (!conversation) {
      // Create atomically using upsert on participantHash
      const sortedParticipants = [currentObjectId || currentUserId, otherObjectId || otherUserId]
        .map(String)
        .sort();

      const upsertData = {
        $setOnInsert: {
          participants: sortedParticipants,
          participantHash,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastMessageTime: new Date()
        }
      };

      conversation = await Conversation.findOneAndUpdate(
        { participantHash },
        upsertData,
        { new: true, upsert: true }
      );
    }

    // Populate participants
    await conversation.populate({
      path: 'participants',
      select: 'username email'
    });

    res.status(200).json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error('Error creating/getting conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating conversation',
      error: error.message
    });
  }
};

// Send a direct message
const sendDirectMessage = async (req, res) => {
  try {
    const { conversationId, text, recipientId } = req.body;
    const senderId = req.user.id;

    // Verify conversation exists and user is participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: { $in: [senderId] },
      isActive: true
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or access denied'
      });
    }

    // Create message
    const message = new DirectMessage({
      conversation: conversationId,
      sender: senderId,
      recipient: recipientId,
      text: text.trim()
    });

    await message.save();

    // Update conversation's last message
    conversation.lastMessage = message._id;
    conversation.lastMessageTime = message.timestamp;
    await conversation.save();

    // Populate message data
    await message.populate([
      { path: 'sender', select: 'username email' },
      { path: 'recipient', select: 'username email' }
    ]);

    res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message
    });
  }
};

// Mark messages as read
const markMessagesAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    await DirectMessage.updateMany(
      {
        conversation: conversationId,
        recipient: userId,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking messages as read',
      error: error.message
    });
  }
};

// Get unread message count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadCount = await DirectMessage.countDocuments({
      recipient: userId,
      isRead: false
    });

    res.status(200).json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting unread count',
      error: error.message
    });
  }
};

module.exports = {
  getUserConversations,
  getConversationMessages,
  getOrCreateConversation,
  sendDirectMessage,
  markMessagesAsRead,
  getUnreadCount
};
