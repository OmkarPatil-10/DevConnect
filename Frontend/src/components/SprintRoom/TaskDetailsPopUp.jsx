import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = `${API_URL}/api`;

const TaskDetailsPopup = ({
  task,
  onClose,
  currentUserId,
  isSprintCreator,
  refreshSprint,
}) => {
  const [description, setDescription] = useState(task.description || "");
  const [isEditing, setIsEditing] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [taskData, setTaskData] = useState(task);
  const [sprintMembers, setSprintMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  // Fetch sprint members for assignment dropdown
  useEffect(() => {
    const fetchSprintMembers = async () => {
      // Safely access sprint ID
      const sprintId = task.sprint?._id || task.sprint;
      
      if (!sprintId) {
        console.warn("No sprint ID found in task data:", task);
        return;
      }

      try {
        setLoading(true);
        const res = await axios.get(
          `${API_BASE}/sprint/${sprintId}/members`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSprintMembers(res.data.members);
      } catch (err) {
        console.error("Error fetching sprint members:", err);
        setError("Failed to load sprint members");
      } finally {
        setLoading(false);
      }
    };
    
    // Only fetch if we have a sprint ID
    if (task.sprint) {
      fetchSprintMembers();
    }
  }, [task.sprint, token]);

  // Add new comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      setLoading(true);
      const res = await axios.post(
        `${API_BASE}/tasks/${task._id}/comments`,
        { text: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update UI instantly
      setTaskData((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), res.data],
      }));
      
      setNewComment("");
      refreshSprint();
    } catch (err) {
      console.error("Error adding comment:", err);
      setError("Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  // Delete comment (only own comments)
  const handleDeleteComment = async (commentId) => {
    try {
      setLoading(true);
      await axios.delete(
        `${API_BASE}/tasks/${task._id}/comments/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update UI instantly
      setTaskData((prev) => ({
        ...prev,
        comments: (prev.comments || []).filter((comment) => comment._id !== commentId),
      }));
      
      refreshSprint();
    } catch (err) {
      console.error("Error deleting comment:", err);
      setError("Failed to delete comment");
    } finally {
      setLoading(false);
    }
  };

  // Assign members to task (only sprint creator)
  const handleAssignMembers = async () => {
    if (selectedMembers.length === 0) return;
    
    try {
      setLoading(true);
      const res = await axios.post(
        `${API_BASE}/tasks/${task._id}/assign`,
        { members: selectedMembers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setTaskData(res.data.task);
      setSelectedMembers([]);
      refreshSprint();
    } catch (err) {
      console.error("Error assigning members:", err);
      setError("Failed to assign members");
    } finally {
      setLoading(false);
    }
  };

  // Remove member from task (only sprint creator)
  const handleRemoveMember = async (memberId) => {
    try {
      setLoading(true);
      const apiUrl = `${API_BASE}/tasks/${task._id}/assign/${memberId}`;
      
      console.log("Removing member:", memberId);
      console.log("API URL:", apiUrl);
      console.log("Current assigned members:", taskData.assignedMembers);
      
      const res = await axios.delete(apiUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("Remove member response:", res.data);
      
      // Update the task data with the response from server
      if (res.data.task) {
        setTaskData(res.data.task);
      } else {
        // Fallback: manually update the state
        setTaskData(prev => ({
          ...prev,
          assignedMembers: prev.assignedMembers.filter(member => member._id !== memberId)
        }));
      }
      
      // Refresh the sprint to get latest data
      refreshSprint();
      
    } catch (err) {
      console.error("Error removing member:", err);
      console.error("Error response:", err.response?.data);
      setError(`Failed to remove member: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Save description
  const handleSaveDescription = async () => {
    try {
      setLoading(true);
      await axios.put(
        `${API_BASE}/tasks/${task._id}`,
        { description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setIsEditing(false);
      refreshSprint();
    } catch (err) {
      console.error("Error updating description:", err);
      setError("Failed to update description");
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key for comments
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center dark:bg-black/50 bg-gray-900/50 backdrop-blur-sm z-50 p-4">
      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="dark:bg-gradient-to-br dark:from-[#1a1a1a] dark:to-[#2d1b3d] bg-white dark:text-white text-gray-900 rounded-2xl shadow-2xl border border-[#2563EB]/20">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#2563EB]/20">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-[#2563EB] rounded-full"></div>
              <h2 className="text-2xl font-bold">Task Details</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full dark:bg-gray-700 bg-gray-200 dark:hover:bg-gray-600 hover:bg-gray-300 text-gray-900 dark:text-white transition-colors"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Task Details */}
              <div className="space-y-6">
                {/* Task Title */}
                <div className="dark:bg-black/40 bg-gray-50 p-4 rounded-xl border border-[#2563EB]/20">
                  <h3 className="text-lg font-semibold text-[#2563EB] mb-2">Task Title</h3>
                  <p className="dark:text-white text-gray-900 text-xl">{task.title}</p>
                </div>

                {/* Assigned Members */}
                <div className="dark:bg-black/40 bg-gray-50 p-4 rounded-xl border border-[#2563EB]/20">
                  <h3 className="text-lg font-semibold text-[#2563EB] mb-3">Assigned Members</h3>
                  
                  {/* Current Members */}
                  <div className="space-y-2 mb-4">
                    {taskData.assignedMembers?.length > 0 ? (
                      taskData.assignedMembers.map((member) => (
                        <div
                          key={member._id}
                          className="flex items-center justify-between dark:bg-gray-800 bg-gray-100/50 p-3 rounded-lg border dark:border-gray-700 border-gray-300/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#2563EB] rounded-full flex items-center justify-center text-sm font-semibold">
                              {member.username?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium">{member.username}</p>
                              <p className="text-sm dark:text-gray-400 text-gray-600">{member.email}</p>
                            </div>
                          </div>
                          {isSprintCreator && (
                            <button
                              onClick={() => handleRemoveMember(member._id)}
                              className="text-red-400 hover:text-red-300 p-1 rounded transition-colors"
                              title="Remove member"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="dark:text-gray-400 text-gray-600 italic">No members assigned</p>
                    )}
                  </div>

                  {/* Assign New Members (Sprint Creator Only) */}
                  {isSprintCreator && (
                    <div className="border-t dark:border-gray-700 border-gray-300/50 pt-4">
                      <label className="block text-sm font-medium dark:text-gray-300 text-gray-600 mb-2">
                        Assign new members:
                      </label>
                      <select
                        multiple
                        className="w-full p-3 dark:bg-gray-800 bg-gray-100/50 border dark:border-gray-700 border-gray-300/50 rounded-lg dark:text-white text-gray-900 focus:border-[#2563EB] focus:outline-none"
                        value={selectedMembers}
                        onChange={(e) =>
                          setSelectedMembers(
                            Array.from(e.target.selectedOptions, (opt) => opt.value)
                          )
                        }
                        size="4"
                      >
                        {sprintMembers
                          .filter(member => 
                            !taskData.assignedMembers?.some(assigned => assigned._id === member._id)
                          )
                          .map((member) => (
                            <option key={member._id} value={member._id}>
                              {member.username} ({member.email})
                            </option>
                          ))}
                      </select>
                      <button
                        onClick={handleAssignMembers}
                        disabled={selectedMembers.length === 0 || loading}
                        className="mt-3 px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#2563EB]/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {loading ? "Assigning..." : "Assign Members"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="dark:bg-black/40 bg-gray-50 p-4 rounded-xl border border-[#2563EB]/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-[#2563EB]">Description</h3>
                      {!isSprintCreator && (
                        <span className="bg-yellow-900/20 border border-yellow-500/50 text-yellow-300 px-2 py-0.5 rounded text-xs select-none">
                          Read-only
                        </span>
                      )}
                    </div>
                    {/* Only show edit button to sprint creator */}
                    {isSprintCreator && (
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="text-sm text-[#2563EB] hover:text-[#2563EB]/80 transition-colors"
                      >
                        {isEditing ? "Cancel" : "Edit"}
                      </button>
                    )}
                  </div>
                  
                  {isEditing ? (
                    <div className="space-y-3">
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-3 dark:bg-gray-800 bg-gray-100/50 border dark:border-gray-700 border-gray-300/50 rounded-lg dark:text-white text-gray-900 focus:border-[#2563EB] focus:outline-none resize-none"
                        rows="4"
                        placeholder="Enter task description..."
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveDescription}
                          disabled={loading}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          {loading ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 bg-gray-600 dark:text-white text-gray-900 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <p className="dark:text-gray-300 text-gray-600 whitespace-pre-wrap">
                        {description || "No description provided"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Comments */}
              <div className="dark:bg-black/40 bg-gray-50 p-4 rounded-xl border border-[#2563EB]/20">
                <h3 className="text-lg font-semibold text-[#2563EB] mb-4">Comments</h3>
                
                {/* Comments List */}
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-2">
                  {taskData.comments?.length > 0 ? (
                    taskData.comments.map((comment) => (
                      <div
                        key={comment._id}
                        className="dark:bg-gray-800 bg-gray-100/50 p-3 rounded-lg border dark:border-gray-700 border-gray-300/50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-6 h-6 bg-[#2563EB] rounded-full flex items-center justify-center text-xs font-semibold">
                                {comment.user?.username?.charAt(0)?.toUpperCase()}
                              </div>
                              <span className="font-medium text-sm">
                                {comment.user?.username || "Unknown"}
                              </span>
                              <span className="text-xs dark:text-gray-400 text-gray-600">
                                {new Date(comment.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="dark:text-gray-300 text-gray-600 text-sm">{comment.text}</p>
                          </div>
                          {comment.user?._id === currentUserId && (
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="text-red-400 hover:text-red-300 p-1 rounded transition-colors"
                              title="Delete comment"
                            >
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="dark:text-gray-400 text-gray-600 italic text-center py-4">No comments yet</p>
                  )}
                </div>

                {/* Add Comment */}
                <div className="border-t dark:border-gray-700 border-gray-300/50 pt-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Add a comment..."
                      className="flex-1 p-3 dark:bg-gray-800 bg-gray-100/50 border dark:border-gray-700 border-gray-300/50 rounded-lg dark:text-white text-gray-900 focus:border-[#2563EB] focus:outline-none"
                      disabled={loading}
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || loading}
                      className="px-4 py-3 bg-[#2563EB] text-white rounded-lg hover:bg-[#2563EB]/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? "..." : "Send"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="absolute top-4 left-4 right-4 dark:bg-red-900/20 bg-red-100 border dark:border-red-500/50 border-red-300 dark:text-red-300 text-red-700 p-3 rounded-lg">
              {error}
              <button
                onClick={() => setError(null)}
                className="ml-2 dark:text-red-300 text-red-700 dark:hover:text-red-200 hover:text-red-800"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsPopup;