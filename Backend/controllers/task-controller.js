const Task = require("../models/Task");
const Sprint = require("../models/Sprint");

const isSprintLocked = (sprint) => {
  if (!sprint) return true;
  if (sprint.isFinished || sprint.isActive === false) return true;
  if (sprint.endDate && new Date(sprint.endDate) < new Date()) return true;
  return false;
};

/********** Task Management **********/
//create task
const createTask = async (req, res) => {
  const { sprintId, title, description, assignedMembers, status } = req.body;
  try {
    if (!sprintId || !title) {
      return res.status(400).json({ message: "Required fields are missing" });
    }
    const sprint = await Sprint.findById(sprintId);
    if (!sprint) {
      return res.status(404).json({ message: "Sprint not found" });
    }
    if (isSprintLocked(sprint)) {
      return res.status(400).json({ message: "Sprint has already ended" });
    }
    const task = await Task.create({
      sprint: sprintId,
      title,
      description,
      assignedMembers,
      status,
    });
    // Optional: Add task to sprint's tasks array
    await Sprint.findByIdAndUpdate(sprintId, { $push: { tasks: task._id } });
    res.status(201).json({ task });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Internal server error" });
  }
};
//update task
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    const sprint = await Sprint.findById(task.sprint);
    if (!sprint) {
      return res.status(404).json({ message: "Sprint not found" });
    }
    if (isSprintLocked(sprint)) {
      return res.status(400).json({ message: "Sprint has already ended" });
    }
    Object.assign(task, req.body);
    await task.save();
    res.status(200).json({ task });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Internal server error" });
  }
};
//delete task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    const sprint = await Sprint.findById(task.sprint);
    if (!sprint) {
      return res.status(404).json({ message: "Sprint not found" });
    }
    if (isSprintLocked(sprint)) {
      return res.status(400).json({ message: "Sprint has already ended" });
    }
    await task.deleteOne();
    // Optional: Remove from sprint's tasks array
    await Sprint.findByIdAndUpdate(task.sprint, { $pull: { tasks: task._id } });
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Internal server error" });
  }
};
//get all task
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ sprint: req.params.id })
      .populate("assignedMembers", "username")
      .populate("sprint","creator email")
      .populate("comments.user", "username");
    res.status(200).json({ tasks });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Internal server error" });
  }
};
//change task status
const changeTaskStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    const sprint = await Sprint.findById(task.sprint);
    if (!sprint) {
      return res.status(404).json({ message: "Sprint not found" });
    }
    if (isSprintLocked(sprint)) {
      return res.status(400).json({ message: "Sprint has already ended" });
    }
    task.status = status;
    await task.save();
    res.status(200).json({ task });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Internal server error" });
  }
};

/********** assigning members to task **********/
//assign members to a task
// const assignMembersToTask = async (req, res) => {
//   try {
//     const { taskId } = req.params;
//     const { members } = req.body; // array of userIds

//     const task = await Task.findById(taskId).populate("sprint");
//     if (!task) return res.status(404).json({ message: "Task not found" });

//     const sprint = await Sprint.findById(task.sprint);
//     if (!sprint) return res.status(404).json({ message: "Sprint not found" });

//     // validate: only members of sprint can be assigned
//     const invalidMembers = members.filter(
//       (userId) => !sprint.members.includes(userId)
//     );
//     if (invalidMembers.length > 0) {
//       return res.status(400).json({
//         message: "Some users are not part of this sprint",
//         invalidMembers,
//       });
//     }

//     // add members (avoid duplicates)
//     task.assignedMembers = [...new Set([...task.assignedMembers, ...members])];
//     await task.save();

//     res.json(task);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
// const assignMembersToTask = async (req, res) => {
//   try {
//     const { taskId } = req.params;
//     const { members } = req.body; // array of userIds (strings)

//     const task = await Task.findById(taskId).populate("sprint");
//     if (!task) return res.status(404).json({ message: "Task not found" });

