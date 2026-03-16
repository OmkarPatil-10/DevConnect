import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { useUser } from "@/context/UserContext";
import io from "socket.io-client";
import axios from "axios";
import SprintSidebar from "@/components/SprintRoom/SprintSidebar";

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

const hasSprintEnded = (sprint) => {
  if (!sprint) return false;
  if (sprint.isFinished) return true;
  if (sprint.isActive === false) return true;
  return false;
};

function SprintChat() {
  const { sprintId } = useParams();
  const navigate = useNavigate();
  const { userData } = useUser();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sprintMembers, setSprintMembers] = useState([]);
  const [isSprintEnded, setIsSprintEnded] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [socket, setSocket] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const token = localStorage.getItem("token");

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize socket connection
  useEffect(() => {
    if (!userData || !sprintId) return;

    const newSocket = io(`${import.meta.env.VITE_API_URL}`, {
      auth: {
        token: token,
      },
    });

    newSocket.on("connect", () => {
      console.log("Connected to socket server");
      // Authenticate first
      newSocket.emit("authenticate", { token });
    });

    newSocket.on("authenticated", () => {
      console.log("Socket authenticated");
      // Join the sprint room after authentication
      newSocket.emit("joinSprint", sprintId);
    });

    newSocket.on("authError", (error) => {
      console.error("Socket authentication failed:", error);
      setError("Authentication failed");
    });

    newSocket.on("newMessage", (message) => {
      console.log("New message received:", message);
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on("messageError", (error) => {
      console.error("Message error:", error);
      setError(error.error);
    });

    newSocket.on("userJoined", (data) => {
      console.log("User joined:", data);
      setOnlineUsers((prev) => new Set([...prev, data.userId]));
    });

    newSocket.on("userLeft", (data) => {
      console.log("User left:", data);
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [userData, sprintId, token]);

  useEffect(() => {
    const fetchSprintInfo = async () => {
      try {
        const res = await axios.get(`${API_BASE}/sprint/${sprintId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSprintMembers(res.data.sprint.teamMembers || []);
        const sprint = res.data.sprint;
        if (hasSprintEnded(sprint)) {
          toast.info("Sprint has ended. Redirecting to summary.");
          navigate(`/sprint/${sprintId}/end`);
          return;
        }
        setIsSprintEnded(false);
      } catch (err) {
        console.error("Error fetching sprint info:", err);
      }
    };

    if (sprintId) {
      fetchSprintInfo();
    }
  }, [sprintId, token]);

  // Fetch existing messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/message/sprint/${sprintId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Failed to load messages");
      } finally {
        setLoading(false);
      }
    };

    if (sprintId) {
      fetchMessages();
    }
  }, [sprintId, token]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !userData) return;
    if (isSprintEnded) {
      setError("Sprint has ended. Chat is read-only.");
      return;
    }

    try {
      const messageData = {
        sprintId: sprintId,
        senderId: userData._id,
        text: newMessage.trim(),
      };

      // Emit the message through socket
      socket.emit("sendMessage", messageData);

      // Clear the input
      setNewMessage("");
      setError(null);
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  return (
    <div className="h-screen bg-background text-foreground flex flex-col lg:flex-row overflow-hidden">
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
        theme="dark"
      />
      {/* Mobile/Tablet Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Hidden on mobile/tablet, visible on desktop */}
      <div
        className={`fixed lg:relative left-0 top-0 bottom-0 transform transition-transform duration-300 ease-in-out z-50 lg:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <SprintSidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full lg:w-auto">
        {/* Header */}
        <div className="dark:bg-[#1E3A8A] bg-blue-50 border-b border-[#2563EB]/20 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Mobile/Tablet Hamburger */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden w-10 h-10 flex items-center justify-center dark:text-white text-gray-900 hover:dark:bg-gray-800 bg-gray-100 rounded-lg transition-colors flex-shrink-0 z-50 relative"
                aria-label="Toggle menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {sidebarOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold dark:text-white text-gray-900">Sprint Chat</h1>

                <p className="dark:text-gray-400 text-gray-600 text-xs sm:text-sm">
                  {sprintMembers.length} members • {onlineUsers.size} online
                </p>
              </div>
              {/* Mobile/Tablet Back Button */}
              <button
                onClick={() => navigate("/dashboard")}
                className="ml-auto bg-[#2563EB] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-[#3B82F6] transition-colors text-xs sm:text-sm md:ml-[29rem] lg:hidden"
              >
                Back
              </button>
            </div>

            {/* Online Members */}
            {/* <div className="flex items-center gap-2 ">
              <span className="text-xs sm:text-sm dark:text-gray-400 text-gray-600">Online:</span>
              <div className="flex gap-1">
                {sprintMembers
                  .filter(member => isUserOnline(member._id))
                  .slice(0, 5)
                  .map(member => (
                    <div
                      key={member._id}
                      className="w-7 h-7 sm:w-8 sm:h-8 bg-[#2563EB] rounded-full flex items-center justify-center text-xs font-semibold relative"
                      title={member.username}
                    >
                      {member.username?.charAt(0)?.toUpperCase()}
                      <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-[#1E3A8A]"></div>
                    </div>
                  ))}
                {sprintMembers.filter(member => isUserOnline(member._id)).length > 5 && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-600 rounded-full flex items-center justify-center text-xs">
                    +{sprintMembers.filter(member => isUserOnline(member._id)).length - 5}
                  </div>
                )}
              </div>
            </div> */}
          </div>
          {isSprintEnded && (
            <div className="mt-3 sm:mt-4 rounded-lg sm:rounded-xl border border-yellow-500/40 bg-yellow-500/10 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-yellow-100">
              This sprint has ended. Messages are read-only.
            </div>
          )}
        </div>

        {/* Messages Container */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB]"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full dark:text-gray-400 text-gray-600">
                <div className="text-center">
                  <p className="text-base sm:text-lg">No messages yet</p>
                  <p className="text-xs sm:text-sm">Start the conversation!</p>
                </div>
              </div>
            ) : (
              messages.map((message, index) => {
                const isOwnMessage = message.sender?._id === userData?._id;
                const showAvatar =
                  index === 0 ||
                  messages[index - 1].sender?._id !== message.sender?._id;
                const isUserCurrentlyOnline = isUserOnline(message.sender?._id);

                return (
                  <div
                    key={message._id}
                    className={`flex gap-2 sm:gap-3 ${
                      isOwnMessage ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* Avatar */}
                    {showAvatar ? (
                      <div className="relative flex-shrink-0">
                        <div
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold text-white ${
                            isOwnMessage ? "bg-[#2563EB]" : "dark:bg-gray-600 bg-gray-400"
                          }`}
                        >
                          {message.sender?.username?.charAt(0)?.toUpperCase()}
                        </div>
                        {isUserCurrentlyOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-black"></div>
                        )}
                      </div>
                    ) : (
                      <div className="w-8 sm:w-10"></div>
                    )}

                    {/* Message Content */}
                    <div
                      className={`flex flex-col max-w-[75%] sm:max-w-xs lg:max-w-md ${
                        isOwnMessage ? "items-end" : "items-start"
                      }`}
                    >
                      {showAvatar && (
                        <div
                          className={`flex items-center gap-2 mb-1 ${
                            isOwnMessage ? "flex-row-reverse" : "flex-row"
                          }`}
                        >
                          <span className="text-xs sm:text-sm font-medium">
                            {message.sender?.username}
                          </span>
                          <span className="text-xs dark:text-gray-400 text-gray-600">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                      )}

                      <div
                        className={`px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl text-sm sm:text-base ${
                          isOwnMessage
                            ? "bg-[#2563EB] text-white"
                            : "dark:bg-gray-800 bg-gray-200 dark:text-gray-100 text-gray-800"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">
                          {message.text}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-4 mb-2 p-3 dark:bg-red-900/20 bg-red-100 border dark:border-red-500/50 border-red-300 dark:text-red-300 text-red-700 rounded-lg">
              {error}
              <button
                onClick={() => setError(null)}
                className="ml-2 text-red-300 hover:text-red-200"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          )}

          {/* Message Input */}
          <div className="border-t border-[#2563EB]/20 p-3 sm:p-4">
            <form onSubmit={sendMessage} className="flex gap-2 sm:gap-3">
              <div className="flex-1 relative">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    isSprintEnded ? "Sprint has ended" : "Type a message..."
                  }
                  className="w-full p-2 sm:p-3 dark:bg-gray-800 bg-gray-100/50 border dark:border-gray-700 border-gray-300/50 rounded-lg sm:rounded-xl dark:text-white text-gray-900 placeholder-gray-400 focus:border-[#2563EB] focus:outline-none resize-none text-sm sm:text-base"
                  rows="1"
                  disabled={isSprintEnded}
                  style={{
                    minHeight: "40px",
                    maxHeight: "120px",
                    height: "auto",
                  }}
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height =
                      Math.min(e.target.scrollHeight, 120) + "px";
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={!newMessage.trim() || !socket || isSprintEnded}
                className="px-6 py-3 bg-[#2563EB] text-white rounded-xl hover:bg-[#2563EB]/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
                Send
              </button>
            </form>
            <p className="text-xs dark:text-gray-400 text-gray-600 mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SprintChat;
