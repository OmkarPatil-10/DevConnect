const express = require('express');
const router = express.Router();
const directMessageController = require('../controllers/direct-message-controller');
const { authMiddleware } = require('../controllers/auth/auth-controller');

// All routes require authentication
router.use(authMiddleware);

// Get all conversations for the current user
router.get('/conversations', directMessageController.getUserConversations);

// Get or create conversation with another user
router.get('/conversation/:otherUserId', directMessageController.getOrCreateConversation);

// Get messages for a specific conversation
router.get('/conversation/:conversationId/messages', directMessageController.getConversationMessages);

// Send a direct message
router.post('/send', directMessageController.sendDirectMessage);

// Mark messages as read
router.put('/conversation/:conversationId/read', directMessageController.markMessagesAsRead);

// Get unread message count
router.get('/unread-count', directMessageController.getUnreadCount);

module.exports = router;