//     const sprint = task.sprint;
//     if (!sprint) return res.status(404).json({ message: "Sprint not found" });
// console.log("Sprint fetched:", sprint);
//     // validate: only members of sprint can be assigned
//     const invalidMembers = members.filter(
//       (userId) =>
//         !sprint.members.some((m) => m.toString() === userId.toString())
//     );
//     if (invalidMembers.length > 0) {
//       return res.status(400).json({
//         message: "Some users are not part of this sprint",
//         invalidMembers,
//       });
//     }

//     // assign members (avoid duplicates)
//     const updatedMembers = [
//       ...new Set([
//         ...task.assignedMembers.map((m) => m.toString()),
//         ...members.map((m) => m.toString()),
//       ]),
//     ];

//     task.assignedMembers = updatedMembers;
//     await task.save();
//     // repopulate assignedMembers to include usernames and emails
//     await task.populate("assignedMembers", "username email");

//     res.json(task);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
const assignMembersToTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { members } = req.body; // array of userIds (strings)

    // fetch task and populate sprint (only _id + teamMembers for validation)
    const task = await Task.findById(taskId).populate("sprint", "teamMembers");
    if (!task) return res.status(404).json({ message: "Task not found" });

    const sprint = task.sprint;
    if (!sprint) return res.status(404).json({ message: "Sprint not found" });

    console.log("✅ Sprint fetched:", sprint);

    if (isSprintLocked(sprint)) {
      return res.status(400).json({ message: "Sprint has already ended" });
    }

    // validate: only sprint teamMembers can be assigned
    const invalidMembers = members.filter(
      (userId) =>
        !sprint.teamMembers.some((m) => m.toString() === userId.toString())
    );

    if (invalidMembers.length > 0) {
      return res.status(400).json({
        message: "Some users are not part of this sprint",
        invalidMembers,
      });
    }

    // avoid duplicates
    const updatedMembers = [
      ...new Set([
        ...task.assignedMembers.map((m) => m.toString()),
        ...members.map((m) => m.toString()),
      ]),
    ];

    task.assignedMembers = updatedMembers;
    await task.save();

    // repopulate to return full user details (username, email)
    await task.populate("assignedMembers", "username email");

    return res.status(200).json({task});
  } catch (err) {
    console.error("❌ Error in assignMembersToTask:", err);
    res.status(500).json({ message: err.message });
  }
};



//remove member from task
// const removeMemberFromTask = async (req, res) => {
//   try {
//     const { taskId, userId } = req.params;

//     // 1. Find task
//     const task = await Task.findById(taskId).populate("sprintId"); // populate sprint
//     if (!task) return res.status(404).json({ message: "Task not found" });

//     const sprint = task.sprintId;
//     if (!sprint) return res.status(404).json({ message: "Sprint not found" });

//     // 2. Check if logged-in user is sprint creator
//     if (sprint.creator.toString() !== req.user._id.toString()) {
//       return res
//         .status(403)
//         .json({ message: "Only sprint creator can remove members from tasks" });
//     }

//     // 3. Remove the member from assignedTo
//     task.assignedMembers = task.assignedMembers.filter(
//       (memberId) => memberId.toString() !== userId
//     );
//     await task.save();

//     res.json({ message: "Member removed from task", task });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
// const removeMemberFromTask = async (req, res) => {
//   try {
//     const { taskId, userId } = req.params;

//     // 1. Find task
//     const task = await Task.findById(taskId).populate({
//       path: "sprint",
//       populate: {
//         path: "creator", // ensure creator is populated
//         select: "_id"
//       }
//     });

//     if (!task) return res.status(404).json({ message: "Task not found" });

//     const sprint = task.sprint;
//     if (!sprint) return res.status(404).json({ message: "Sprint not found" });

//     // 2. Check if logged-in user is sprint creator
//     if (!sprint.creator || sprint.creator._id.toString() !== req.user._id.toString()) {
//       return res
//         .status(403)
//         .json({ message: "Only sprint creator can remove members from tasks" });
//     }

//     // 3. Remove the member from assignedMembers
//     task.assignedMembers = task.assignedMembers.filter(
//       (memberId) => memberId.toString() !== userId
//     );

//     await task.save();

