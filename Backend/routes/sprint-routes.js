const express = require("express");
const router = express.Router();
const sprintController = require("../controllers/sprint-controller");
const { authMiddleware } = require("../controllers/auth/auth-controller");

router.post("/", authMiddleware, sprintController.createSprint); // POST /api/sprints
router.get('/join-requests', authMiddleware, sprintController.getJoinRequests);
router.get('/:id/join-requests', authMiddleware, sprintController.getJoinRequestsForSprint);
router.patch('/:id/handle-request', authMiddleware, sprintController.handleJoinRequest);
router.patch("/:id/join", authMiddleware, sprintController.joinSprint); // PATCH /api/sprints/:id/join
router.get("/", authMiddleware, sprintController.getAllSprints); // GET /api/sprints
router.get('/user/list', authMiddleware, sprintController.getUserSprints);
router.get("/:id", authMiddleware, sprintController.getSprintById); // GET /api/sprints/:id
router.put("/:id", authMiddleware, sprintController.updateSprint); // PUT /api/sprints/:id
router.delete("/:id", authMiddleware, sprintController.deleteSprint); // DELETE /api/sprints/:id
router.get('/:id/resources', authMiddleware, sprintController.getSprintResources);
router.patch('/:id/resources', authMiddleware, sprintController.updateSprintResources);
router.patch('/:id/finish', authMiddleware, sprintController.finishSprint);

router.get('/:id/join-status', authMiddleware, sprintController.getUserJoinRequestStatus);

router.get('/:id/members', authMiddleware, sprintController.getSprintMembers);

module.exports = router;