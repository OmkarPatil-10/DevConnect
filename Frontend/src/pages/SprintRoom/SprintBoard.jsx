import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import TaskDetailsPopup from "@/components/SprintRoom/TaskDetailsPopUp"; // import popup component
import SprintSidebar from "@/components/SprintRoom/SprintSidebar";
import { toast, ToastContainer } from "react-toastify";
const hasSprintEnded = (sprint) => {
  if (!sprint) return false;
  if (sprint.isFinished) return true;
  if (sprint.isActive === false) return true;
  return false;
};

function SprintBoard() {
  const { sprintId } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const token = localStorage.getItem("token");
  const [menuOpenTaskId, setMenuOpenTaskId] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [selectedTask, setSelectedTask] = useState(null); // 👉 for popup
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 👉 decode userId from token (assuming JWT payload has userId)
  const currentUserId = token ? JSON.parse(atob(token.split(".")[1])).id : null;
  const [isSprintCreator, setIsSprintCreator] = useState(false);

  console.log("Current User ID:", currentUserId);
  console.log("Is Sprint Creator:", isSprintCreator);

  useEffect(() => {
    if (menuOpenTaskId === null) return;
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setMenuOpenTaskId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpenTaskId]);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/tasks/sprint/${sprintId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTasks(res.data.tasks);

      console.log("Fetched tasks:", res.data.tasks);
    } catch (err) {
      console.log("failed to fetch tasks", err);
    }
  };

  useEffect(() => {
    const fetchSprintMeta = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/sprint/${sprintId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const sprint = res.data.sprint;
        if (hasSprintEnded(sprint)) {
          toast.info("Sprint has ended. Redirecting to summary.");
          navigate(`/sprint/${sprintId}/end`);
          return;
        }
        const creatorId = sprint.creator?._id || sprint.creator;
        setIsSprintCreator(creatorId?.toString() === currentUserId);
      } catch (err) {
        console.error("Failed to fetch sprint info", err);
      }
    };
    if (sprintId) {
      fetchSprintMeta();
      fetchTasks();
    }
  }, [sprintId, token, currentUserId, navigate]);

  const statusMap = {
    todo: "To Do",
    inprogress: "In Progress",
    done: "Done",
  };

  const addTask = async (title, status) => {
    const newTask = {
      sprintId,
      title,
      status: statusMap[status],
    };
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/tasks/`,
        newTask,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = res.data;
      if (res.status === 201) {
        setTasks((prev) => [...prev, data.task]);
      } else {
        // alert(data.message || "Failed to create task");
        toast.error(data.message || "Failed to create task");
      }
    } catch (err) {
      console.error("Failed to create task", err);
    }
  };

  const getTasksByStatus = (status) => {
    const statusMap = {
      todo: "To Do",
      inprogress: "In Progress",
      done: "Done",
    };
    return tasks.filter((task) => task.status === statusMap[status]);
  };

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination || source.droppableId === destination.droppableId) return;

    const movedTask = tasks.find((task) => task._id === draggableId);
    const newStatus = statusMap[destination.droppableId];

    setTasks((prev) =>
      prev.map((task) =>
        task._id === draggableId ? { ...task, status: newStatus } : task
      )
    );

    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/tasks/${draggableId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      // alert("Failed to update task status");
      toast.error("Failed to update task status");
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col lg:flex-row relative overflow-hidden font-sans selection:bg-[#60A5FA] selection:dark:text-white text-gray-900 dark:selection:text-black">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#2563EB]/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[600px] h-[600px] bg-[#1E3A8A]/40 rounded-full blur-[120px]"></div>
      </div>

      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark" />
      {/* Mobile/Tablet Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Hidden on mobile/tablet, visible on desktop */}
      <div className={`fixed lg:relative left-0 top-0 bottom-0 h-full transform transition-transform duration-300 ease-in-out z-50 lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
        <SprintSidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full lg:w-auto relative z-10 overflow-hidden">
        {/* Header */}
        <div className="bg-transparent p-4 sm:p-6 lg:mb-6">
          <div className="flex items-center gap-3">
            {/* Mobile/Tablet Hamburger */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center dark:text-white text-gray-900 hover:bg-white/10 rounded-lg transition-colors z-50 relative border border-white/10"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {sidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold dark:bg-gradient-to-r dark:from-white dark:to-gray-400 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Sprint Board</h1>
            <button
              onClick={() => navigate("/dashboard")}
              className="ml-auto bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white px-4 py-2 rounded-lg hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all text-xs sm:text-sm lg:hidden font-medium"
            >
              Back
            </button>
          </div>
        </div>

        {/* Board Content */}
        <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-x-auto overflow-y-auto custom-scrollbar">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 min-w-max lg:min-w-0">
              {["todo", "inprogress", "done"].map((col) => (
                <Droppable droppableId={col} key={col}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="relative min-h-[500px] rounded-2xl flex flex-col group/col"
                    >
                      {/* Glassmorphism Background Layer - separate to avoid stacking context issues */}
                      <div className="absolute inset-0 dark:bg-[#1a1a1a]/40 bg-white/80 backdrop-blur-xl border border-[#2563EB]/20 rounded-2xl -z-10 shadow-[0_0_20px_rgba(0,0,0,0.2)]"></div>

                      {/* Header */}
                      <h2 className="text-xl dark:text-white text-gray-900 font-bold p-4 pb-2 flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${col === 'todo' ? 'bg-gray-400' : col === 'inprogress' ? 'bg-orange-400' : 'bg-green-500'}`}></span>
                        {statusMap[col]}
                        <span className="ml-auto text-xs font-normal dark:text-gray-400 text-gray-600 bg-white/5 px-2 py-1 rounded-full">{getTasksByStatus(col).length}</span>
                      </h2>

                      {/* Task List */}
                      <div className="flex-1 px-4 py-2 space-y-3">
                        {getTasksByStatus(col).map((task, index) => (
                          <Draggable
                            key={task._id}
                            draggableId={task._id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`dark:bg-[#1E3A8A]/80 bg-blue-50 backdrop-blur-md rounded-xl p-4 dark:text-white text-gray-900 relative cursor-pointer group border dark:border-white/5 border-[#2563EB]/20 dark:hover:border-[#2563EB]/50 hover:border-[#2563EB]/40 transition-all ${snapshot.isDragging ? 'shadow-[0_0_30px_rgba(37,99,235,0.4)] dark:shadow-[0_0_30px_rgba(37,99,235,0.8)] scale-105 z-[9999] ring-2 ring-[#60A5FA] dark:!bg-[#1E3A8A] !bg-blue-100' : 'hover:shadow-lg'}`}
                                onClick={() => setSelectedTask(task)}
                                style={{
                                  ...provided.draggableProps.style,
                                  left: snapshot.isDragging ? provided.draggableProps.style.left : undefined,
                                  top: snapshot.isDragging ? provided.draggableProps.style.top : undefined,
                                }}
                              >
                                {/* Task Title */}
                                <div className="mb-3">
                                  {editingTaskId === task._id ? (
                                    <div className="flex flex-col sm:flex-row gap-2">
                                      <input
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        className="dark:bg-gray-800 bg-gray-100 dark:text-white text-gray-900 px-3 py-1.5 rounded-lg border border-[#2563EB] flex-1 text-sm focus:outline-none"
                                        autoFocus
                                      />
                                      <button
                                        className="bg-green-500 text-white rounded-lg px-3 py-1 text-xs hover:bg-green-600 font-bold shadow-lg"
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          try {
                                            const res = await axios.put(
                                              `${import.meta.env.VITE_API_URL}/api/tasks/${task._id}`,
                                              { title: editTitle },
                                              {
                                                headers: {
                                                  Authorization: `Bearer ${token}`,
                                                },
                                              }
                                            );
                                            setTasks((prev) =>
                                              prev.map((t) =>
                                                t._id === task._id
                                                  ? {
                                                    ...t,
                                                    title: res.data.task.title,
                                                  }
                                                  : t
                                              )
                                            );
                                            setEditingTaskId(null);
                                          } catch (err) {
                                            toast.error("Failed to update task");
                                          }
                                        }}
                                      >
                                        Save
                                      </button>
                                      <button
                                        className="bg-gray-600 dark:text-white text-gray-900 rounded-lg px-3 py-1 text-xs hover:bg-gray-700 font-bold"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingTaskId(null);
                                        }}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <h3 className="font-medium text-base sm:text-lg break-words leading-snug group-hover:text-[#60A5FA] transition-colors">{task.title}</h3>
                                  )}
                                </div>

                                {/* Assigned Members */}
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="flex -space-x-2">
                                    {task.assignedMembers && task.assignedMembers.length > 0 ? (
                                      task.assignedMembers.slice(0, 3).map((member, idx) => (
                                        <div
                                          key={member._id || idx}
                                          className="w-7 h-7 bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] rounded-full flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-[#1E3A8A]"
                                          title={member.username}
                                        >
                                          {member.username?.charAt(0)?.toUpperCase()}
                                        </div>
                                      ))
                                    ) : (
                                      <div className="text-xs dark:text-gray-500 text-gray-500 italic px-2 py-1 dark:bg-white/5 bg-gray-200/50 rounded-md">Unassigned</div>
                                    )}
                                    {task.assignedMembers && task.assignedMembers.length > 3 && (
                                      <div className="w-7 h-7 dark:bg-gray-700 bg-gray-200 rounded-full flex items-center justify-center text-[10px] dark:text-white text-gray-900 ring-2 ring-[#1E3A8A]">
                                        +{task.assignedMembers.length - 3}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Menu button */}
                                <button
                                  className="absolute top-2 right-2 dark:text-gray-400 text-gray-600 hover:dark:text-white text-gray-900 p-1 rounded-full hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all font-bold"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMenuOpenTaskId(
                                      task._id === menuOpenTaskId ? null : task._id
                                    );
                                  }}
                                >
                                  ⋯
                                </button>
                                {menuOpenTaskId === task._id && (
                                  <div
                                    ref={dropdownRef}
                                    className="absolute top-8 right-2 dark:bg-[#1E3A8A] bg-white border border-[#2563EB]/50 dark:text-white text-gray-900 rounded-xl shadow-2xl z-20 min-w-[120px] overflow-hidden backdrop-blur-md"
                                  >
                                    <button
                                      className="block px-4 py-2 hover:bg-[#2563EB]/50 w-full text-left text-sm transition-colors"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingTaskId(task._id);
                                        setEditTitle(task.title);
                                        setMenuOpenTaskId(null);
                                      }}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      className="block px-4 py-2 hover:bg-red-500/20 text-red-400 w-full text-left text-sm transition-colors"
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        setMenuOpenTaskId(null);
                                        try {
                                          await axios.delete(
                                            `${import.meta.env.VITE_API_URL}/api/tasks/${task._id}`,
                                            {
                                              headers: {
                                                Authorization: `Bearer ${token}`,
                                              },
                                            }
                                          );
                                          setTasks((prev) =>
                                            prev.filter((t) => t._id !== task._id)
                                          );
                                        } catch (err) {
                                          toast.error("Failed to delete task");
                                        }
                                      }}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>

                      {/* Footer */}
                      <div className="p-4 pt-2 mt-auto border-t border-white/5">
                        <KanbanColumn onAddTask={addTask} status={col} />
                      </div>
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        </div>
      </div>

      {/* Popup for Task Details */}
      {selectedTask && (
        <TaskDetailsPopup
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          currentUserId={currentUserId}
          isSprintCreator={isSprintCreator}
          refreshSprint={fetchTasks}
        />
      )}
    </div>
  );
}

