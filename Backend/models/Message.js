const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sprint: { type: mongoose.Schema.Types.ObjectId, ref: 'Sprint' },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    timestamp: { type: Date, default: Date.now }
  });
  
  module.exports = mongoose.model("Message", messageSchema);
  