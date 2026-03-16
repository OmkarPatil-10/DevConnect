const express = require("express");
const router = express.Router();
const msgController = require("../controllers/msg-controller");
const { authMiddleware } = require("../controllers/auth/auth-controller");

// All routes are mounted at /api/message in server.js

// Get messages for a sprint
router.get("/sprint/:id", authMiddleware, msgController.getMessagesForSprint);

// Send a message
router.post("/", authMiddleware, msgController.sendMessage);

module.exports = router;