function KanbanColumn({ onAddTask, status }) {
  const [newTask, setNewTask] = useState("");
  const [showInput, setShowInput] = useState(false);

  return (
    <>
      {showInput ? (
        <div className="animate-fade-in-up">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full p-3 dark:bg-[#0a0a0a]/50 bg-gray-50 border border-[#2563EB] rounded-xl dark:text-white text-gray-900 mb-3 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#60A5FA]"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newTask.trim() !== "") {
                onAddTask(newTask, status);
                setNewTask("");
                setShowInput(false);
              }
            }}
          />
          <div className="flex gap-2">
            <button
              className="bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white rounded-lg px-4 py-2 text-sm font-bold shadow-lg hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all flex-1"
              onClick={() => {
                if (newTask.trim() !== "") {
                  onAddTask(newTask, status);
                  setNewTask("");
                  setShowInput(false);
                }
              }}
            >
              Add Card
            </button>
            <button
              className="bg-transparent border border-gray-600 dark:text-gray-300 text-gray-600 rounded-lg px-3 py-2 text-sm hover:bg-white/5 transition-colors"
              onClick={() => {
                setNewTask("");
                setShowInput(false);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          className="w-full dark:bg-white/5 bg-gray-100 hover:bg-gray-200 dark:hover:bg-white/10 border border-dashed border-gray-600 hover:border-[#2563EB] dark:text-gray-400 text-gray-600 hover:text-[#60A5FA] rounded-xl px-4 py-3 transition-all font-medium text-sm flex items-center justify-center gap-2 group"
          onClick={() => setShowInput(true)}
        >
          <span className="text-xl leading-none opacity-50 group-hover:opacity-100 transition-opacity">+</span> Add Task
        </button>
      )}
    </>
  );
}

export default SprintBoard;

