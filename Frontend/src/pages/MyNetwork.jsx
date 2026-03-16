import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
function MyNetwork() {
  const [userData, setUserData] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('connections');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/check-auth`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setUserData(response.data.user);
          // Fetch pending requests, sent requests, and connections after getting user data
          fetchPendingRequests(response.data.user._id);
          fetchSentRequests(response.data.user._id);
          fetchConnections(response.data.user._id);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchUserData();
  }, [token]);

  const fetchPendingRequests = async (userId) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/match/requests/${userId}`);
      if (response.data.success) {
        setPendingRequests(response.data.requests);
      }
    } catch (err) {
      console.error('Error fetching pending requests:', err);
    }
  };

  const fetchSentRequests = async (userId) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/match/sent-requests/${userId}`);
      if (response.data.success) {
        setSentRequests(response.data.requests);
      }
    } catch (err) {
      console.error('Error fetching sent requests:', err);
    }
  };

  const fetchConnections = async (userId) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/match/connections/${userId}`);
      if (response.data.success) {
        setConnections(response.data.connections);
      }
    } catch (err) {
      console.error('Error fetching connections:', err);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/match/request/${requestId}/accept`, {
        userId: userData._id
      });
      if (response.data.success) {
        // Refresh all data
        fetchPendingRequests(userData._id);
        fetchSentRequests(userData._id);
        fetchConnections(userData._id);
      }
    } catch (err) {
      console.error('Error accepting request:', err);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/match/request/${requestId}/reject`, {
        userId: userData._id
      });
      if (response.data.success) {
        // Refresh all data
        fetchPendingRequests(userData._id);
        fetchSentRequests(userData._id);
        fetchConnections(userData._id);
      }
    } catch (err) {
      console.error('Error rejecting request:', err);
    }
  };

  const handleRemoveConnection = async (connectionId) => {
    try {
      const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/match/connection/${connectionId}`, {
        data: { userId: userData._id }
      });
      if (response.data.success) {
        // Refresh all data
        fetchPendingRequests(userData._id);
        fetchSentRequests(userData._id);
        fetchConnections(userData._id);
      }
    } catch (err) {
      console.error('Error removing connection:', err);
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/match/request/${requestId}`, {
        data: { userId: userData._id }
      });
      if (response.data.success) {
        // Refresh all data
        fetchPendingRequests(userData._id);
        fetchSentRequests(userData._id);
        fetchConnections(userData._id);
      }
    } catch (err) {
      console.error('Error canceling request:', err);
    }
  };

  const handleStartChat = async (otherUserId) => {
    try {
      // Create or get conversation with the user
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/direct-messages/conversation/${otherUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        // Navigate to chat page with conversation
        navigate('/chats', { state: { selectedConversation: response.data.conversation } });
      }
    } catch (err) {
      console.error('Error starting chat:', err);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('profileForm');
    localStorage.removeItem('profileStep');
    localStorage.removeItem('profilePhoto');
    window.location.href = '/auth/login';
  };

  if (loading) {
    return <div className="text-foreground bg-background h-screen flex-col items-center justify-center gap-4">
    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2563EB]"></div>
    <div className="text-foreground bg-background h-screen flex items-center justify-center  font-bold"> Loading...</div>
    </div>
    
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} userData={userData} />
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onSignOut={handleSignOut}
        isMobileOnly={true}
      />

      <div className="pt-[60px] sm:pt-[73px]">
        
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-[#2563EB] to-[#60A5FA] bg-clip-text text-transparent">My Network</h1>

            {/* Tab Navigation */}
            <div className="flex space-x-2 mb-8 sm:mb-10 dark:bg-white/5 bg-gray-100/80 backdrop-blur-md p-1.5 rounded-2xl border dark:border-white/10 border-gray-200 w-fit">
              <button
                onClick={() => setActiveTab('connections')}
                className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-bold transition-all text-sm sm:text-base whitespace-nowrap ${
                  activeTab === 'connections'
                    ? "bg-gradient-to-r from-[#2563EB] to-[#60A5FA] text-white shadow-lg shadow-purple-900/40"
                    : "dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 dark:hover:bg-white/10 hover:bg-gray-200/50"
                }`}
              >
                My Connections ({connections.length})
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-bold transition-all text-sm sm:text-base whitespace-nowrap ${
                  activeTab === 'pending'
                    ? "bg-gradient-to-r from-[#2563EB] to-[#60A5FA] text-white shadow-lg shadow-purple-900/40"
                    : "dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 dark:hover:bg-white/10 hover:bg-gray-200/50"
                }`}
              >
                Pending Requests ({pendingRequests.length + sentRequests.length})
              </button>
            </div>

        {/* Tab Content */}
        {activeTab === 'connections' && (
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">My Connections</h2>
            {connections.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 dark:bg-gray-800 bg-gray-100/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 dark:text-gray-400 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="dark:text-gray-400 text-gray-600 text-lg">No connections yet</p>
                <p className="text-gray-500 text-sm mt-2">Start connecting with other developers!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {connections.map(connection => (
                  <div key={connection.connectionId} className="group dark:bg-[#1a1a1a]/40 bg-white/80 backdrop-blur-xl border border-[#2563EB]/20 rounded-3xl p-6 hover:border-[#2563EB]/50 transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.15)] flex flex-col h-full relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-[#2563EB]/10 rounded-full blur-2xl -mr-16 -mt-16 transition-all group-hover:bg-[#2563EB]/20"></div>

                    <div className="flex items-center gap-3 sm:gap-4 mb-4 relative z-10">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#2563EB] rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 ring-2 ring-[#2563EB]/30">
                        {connection.profilePicture && connection.profilePicture !== 'data:image/jpeg;base64' ? (
                          <img 
                            src={connection.profilePicture.startsWith('data:') ? 
                                 connection.profilePicture : 
                                 `data:image/jpeg;base64,${connection.profilePicture}`} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error('Error loading profile picture:', e);
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="dark:text-white text-gray-900 text-lg sm:text-2xl font-semibold">
                            {connection.username?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link 
                          to={`/user/${connection._id}`}
                          className="text-base sm:text-lg font-bold dark:text-white text-gray-900 hover:text-[#60A5FA] transition-colors cursor-pointer block truncate"
                        >
                          {connection.username}
                        </Link>
                        <p className="text-xs sm:text-sm dark:text-gray-400 text-gray-600">
                          {connection.experienceYear} years experience
                        </p>
                      </div>
                    </div>
                    <div className="mb-4 relative z-10 flex-1">
                      <p className="text-xs sm:text-sm mb-2 dark:text-gray-300 text-gray-600">
                        <span className="text-[#2563EB] font-medium">Languages: </span>
                        {connection.preferredLanguages?.join(', ') || 'N/A'}
                      </p>
                      <p className="text-xs sm:text-sm dark:text-gray-300 text-gray-600">
                        <span className="text-[#2563EB] font-medium">Availability: </span>
                        {connection.availability || 'N/A'}
                      </p>
                    </div>
                    <div className="flex gap-2 relative z-10 mt-auto">
                      <button
                        onClick={() => handleStartChat(connection._id)}
                        className="flex-1 bg-[#2563EB] text-white py-2 rounded-xl hover:bg-[#3B82F6] transition-all text-xs sm:text-sm font-semibold shadow-lg"
                      >
                        Message
                      </button>
                      <button
                        onClick={() => handleRemoveConnection(connection.connectionId)}
                        className="flex-1 bg-white/5 border border-red-500/30 text-red-400 py-2 rounded-xl hover:bg-red-500/10 hover:border-red-500 transition-all text-xs sm:text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'pending' && (
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Pending Requests</h2>
            
            {/* Received Requests */}
            {pendingRequests.length > 0 && (
              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg font-medium dark:text-gray-300 text-gray-600 mb-3 sm:mb-4">Received Requests ({pendingRequests.length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {pendingRequests.map(request => (
                    <div key={request._id} className="group dark:bg-[#1a1a1a]/40 bg-white/80 backdrop-blur-xl border border-[#2563EB]/20 rounded-3xl p-6 hover:border-[#2563EB]/50 transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.15)] flex flex-col h-full relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-[#2563EB]/10 rounded-full blur-2xl -mr-16 -mt-16 transition-all group-hover:bg-[#2563EB]/20"></div>

                      <div className="flex items-center gap-3 sm:gap-4 mb-4 relative z-10">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#2563EB] rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 ring-2 ring-[#2563EB]/30">
                          {request.fromUser.profilePicture && request.fromUser.profilePicture !== 'data:image/jpeg;base64' ? (
                            <img 
                              src={request.fromUser.profilePicture.startsWith('data:') ? 
                                   request.fromUser.profilePicture : 
                                   `data:image/jpeg;base64,${request.fromUser.profilePicture}`} 
                              alt="Profile" 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error('Error loading profile picture:', e);
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className="dark:text-white text-gray-900 text-lg sm:text-2xl font-semibold">
                              {request.fromUser.username?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link 
                            to={`/user/${request.fromUser._id}`}
                            className="text-base sm:text-lg font-bold dark:text-white text-gray-900 hover:text-[#60A5FA] transition-colors cursor-pointer block truncate"
                          >
                            {request.fromUser.username}
                          </Link>
                          <p className="text-xs sm:text-sm dark:text-gray-400 text-gray-600">
                            {request.fromUser.experienceYear} years experience
                          </p>
                        </div>
                      </div>
                      <div className="mb-4 relative z-10 flex-1">
                        <p className="text-xs sm:text-sm mb-2 dark:text-gray-300 text-gray-600">
                          <span className="text-[#2563EB] font-medium">Languages: </span>
                          {request.fromUser.preferredLanguages?.join(', ') || 'N/A'}
                        </p>
                        <p className="text-xs sm:text-sm dark:text-gray-300 text-gray-600">
                          <span className="text-[#2563EB] font-medium">Availability: </span>
                          {request.fromUser.availability || 'N/A'}
                        </p>
                      </div>
                      <div className="flex gap-2 relative z-10 mt-auto">
                        <button
                          onClick={() => handleAcceptRequest(request._id)}
                          className="flex-1 bg-[#2563EB] text-white py-2 rounded-xl hover:bg-[#3B82F6] transition-all text-xs sm:text-sm font-semibold shadow-lg"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request._id)}
                          className="flex-1 bg-white/5 border border-gray-600/30 dark:text-gray-400 text-gray-600 py-2 rounded-xl hover:bg-gray-700/50 hover:dark:text-white text-gray-900 transition-all text-xs sm:text-sm font-medium"
                        >
                          Ignore
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sent Requests */}
            {sentRequests.length > 0 && (
              <div>
                <h3 className="text-base sm:text-lg font-medium dark:text-gray-300 text-gray-600 mb-3 sm:mb-4">Sent Requests ({sentRequests.length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {sentRequests.map(request => (
                    <div key={request._id} className="group dark:bg-[#1a1a1a]/40 bg-white/80 backdrop-blur-xl border border-[#2563EB]/20 rounded-3xl p-6 hover:border-[#2563EB]/50 transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.15)] flex flex-col h-full relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-[#2563EB]/10 rounded-full blur-2xl -mr-16 -mt-16 transition-all group-hover:bg-[#2563EB]/20"></div>

                      <div className="flex items-center gap-3 sm:gap-4 mb-4 relative z-10">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#2563EB] rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 ring-2 ring-[#2563EB]/30">
                          {request.toUser.profilePicture && request.toUser.profilePicture !== 'data:image/jpeg;base64' ? (
                            <img 
                              src={request.toUser.profilePicture.startsWith('data:') ? 
                                   request.toUser.profilePicture : 
                                   `data:image/jpeg;base64,${request.toUser.profilePicture}`} 
                              alt="Profile" 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error('Error loading profile picture:', e);
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className="dark:text-white text-gray-900 text-lg sm:text-2xl font-semibold">
                              {request.toUser.username?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link 
                            to={`/user/${request.toUser._id}`}
                            className="text-base sm:text-lg font-bold dark:text-white text-gray-900 hover:text-[#60A5FA] transition-colors cursor-pointer block truncate"
                          >
                            {request.toUser.username}
                          </Link>
                          <p className="text-xs sm:text-sm dark:text-gray-400 text-gray-600">
                            {request.toUser.experienceYear} years experience
                          </p>
                        </div>
                      </div>
                      <div className="mb-4 relative z-10 flex-1">
                        <p className="text-xs sm:text-sm mb-2 dark:text-gray-300 text-gray-600">
                          <span className="text-[#2563EB] font-medium">Languages: </span>
                          {request.toUser.preferredLanguages?.join(', ') || 'N/A'}
                        </p>
                        <p className="text-xs sm:text-sm dark:text-gray-300 text-gray-600">
                          <span className="text-[#2563EB] font-medium">Availability: </span>
                          {request.toUser.availability || 'N/A'}
                        </p>
                      </div>
                      <div className="flex gap-2 relative z-10 mt-auto">
                        <button
                          onClick={() => handleCancelRequest(request._id)}
                          className="flex-1 bg-white/5 border border-red-500/30 text-red-400 py-2 rounded-xl hover:bg-red-500/10 hover:border-red-500 transition-all text-xs sm:text-sm font-medium"
                        >
                          Cancel Request
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No requests message */}
            {pendingRequests.length === 0 && sentRequests.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 dark:bg-gray-800 bg-gray-100/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 dark:text-gray-400 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="dark:text-gray-400 text-gray-600 text-lg">No pending requests</p>
                <p className="text-gray-500 text-sm mt-2">All caught up!</p>
              </div>
            )}
          </div>
        )}
      </div>
        </main>
      </div>
    </div>
  );
}

export default MyNetwork;