//     res.json({ message: "Member removed from task", task });
//   } catch (err) {
//     console.error("❌ Error removing member from task:", err);
//     res.status(500).json({ message: err.message });
//   }
// };
// const removeMemberFromTask = async (req, res) => {
//   try {
//     const { taskId, userId } = req.params;

//     // 1. Find task with sprint + creator populated
//     const task = await Task.findById(taskId).populate({
//       path: "sprint",
//       populate: {
//         path: "creator",
//         select: "_id"
//       }
//     });

//     if (!task) return res.status(404).json({ message: "Task not found" });

//     const sprint = task.sprint;
//     if (!sprint) return res.status(404).json({ message: "Sprint not found" });

//     // 2. Check if logged-in user is sprint creator
//     if (!sprint.creator || sprint.creator._id.toString() !== req.user._id.toString()) {
//       return res
//         .status(403)
//         .json({ message: "Only sprint creator can remove members from tasks" });
//     }

//     // 3. Remove the member from assignedMembers
//     task.assignedMembers = task.assignedMembers.filter(
//       (memberId) => memberId && memberId.toString() !== userId
//     );

//     await task.save();

//     res.json({ message: "Member removed from task", task });
//   } catch (err) {
//     console.error("❌ Error removing member from task:", err);
//     res.status(500).json({ message: err.message });
//   }
// };
// Remove member from task
// const removeMemberFromTask = async (req, res) => {
//   try {
//     const { taskId, memberId } = req.params;

//     const task = await Task.findById(taskId);
//     if (!task) {
//       return res.status(404).json({ message: "Task not found" });
//     }

//     // Debugging log
//     console.log("Before removing:", task.assignedMembers);

//     // ✅ Make sure userId exists before calling .toString()
//     task.assignedMembers = task.assignedMembers.filter((m) => {
//       if (!m.userId) return true; // keep it if no userId (to avoid crash)
//       return m.userId.toString() !== memberId;
//     });

//     await task.save();

//     console.log("After removing:", task.assignedMembers);

//     res.json({ message: "Member removed successfully", task });
//   } catch (error) {
//     console.error("❌ Error removing member from task:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

const removeMemberFromTask = async (req, res) => {
  try {
    const { taskId, memberId } = req.params;

    // Find task and explicitly populate sprint with creator
    const task = await Task.findById(taskId)
      .populate({
        path: 'sprint',
        model: 'Sprint',
        select: 'creator members'
      });

    // Check if task exists
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const sprintRecord = await Sprint.findById(task.sprint);
    if (!sprintRecord) {
      return res.status(404).json({ message: 'Sprint not found' });
    }

    if (isSprintLocked(sprintRecord)) {
      return res.status(400).json({ message: 'Sprint has already ended' });
    }

    // Check if task has assigned members
    if (!task.assignedMembers || !Array.isArray(task.assignedMembers)) {
      return res.status(400).json({ message: 'No assigned members found' });
    }

    // Remove member from assignedMembers array
    task.assignedMembers = task.assignedMembers.filter(member => 
      member && member.toString() !== memberId
    );
    // Add these inside the try block after finding the task
console.log('Task found:', task);
console.log('Current assignedMembers:', task.assignedMembers);
console.log('MemberId to remove:', memberId);

    // Save the updated task
    await task.save();

    // Return the updated task after populating assignedMembers
    await task.populate('assignedMembers', 'username email');

    return res.status(200).json({
      message: 'Member removed successfully',
      task
    });

  } catch (error) {
    console.error('❌ Error removing member from task:', error);
    return res.status(500).json({ 
      message: 'Server error while removing member',
      error: error.message 
    });
  }
};


// Get all tasks assigned to a user in a sprint
const getUserTasksInSprint = async (req, res) => {
  try {
    const { sprintId, userId } = req.params;

    // find sprint
    const sprint = await Sprint.findById(sprintId).populate("members");
    if (!sprint) {
      return res.status(404).json({ message: "Sprint not found" });
    }

    // check if user is a member of sprint
    const isMember = sprint.members.some(
      (member) => member._id.toString() === userId
    );

    if (!isMember) {
      return res
        .status(403)
        .json({ message: "User is not a member of this sprint" });
    }

    // get tasks for that user in that sprint
    const tasks = await Task.find({
      sprint: sprintId,
      assignedMembers: userId,
    }).populate("assignedMembers", "name email");

    res.status(200).json({ tasks });
  } catch (error) {
    console.error("Error fetching user tasks:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/********** Comments Handling **********/
//get all comments for a task
const getAllComments = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId).populate(
      "comments.user",
      "username email"
    );
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json({ comments: task.comments });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Internal server error" });
  }
};
//add comment
// const addComment = async (req, res) => {
//   const { text } = req.body;
//   const userId = req.user.id;
//   const task = await Task.findById(req.params.taskId);
//   try {

