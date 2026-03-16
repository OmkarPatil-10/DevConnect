const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  // Deterministic hash of sorted participant ids to enforce single conversation per pair
  participantHash: {
    type: String,
    index: true,
    unique: true,
    sparse: true
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DirectMessage',
    default: null
  },
  lastMessageTime: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add a pre-save hook to update timestamp
conversationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create a compound index for better query performance (no unique constraint on participants)
conversationSchema.index({ participants: 1, isActive: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
