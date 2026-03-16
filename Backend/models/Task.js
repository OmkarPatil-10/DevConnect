const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    sprint: { type: mongoose.Schema.Types.ObjectId, ref: 'Sprint' },
    title: String,
    description: String,
  
    status: { type: String, enum: ['To Do', 'In Progress', 'Done'], default: 'To Do' },
    // Multiple members can be assigned to a task
    assignedMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
    comments: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      text: String,
      timestamp: { type: Date, default: Date.now }
    }]
  }, { timestamps: true });
  
  module.exports = mongoose.model("Task", taskSchema);
  