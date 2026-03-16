const Sprint = require("../models/Sprint");
const User = require("../models/User");
const mongoose = require("mongoose");

const isSprintClosed = (sprint) => {
  if (!sprint) return true;
  if (sprint.isFinished || sprint.isActive === false) return true;
  if (sprint.endDate && new Date(sprint.endDate) < new Date()) return true;
  return false;
};

//create a sprint
const createSprint = async (req, res) => {
  const {
    title,
    description,
    techStack,
    duration,
    startDate,
    creator,
    maxTeamSize,
  } = req.body;
console.log(req.body);
  // Validate required fields
  if (
    !title ||
    !description ||
    !techStack ||
    !duration ||
    !startDate ||
    !creator ||
    !maxTeamSize
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if creator exists
    const creatorUser = await User.findById(creator);
    if (!creatorUser) {
      return res.status(404).json({ message: "Creator not found" });
    }

    // (Optional) Check for unique title
    // const existingSprint = await Sprint.findOne({ title });
    // if (existingSprint) {
    //     return res.status(400).json({ message: "Sprint with this title already exists" });
    // }

    // Calculate endDate based on startDate and duration
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + Number(duration));

    // Create the sprint
    const sprint = await Sprint.create({
      title,
      description,
      techStack,
      duration,
      startDate: start,
      endDate: end,
      creator,
      teamMembers: [creator],
      maxTeamSize,
    });

    // (Optional) Add sprint to creator's sprints array if it exists in User model
    if (creatorUser.sprints) {
      creatorUser.sprints.push(sprint._id);
      await creatorUser.save();
    }

    // Return only the sprint ID for redirect
    res.status(201).json({ sprintId: sprint._id });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Internal server error" });
  }
};

// //join a sprint
// const joinSprint = async (req, res) => {
//   // Get sprintId from params and userId from body (or req.user if using auth)
//   const sprintId = req.params.id || req.body.sprintId;
//   const { message } = req.body;
//   // Use userId from req.user if available, otherwise from req.body
//   const userId = req.user?.id || req.user?._id || req.body.userId;

//   try {
//     // 1. Find sprint
//     const sprint = await Sprint.findById(sprintId);
//     if (!sprint) {
//       return res.status(404).json({ message: "Sprint not found" });
//     }

//     // 2. Find user
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // 3. Check if sprint is full
//     if (sprint.teamMembers.length >= sprint.maxTeamSize) {
//       // (Optional) Suggest other open sprints here
//       return res.status(400).json({ message: "Sprint is full" });
//     }

//     // 4. Check if sprint has started (current date >= startDate)
//     //skipping this check for now 
//     // const now = new Date();
//     // if (now >= sprint.startDate) {
//     //   return res.status(400).json({ message: "Sprint has already started" });
//     // }

//     // 5. Check if sprint is finished
//     if (sprint.isFinished) {
//       return res.status(400).json({ message: "Sprint is already finished" });
//     }

//     // 6. Check if user is already in the sprint
//     if (
//       sprint.teamMembers.some(
//         (memberId) => memberId.toString() === userId.toString()
//       )
//     ) {
//       return res.status(400).json({ message: "User is already in the sprint" });
//     }

//     // 7. Add user to teamMembers
//     // sprint.teamMembers.push(userId);
//     // sprint.joinRequests.push({ user: userId, message });
//     // await sprint.save();

//     // 8. (Optional) Add sprint to user's sprints array if it exists
//     // if (user.sprints) {
//     //   user.sprints.push(sprint._id);
//     //   await user.save();
//     // }

//     res.status(200).json({ message: "User joined the sprint successfully" });
//   } catch (e) {
//     console.log(e);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };
// controllers/sprint-controller.js
const joinSprint = async (req, res) => {
  try {
    const sprintId = req.params.id;
    const userId = req.user.id;
    const { message } = req.body;

    const sprint = await Sprint.findById(sprintId);
    if (!sprint) {
      return res.status(404).json({ message: "Sprint not found" });
    }

    if (isSprintClosed(sprint)) {
      return res
        .status(400)
        .json({ message: "Sprint has already ended" });
    }

    if (
      typeof sprint.maxTeamSize === "number" &&
      sprint.teamMembers.length >= sprint.maxTeamSize
    ) {
      return res.status(400).json({ message: "Sprint is full" });
    }

    // Check if already in team
    if (sprint.teamMembers.some(m => m.toString() === userId)) {
      return res.status(400).json({ message: "You are already a member" });
    }

    // Check if already requested
    if (sprint.joinRequests.some(r => r.user.toString() === userId)) {
      return res.status(400).json({ message: "Already requested" });
    }

    sprint.joinRequests.push({
      user: userId,
      message: message || ""
    });

    await sprint.save();

    res.status(200).json({
      message: "Join request sent successfully",
      sprintId: sprint._id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


//join requests
// const getJoinRequests = async (req,res) => {
//   try{
//   const userId = req.user.id;
//   const requests = await Sprint.find({joinRequests: {$elemMatch: {user: userId}}});
//   const sprintIds = requests.map(request => request._id);
//   res.status(200).json({ sprintIds });
//   } catch (e) {
//     console.log(e);
//     res.status(500).json({ message: "Internal server error" });
//   }
// }
// const getJoinRequests = async (req, res) => {
//   try {
//     if (!req.user || !req.user.id) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const userId = new mongoose.Types.ObjectId(req.user.id);
//     const requests = await Sprint.find({
//       joinRequests: { $elemMatch: { user: userId } }
//     });

//     const sprintIds = requests.map(request => request._id);
//     res.status(200).json({ sprintIds });
//   } catch (e) {
//     console.error("Error fetching join requests:", e);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };
const getJoinRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const requests = await Sprint.find({
      joinRequests: { $elemMatch: { user: userId } }
    }).select("_id");

    const sprintIds = requests.map(r => r._id.toString());
    res.status(200).json({ sprintIds });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


//get all sprints
const getAllSprints = async (req, res) => {
  try {
    const now = new Date();
    const sprints = await Sprint.find({
      isActive: true,
      isFinished: false,
      $or: [{ endDate: null }, { endDate: { $gte: now } }],
    }).populate('creator', 'username');
    res.status(200).json({ sprints });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Internal server error" });
  }
};

//get a sprint by id
//get sprint info for sprint room
const getSprintById = async (req, res) => {
  const sprintId = req.params.id;
  try {
    let sprint = await Sprint.findById(sprintId)
      .populate('teamMembers', 'username role profilePicture email')
      .populate('creator', 'username email profilePicture')
      .populate('feedback.from', 'username profilePicture');
    if (!sprint) {
      return res.status(404).json({ message: "sprint not found" });
    }

    // Auto-mark sprint as finished if endDate has passed and it's still active
    if (!sprint.isFinished && sprint.endDate && sprint.endDate < new Date()) {
      sprint.isFinished = true;
      sprint.isActive = false;
      await sprint.save();
    }

    res.status(200).json({ sprint });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Internal server error" });
  }
};

//update a sprint
const updateSprint = async (req, res) => {
  const sprintId = req.params.id;
  const userId = req.user.id; // Should come from auth in a real app
  const updateData = req.body;
  try {
    const sprint = await Sprint.findById(sprintId);
    if (!sprint) {
      return res.status(404).json({ message: "Sprint not found" });
    }
    if (sprint.creator.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Only the creator can update this sprint" });
    }
    if (isSprintClosed(sprint)) {
      return res
        .status(400)
        .json({ message: "Sprint has already ended" });
    }
    const updatedSprint = await Sprint.findByIdAndUpdate(sprintId, updateData, {
      new: true,
    });
    res.status(200).json({ sprint: updatedSprint });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Internal server error" });
  }
};

//delete a sprint
const deleteSprint = async (req, res) => {
  const sprintId = req.params.id;
  const userId = req.user.id;
  try {
    const sprint = await Sprint.findById(sprintId);
    if (!sprint) {
      return res.status(404).json({ message: "Sprint not found" });
    }
    if (sprint.creator.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Only the creator can delete this sprint" });
    }
    await Sprint.findByIdAndDelete(sprintId);
    res.status(200).json({ message: "sprint deleted successfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Internal server error" });
  }
};

//sprint-room resources
const getSprintResources = async (req, res) => {
  const sprintId = req.params.id;
  try {
    const sprint = await Sprint.findById(sprintId, "resources");
    if (!sprint) {
      return res.status(404).json({ message: "Sprint not found" });
    }
    res.status(200).json({ resources: sprint.resources });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Internal server error" });
  }
};

//sprint-room  update resources
const updateSprintResources = async (req, res) => {
  const sprintId = req.params.id;
  const userId = req.user.id;
  const resources = req.body; // Should be an object with githubRepo, demoLink, extraLinks, etc.
  try {
    const sprint = await Sprint.findById(sprintId);
    if (!sprint) {
      return res.status(404).json({ message: "Sprint not found" });
    }
    if (sprint.creator.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Only the creator can update resources" });
    }
    if (isSprintClosed(sprint)) {
      return res
        .status(400)
        .json({ message: "Sprint has already ended" });
    }
    sprint.resources = { ...sprint.resources, ...resources };
    await sprint.save();
    res.status(200).json({ resources: sprint.resources });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Internal server error" });
  }
};

// //get join requests for a sprint
// const getJoinRequestsForSprint = async (req,res) => {
//   const sprintId = req.params.id;
//   const userId = req.user.id;
//   try {
//     const sprint = await Sprint.findById(sprintId).populate('joinRequests.user', 'username message');
//     if(!sprint){
//       return res.status(404).json({ message: "Sprint not found" });
//     }
//     if(sprint.creator.toString() !== userId){
//       return res.status(403).json({ message: "Only the creator can get join requests for this sprint" });
//     }
//     res.status(200).json({ joinRequests: sprint.joinRequests });
//   } catch (e) {
//     console.log(e);
//     res.status(500).json({ message: "Internal server error" });
//   }
// }

// //accept or reject join request
// const handleJoinRequest = async (req,res) => {
//   const sprintId = req.params.id;
//   const userId = req.user.id;
//   const { requestId, status } = req.body;
//   try {
//     const sprint = await Sprint.findById(sprintId);
//     if(!sprint){
//       return res.status(404).json({ message: "Sprint not found" });
//     }
//     if(sprint.creator.toString() !== userId){
//       return res.status(403).json({ message: "Only the creator can handle join requests" });
//     }
//     const request = sprint.joinRequests.find(req => req._id.toString() === requestId);
//     if(!request){
//       return res.status(404).json({ message: "Join request not found" });
//     }
//     if(status === "accepted"){
//       // sprint.teamMembers.push(request.user);
//       // Add to teamMembers if not already
//       if (!sprint.teamMembers.includes(request.user)) {
//         sprint.teamMembers.push(request.user);
//       }
//       // Remove from joinRequests
//       sprint.joinRequests = sprint.joinRequests.filter(req => req._id.toString() !== requestId.toString());
//     }
//     if(status === "rejected"){
//       sprint.joinRequests = sprint.joinRequests.filter(req => req._id.toString() !== requestId.toString());
//     }
//     request.status = status;
//     await sprint.save();
//     res.status(200).json({ message: `${status} join request for ${request.user.username} successfully` });
//   } catch(e){
//     console.log(e);
//     res.status(500).json({ message: "Internal server error" });
//   }
// }

// Get join requests for a sprint
const getJoinRequestsForSprint = async (req, res) => {
  const sprintId = req.params.id;
  const userId = req.user.id;

  try {
    const sprint = await Sprint.findById(sprintId)
      .populate('joinRequests.user', 'username');

    if (!sprint) {
      return res.status(404).json({ message: "Sprint not found" });
    }
    if (sprint.creator.toString() !== userId) {
      return res.status(403).json({ message: "Only the creator can get join requests for this sprint" });
    }

    res.status(200).json({ joinRequests: sprint.joinRequests });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Accept or reject join request
const handleJoinRequest = async (req, res) => {
  const sprintId = req.params.id;
  const userId = req.user.id;
  const { requestId, status } = req.body;

  try {
    const sprint = await Sprint.findById(sprintId)
      .populate('joinRequests.user', 'username');

    if (!sprint) {
      return res.status(404).json({ message: "Sprint not found" });
    }
    if (sprint.creator.toString() !== userId) {
      return res.status(403).json({ message: "Only the creator can handle join requests" });
    }

    if (isSprintClosed(sprint)) {
      return res
        .status(400)
        .json({ message: "Sprint has already ended" });
    }

    const request = sprint.joinRequests.find(r => r._id.toString() === requestId);
    if (!request) {
      return res.status(404).json({ message: "Join request not found" });
    }

    if (status === "accepted") {
      if (
        typeof sprint.maxTeamSize === "number" &&
        sprint.teamMembers.length >= sprint.maxTeamSize
      ) {
        return res.status(400).json({ message: "Sprint is full" });
      }

      if (!sprint.teamMembers.some(member => member.equals(request.user._id))) {
        sprint.teamMembers.push(request.user._id);
      }
      sprint.joinRequests = sprint.joinRequests.filter(r => r._id.toString() !== requestId);
    }

    if (status === "rejected") {
      sprint.joinRequests = sprint.joinRequests.filter(r => r._id.toString() !== requestId);
    }

    request.status = status; // status is optional if you remove from array
    await sprint.save();

    res.status(200).json({ message: `${status} join request for ${request.user.username} successfully` });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal server error" });
  }
};


//mark sprint as finished
const finishSprint = async (req, res) => {
    const sprintId = req.params.id;
    const userId = req.user.id;
    const { summary } = req.body || {};
    try {
        const sprint = await Sprint.findById(sprintId);
        if (!sprint) {
            return res.status(404).json({ message: "Sprint not found" });
        }
        if (sprint.creator.toString() !== userId) {
            return res.status(403).json({ message: "Only the creator can finish the sprint" });
        }
        sprint.isFinished = true;
        sprint.isActive = false;
        if (summary) {
          sprint.summary = summary;
        }
        if (!sprint.endDate || new Date(sprint.endDate) < new Date()) {
          sprint.endDate = new Date();
        }
        await sprint.save();
        res.status(200).json({ sprint });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: "Internal server error" });
    }
};

const buildStatusQuery = (status) => {
  const now = new Date();
  switch ((status || "all").toLowerCase()) {
    case "active":
      return {
        isFinished: false,
        isActive: true,
        $or: [{ endDate: null }, { endDate: { $gte: now } }],
      };
    case "ended":
      return {
        $or: [
          { isFinished: true },
          { isActive: false },
          { endDate: { $lt: now } },
        ],
      };
    default:
      return {};
  }
};

const getUserSprints = async (req, res) => {
  const { scope = "created", status = "all" } = req.query;
  const userId = req.user.id;

  try {
    const statusQuery = buildStatusQuery(status);
    const baseQuery =
      scope === "joined" ? { teamMembers: userId } : { creator: userId };

    const sprints = await Sprint.find({ ...baseQuery, ...statusQuery })
      .populate("creator", "username")
      .populate("teamMembers", "username role profilePicture");

    res.status(200).json({ sprints });
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json({ message: "Internal server error while fetching user sprints" });
  }
};

// Get the current user's join request status for a sprint
const getUserJoinRequestStatus = async (req, res) => {
  const sprintId = req.params.id;
  const userId = req.user.id;

  try {
    const sprint = await Sprint.findById(sprintId);

    if (!sprint) {
      return res.status(404).json({ message: "Sprint not found" });
    }

    // If user is already in team
    if (sprint.teamMembers.includes(userId)) {
      return res.status(200).json({ status: "accepted" });
    }

    // Check join request
    const request = sprint.joinRequests.find(r => r.user.toString() === userId);
    if (request) {
      return res.status(200).json({ status: request.status || "pending" });
    }

    // No request found
    return res.status(200).json({ status: "none" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal server error" });
  }
};

// get sprint members
const getSprintMembers = async (req,res)=>{
  try {
    const sprint = await Sprint.findById(req.params.id).populate(
      "teamMembers",
      "username email"
    );

    if (!sprint) {
      return res.status(404).json({ message: "Sprint not found" });
    }

    res.json({ members: sprint.teamMembers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  createSprint,
  joinSprint,
  getJoinRequests,
  getAllSprints,
  getSprintById,
  updateSprint,
  deleteSprint,
  getSprintResources,
  updateSprintResources,
  finishSprint,
  getJoinRequestsForSprint,
  handleJoinRequest,
  getUserJoinRequestStatus,
  getSprintMembers,
  getUserSprints,
};
