import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@/context/UserContext';
import { Link, useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import Navbar from '@/components/Navbar';

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = `${API_URL}/api`;

function Chat() {
  const { userData } = useUser();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showChatView, setShowChatView] = useState(false); // For mobile: controls whether to show chat or list
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const selectedConversationRef = useRef(null);
  const token = localStorage.getItem('token');

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Keep a ref in sync with the latest selectedConversation to avoid stale closures in socket handlers
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  // Initialize socket connection
  useEffect(() => {
    if (!userData) return;

    const newSocket = io(`${import.meta.env.VITE_API_URL}`, {
      auth: {
        token: token
      },
      transports: ['websocket'], // Force websocket to avoid Session ID unknown error on load balancers
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      // Fallback to polling if websocket fails (optional strategy, currently keeping forced websocket to avoid session issues)
    });

    newSocket.on('connect', () => {
      console.log('Connected to socket server for direct messages');
      newSocket.emit('authenticate', { token });
    });

    newSocket.on('authenticated', () => {
      console.log('Socket authenticated for direct messages');
      newSocket.emit('joinUserRoom', userData._id);
    });

    newSocket.on('authError', (error) => {
      console.error('Socket authentication failed:', error);
      setError('Authentication failed');
    });

    newSocket.on('newDirectMessage', (message) => {
      console.log('New direct message received:', message);

      const incomingConversationId = String(message.conversation);
      const currentSelected = selectedConversationRef.current;
      const selectedConversationId = currentSelected ? String(currentSelected._id) : null;

      const sameParticipantsAsSelected = (() => {
        if (!currentSelected) return false;
        const selectedIds = (currentSelected.participants || []).map(p => String(p._id || p));
        const incomingIds = [String(message.sender?._id || message.sender), String(message.recipient?._id || message.recipient)];
        return (
          selectedIds.includes(incomingIds[0]) && selectedIds.includes(incomingIds[1])
        );
      })();

      const isCurrentConversation = Boolean(
        (selectedConversationId && incomingConversationId === selectedConversationId) || sameParticipantsAsSelected
      );

      // Update messages if this is the current conversation
      if (isCurrentConversation) {
        setMessages(prev => [...prev, message]);
      }

      // Update conversations list
      setConversations(prev => {
        const updated = prev.map(conv => {
          if (String(conv._id) === incomingConversationId) {
            return {
              ...conv,
              lastMessage: message,
              lastMessageTime: message.timestamp
            };
          }
          return conv;
        });

        const exists = updated.some(conv => String(conv._id) === incomingConversationId);
        if (!exists) {
          // If conversation not in list yet, add a lightweight entry
          const lightweightConv = {
            _id: incomingConversationId,
            participants: [message.sender, message.recipient],
            lastMessage: message,
            lastMessageTime: message.timestamp
          };
          return [lightweightConv, ...updated];
        }

        return updated;
      });

      // Update unread count only if not currently viewing this conversation
      if (!isCurrentConversation) {
        setUnreadCount(prev => prev + 1);
      }
    });

    newSocket.on('directMessageSent', (message) => {
      console.log('Direct message sent:', message);
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('directMessageError', (error) => {
      console.error('Direct message error:', error);
      setError(error.error);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [userData, token]);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/direct-messages/conversations`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setConversations(res.data.conversations || []);

        // If there's a selected conversation from navigation state, set it
        if (location.state?.selectedConversation) {
          setSelectedConversation(location.state.selectedConversation);
          // On mobile, show chat view
          if (window.innerWidth < 768) {
            setShowChatView(true);
          }
        }
      } catch (err) {
        console.error('Error fetching conversations:', err);
        setError('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    if (userData) {
      fetchConversations();
    }
  }, [userData, token, location.state]);

  // Fetch unread count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await axios.get(`${API_BASE}/direct-messages/unread-count`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUnreadCount(res.data.unreadCount || 0);
      } catch (err) {
        console.error('Error fetching unread count:', err);
      }
    };

    if (userData) {
      fetchUnreadCount();
    }
  }, [userData, token]);

  // Fetch messages for selected conversation
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) return;

      try {
        setLoading(true);
        const res = await axios.get(
          `${API_BASE}/direct-messages/conversation/${selectedConversation._id}/messages`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(res.data.messages || []);

        // Mark messages as read
        await axios.put(
          `${API_BASE}/direct-messages/conversation/${selectedConversation._id}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - 1));

        // On mobile, show chat view when conversation is selected
        if (window.innerWidth < 768) {
          setShowChatView(true);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedConversation, token]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !selectedConversation) return;

    try {
      const otherUser = selectedConversation.participants.find(p => p._id !== userData._id);

      const messageData = {
        conversationId: selectedConversation._id,
        senderId: userData._id,
        recipientId: otherUser._id,
        text: newMessage.trim()
      };

      socket.emit('sendDirectMessage', messageData);
      setNewMessage('');
      setError(null);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Convert URL text into clickable links
  const linkify = (text) => {
    if (!text) return text;

    // Match URLs that start with http:// or https://
    const urlRegex = /(https?:\/\/[^\s]+)/;
    const splitRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(splitRegex);

    return parts.map((part, idx) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={`link-${idx}`}
            href={part}
            // target="_blank"
            rel="noopener noreferrer"
            className="underline text-[#60A5FA] hover:text-[#2563EB]"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  const getOtherUser = (conversation) => {
    return conversation.participants.find(p => p._id !== userData._id);
  };

  const filteredConversations = conversations.filter(conv => {
    const otherUser = getOtherUser(conv);
    return otherUser.username.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (!userData) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl mb-4">Please log in to access chat</h1>
          <Link to="/auth/login" className="text-[#2563EB] hover:underline">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    // On mobile, show chat view
    if (window.innerWidth < 768) {
      setShowChatView(true);
    }
  };

  const handleBackToList = () => {
    setShowChatView(false);
    setSelectedConversation(null);
  };

  return (
    <div className="h-screen mx-10 bg-background text-foreground flex flex-col overflow-hidden">
      {/* Navbar */}
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} userData={userData} />

      {/* Chat Content - below navbar */}
      <div className="flex flex-1 overflow-hidden pt-[60px] sm:pt-[73px]">
        {/* Left Sidebar - Conversations List */}
        <div className={`w-full md:w-1/3 border-r border-[#2563EB]/20 flex flex-col ${showChatView ? 'hidden md:flex' : 'flex'
          }`}>
          {/* Header */}
          <div className="p-3 sm:p-4 border-b border-[#2563EB]/20">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h1 className="text-xl sm:text-2xl font-bold">Messages</h1>
              {unreadCount > 0 && (
                <span className="bg-[#2563EB] text-white px-2 py-1 rounded-full text-xs sm:text-sm">
                  {unreadCount}
                </span>
              )}
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 dark:bg-gray-800 bg-gray-100/50 border dark:border-gray-700 border-gray-300/50 rounded-lg dark:text-white text-gray-900 placeholder-gray-400 focus:border-[#2563EB] focus:outline-none text-sm sm:text-base"
            />
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB]"></div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex items-center justify-center h-full dark:text-gray-400 text-gray-600">
                <div className="text-center">
                  <p className="text-lg">No conversations yet</p>
                  <p className="text-sm">Start chatting with your connections!</p>
                </div>
              </div>
            ) : (
              filteredConversations.map((conversation) => {
                const otherUser = getOtherUser(conversation);
                const isSelected = selectedConversation?._id === conversation._id;

                return (
                  <div
                    key={conversation._id}
                    onClick={() => handleConversationSelect(conversation)}
                    className={`p-3 sm:p-4 border-b dark:border-gray-800/50 border-gray-200/50 cursor-pointer dark:hover:bg-gray-800/30 hover:bg-gray-100/50 ${isSelected ? 'bg-[#2563EB]/20 border-l-4 border-l-[#2563EB]' : ''
                      }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#2563EB] rounded-full flex items-center justify-center text-base sm:text-lg font-semibold flex-shrink-0">
                        {otherUser.username?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold truncate text-sm sm:text-base">{otherUser.username}</h3>
                          <span className="text-xs dark:text-gray-400 text-gray-600 ml-2 flex-shrink-0">
                            {formatTime(conversation.lastMessageTime)}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm dark:text-gray-400 text-gray-600 truncate">
                          {conversation.lastMessage?.text || 'No messages yet'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side - Chat Area */}
        <div className={`flex-1 flex flex-col ${!showChatView ? 'hidden md:flex' : 'flex'}`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-3 sm:p-4 border-b border-[#2563EB]/20">
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Back Button - Mobile Only */}
                  <button
                    onClick={handleBackToList}
                    className="md:hidden w-8 h-8 flex items-center justify-center dark:text-white text-gray-700 dark:hover:bg-gray-800 hover:bg-gray-100 rounded-lg transition-colors mr-1"
                    aria-label="Back to conversations"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#2563EB] rounded-full flex items-center justify-center text-base sm:text-lg font-semibold flex-shrink-0">
                    {getOtherUser(selectedConversation).username?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-sm sm:text-base truncate">{getOtherUser(selectedConversation).username}</h2>
                    <p className="text-xs sm:text-sm dark:text-gray-400 text-gray-600">Online</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
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
                  messages.map((message) => {
                    const isOwnMessage = message.sender?._id === userData._id;

                    return (
                      <div
                        key={message._id}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[75%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-2xl ${isOwnMessage
                          ? 'bg-[#2563EB] text-white'
                          : 'dark:bg-gray-800 bg-gray-200 dark:text-gray-100 text-gray-900'
                          }`}>
                          <p className="whitespace-pre-wrap break-words text-sm sm:text-base">
                            {linkify(message.text)}
                          </p>
                          <p className={`text-xs mt-1 ${isOwnMessage ? 'text-white/70' : 'dark:text-gray-400 text-gray-500'
                            }`}>
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t border-[#2563EB]/20 p-3 sm:p-4">
                <form onSubmit={sendMessage} className="flex gap-2 sm:gap-3">
                  <div className="flex-1 relative">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="w-full p-2 sm:p-3 dark:bg-gray-800 bg-gray-100/50 border dark:border-gray-700 border-gray-300/50 rounded-xl dark:text-white text-gray-900 placeholder-gray-400 focus:border-[#2563EB] focus:outline-none resize-none text-sm sm:text-base"
                      rows="1"
                      style={{
                        minHeight: '40px',
                        maxHeight: '120px',
                        height: 'auto'
                      }}
                      onInput={(e) => {
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || !socket}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-[#2563EB] text-white rounded-xl hover:bg-[#2563EB]/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1 sm:gap-2 flex-shrink-0"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center dark:text-gray-400 text-gray-600 hidden md:flex">
              <div className="text-center">
                <h2 className="text-xl sm:text-2xl mb-3 sm:mb-4">Select a conversation</h2>
                <p className="text-sm sm:text-base">Choose a conversation from the sidebar to start chatting</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="absolute bottom-4 left-4 right-4 bg-red-900/20 border border-red-500/50 text-red-300 p-3 rounded-lg">
              {error}
              <button
                onClick={() => setError(null)}
                className="ml-2 text-red-300 hover:text-red-200"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;