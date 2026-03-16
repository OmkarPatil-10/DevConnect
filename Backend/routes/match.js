const express = require('express');
const router = express.Router();
const matchController = require('../controllers/match-controller');

// Search for developers (rule-based)
router.get('/', matchController.searchDevelopers);

// AI-powered developer partner recommendations
router.get('/ai/developers', matchController.getAIDeveloperMatches);

// AI-powered sprint recommendations
router.get('/ai/sprints', matchController.getAISprintMatches);

// Helper: Get all users (for testing - to get userIds)
router.get('/test/users', matchController.getAllUsersForTesting);

// Send connection request
router.post('/request', matchController.sendConnectionRequest);

// Accept connection request
router.post('/request/:requestId/accept', matchController.acceptConnectionRequest);

// Reject connection request
router.post('/request/:requestId/reject', matchController.rejectConnectionRequest);

// Remove connection
router.delete('/connection/:connectionId', matchController.removeConnection);

// Get pending connection requests
router.get('/requests/:userId', matchController.getPendingRequests);

// Get user connections
router.get('/connections/:userId', matchController.getConnections);

// Get sent connection requests
router.get('/sent-requests/:userId', matchController.getSentRequests);

// Cancel a sent connection request
router.delete('/request/:requestId', matchController.cancelConnectionRequest);

module.exports = router; 