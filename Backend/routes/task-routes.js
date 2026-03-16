const express = require("express");
const router = express.Router();
const taskController = require("../controllers/task-controller");
const { authMiddleware } = require("../controllers/auth/auth-controller");

// All routes are mounted at /api/tasks in server.js

// Create a task
router.post("/", authMiddleware, taskController.createTask);

// Update a task
router.put("/:id", authMiddleware, taskController.updateTask);

// Delete a task
router.delete("/:id", authMiddleware, taskController.deleteTask);

// Get all tasks for a sprint
router.get("/sprint/:id", authMiddleware, taskController.getAllTasks);

// Change task status
router.patch("/:id/status", authMiddleware, taskController.changeTaskStatus);

// Get all comments for a task
router.get("/:taskId/comments", authMiddleware, taskController.getAllComments);

// Add a comment to a task
router.post("/:taskId/comments", authMiddleware, taskController.addComment);

// Edit a comment on a task
router.put("/:taskId/comments/:commentId", authMiddleware, taskController.editComment);

// Remove a comment from a task
router.delete("/:taskId/comments/:commentId", authMiddleware, taskController.removeComment);

// Assign members to a task
router.post("/:taskId/assign", authMiddleware, taskController.assignMembersToTask);

// Remove a member from a task
router.delete("/:taskId/assign/:memberId", authMiddleware, taskController.removeMemberFromTask);

// Get all tasks assigned to a user in a specific sprint
router.get("/:sprintId/user/:userId/tasks", authMiddleware, taskController.getUserTasksInSprint);

module.exports = router;