//     if (!task) return res.status(404).json({ message: "Task not found" });

//     if (!text) {
//       return res.status(400).json({ message: "Comment text is required" });
//     }
//     const comment = {
//       user: userId,
//       text,
//       timestamp: new Date(),
//     };
//     task.comments.push(comment);
//     await task.save();

//     // populate user when sending back
//     await task.populate("comments.user", "username email");
//     res.status(201).json(comment);
//     // const updatedTask = await Task.findByIdAndUpdate(
//     //   req.params.id,
//     //   { $push: { comments: comment } },
//     //   { new: true }
//     // ).populate("comments.user", "username");
//     // if (!updatedTask) {
//     //   return res.status(404).json({ message: "Task not found" });
//     // }
//     // res.status(200).json({ task: updatedTask });
//   } catch (e) {
//     console.log(e);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };
const addComment = async (req, res) => {
  const { text } = req.body;
  const userId = req.user.id;

  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const sprint = await Sprint.findById(task.sprint);
    if (!sprint) {
      return res.status(404).json({ message: "Sprint not found" });
    }
    if (isSprintLocked(sprint)) {
      return res.status(400).json({ message: "Sprint has already ended" });
    }

    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const comment = {
      user: userId,
      text,
      timestamp: new Date(),
    };

    task.comments.push(comment);
    await task.save();

    // // populate only the new comment
    // const populatedComment = await Task.populate(comment, {
    //   path: "user",
    //   select: "username email",
    // });
    const savedTask = await task.save();
    const populatedTask = await savedTask.populate(
      "comments.user",
      "username email"
    );
    const populatedComment =
      populatedTask.comments[populatedTask.comments.length - 1];

    res.status(201).json(populatedComment);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Internal server error" });
  }
};

//edit comment
const editComment = async (req, res) => {
  try {
    const { text } = req.body;
    const task = await Task.findById(req.params.taskId);

    if (!task) return res.status(404).json({ message: "Task not found" });

    const sprint = await Sprint.findById(task.sprint);
    if (!sprint) {
      return res.status(404).json({ message: "Sprint not found" });
    }
    if (isSprintLocked(sprint)) {
      return res.status(400).json({ message: "Sprint has already ended" });
    }

    const comment = task.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    comment.text = text;
    await task.save();

    res.json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
//remove comment
const removeComment = async (req, res) => {
  // const { taskId, commentId } = req.params;
  // try {
  //   const updatedTask = await Task.findByIdAndUpdate(
  //     taskId,
  //     { $pull: { comments: { _id: commentId } } },
  //     { new: true }
  //   );
  //   if (!updatedTask) {
  //     return res.status(404).json({ message: "Task or comment not found" });
  //   }
  //   res.status(200).json({ task: updatedTask });
  // } catch (e) {
  //   console.log(e);
  //   res.status(500).json({ message: "Internal server error" });
  // }

  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) return res.status(404).json({ message: "Task not found" });

    const sprint = await Sprint.findById(task.sprint);
    if (!sprint) {
      return res.status(404).json({ message: "Sprint not found" });
    }
    if (isSprintLocked(sprint)) {
      return res.status(400).json({ message: "Sprint has already ended" });
    }

    const comment = task.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // ✅ Correct way: use deleteOne on subdocument
    await comment.deleteOne();

    await task.save();

    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createTask,
  updateTask,
  deleteTask,
  getAllTasks,
  changeTaskStatus,
  getAllComments,
  addComment,
  editComment,
  removeComment,
  assignMembersToTask,
  removeMemberFromTask,
  getUserTasksInSprint,
};
