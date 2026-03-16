const mongoose = require("mongoose");

const sprintSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    techStack: [String], // e.g., ['React', 'Node.js']
    duration: Number, // in days
    startDate: Date,
    endDate: Date,

    isPublic: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    isFinished: { type: Boolean, default: false },

    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    maxTeamSize: Number,
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
    resources: {
      github: String,
      figma: String,
      docs: String,
      extraLinks: [String],
    },
    summary: { type: String },

    feedback: [
      {
        from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        to: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: Number,
        tags: [String],
        comment: String,
      },
    ],
    joinRequests: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        message: String,
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected"],
          default: "pending",
        },
        requestedAt: { type: Date, default: Date.now },
      },
    ],

    // --- AI matching fields ---
    // Natural language summary used for embeddings
    embeddingText: { type: String },
    // Vector from Gemini embeddings
    embedding: { type: [Number], default: undefined },
    // Optional: summary of current team skills
    teamSkillsSummary: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sprint", sprintSchema);
