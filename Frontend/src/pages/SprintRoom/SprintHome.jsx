import axios from "axios";
import React, { useEffect } from "react";
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import SprintSidebar from "@/components/SprintRoom/SprintSidebar";
import { toast, ToastContainer } from "react-toastify";
const hasSprintEnded = (sprint) => {
  if (!sprint) return false;
  if (sprint.isFinished) return true;
  if (sprint.isActive === false) return true;
  return false;
};

function SprintHome() {
  const [sprintInfo, setSprintInfo] = useState();
  const [requests, setRequests] = useState([]);
  const [resources, setResources] = useState([]);
  const [isEditingResources, setIsEditingResources] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editResources, setEditResources] = useState({
    github: "",
    figma: "",
    docs: "",
    extraLinks: [""],
  });
  const token = localStorage.getItem("token");
  const { sprintId } = useParams();
  const navigate = useNavigate();
  const { userData } = useUser(); // Get current user data

  // Check if current user is the sprint owner
  const isOwner =
    userData?._id &&
    (sprintInfo?.creator?._id || sprintInfo?.creator)?.toString() ===
    userData._id.toString();

  console.log("User ID:", userData?._id);
  console.log("Sprint Creator ID:", sprintInfo?.creator);
  console.log("Sprint Info:", sprintInfo);
  console.log("Is Owner:", isOwner);
  console.log(sprintId);

  useEffect(() => {
    fetchSprintData();
  }, [sprintId, navigate]);

  // Fetch requests when sprintInfo is loaded and user is owner
  useEffect(() => {
    if (sprintInfo && isOwner) {
      fetchJoinRequests();
    }
  }, [sprintInfo, isOwner]);

  const fetchSprintData = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/sprint/${sprintId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(res.data.sprint);
      setSprintInfo(res.data.sprint);
      if (hasSprintEnded(res.data.sprint)) {
        toast.info("Sprint has ended. Redirecting to summary.");
        navigate(`/sprint/${sprintId}/end`);
      }
    } catch (err) {
      console.error("Failed to fetch sprint data", err);
    }
  };

  const fetchJoinRequests = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/sprint/${sprintId}/join-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Join requests:", res.data.joinRequests);
      setRequests(res.data.joinRequests || []);

    } catch (e) {
      console.log("Error fetching join requests", e);
    }
  }

  const handleJoinRequest = async (requestId, status) => {
    try {
      const res = await axios.patch(`${import.meta.env.VITE_API_URL}/api/sprint/${sprintId}/handle-request`, { requestId, status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // alert(res.data.message);
      toast.success(res.data.message);
      // Refresh requests list immediately after handling
      fetchJoinRequests();
    } catch (e) {
      console.log("Error handling join request", e);
    }
  }

  // console.log(sprintInfo);
  console.log(requests);

  // Calculate countdown timer
  const getCountdownTimer = () => {
    if (!sprintInfo?.endDate) return "N/A";
    const endDate = new Date(sprintInfo.endDate);
    const now = new Date();
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days Left` : "Sprint Ended";
  };

  return (
    <div className="h-screen bg-background flex flex-col lg:flex-row relative overflow-hidden font-sans selection:bg-[#60A5FA] selection:dark:text-white text-gray-900 dark:selection:text-black">
      {/* Background decoration - matching Landing Page */}
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
      <div className="flex-1 p-4 sm:p-6 w-full lg:w-auto relative z-10 overflow-y-auto custom-scrollbar">
        {/* Mobile/Tablet Header with Hamburger */}
        <div className="lg:hidden mb-6 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-10 h-10 flex items-center justify-center dark:text-white text-gray-900 hover:bg-white/10 rounded-lg transition-colors z-50 relative border border-white/10"
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
          <h1 className="text-xl font-bold dark:bg-gradient-to-r dark:from-white dark:to-gray-400 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Sprint Home</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="ml-auto bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white px-4 py-2 rounded-lg hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all text-xs sm:text-sm lg:hidden font-medium"
          >
            Back
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Sprint Info Card */}
          <div className="dark:bg-[#1a1a1a]/40 bg-white/80 backdrop-blur-xl border border-[#2563EB]/20 rounded-2xl p-4 sm:p-6 col-span-1 shadow-[0_0_20px_rgba(0,0,0,0.2)] hover:border-[#2563EB]/40 transition-colors">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-3">
              <h2 className="text-xl sm:text-2xl font-bold dark:bg-gradient-to-r dark:from-white dark:to-gray-300 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Sprint Info</h2>
              <button 
                onClick={() => {
                  const url = `${window.location.origin}/join-sprint?sprintId=${sprintId}`;
                  navigator.clipboard.writeText(url);
                  toast.success("Invite link copied to clipboard!");
                }}
                className="bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white px-4 py-2 rounded-lg hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all text-sm sm:text-base w-full sm:w-auto font-medium"
              >
                Copy Invite Link
              </button>
            </div>
            {sprintInfo && (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 dark:bg-white/5 bg-gray-100/50 rounded-xl border dark:border-white/5 border-gray-200/50">
                  <span className="dark:text-gray-400 text-gray-600 text-sm sm:text-base">Duration:</span>
                  <span className="dark:text-white text-gray-900 font-medium text-sm sm:text-base">{sprintInfo.duration || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center p-3 dark:bg-white/5 bg-gray-100/50 rounded-xl border dark:border-white/5 border-gray-200/50">
                  <span className="dark:text-gray-400 text-gray-600 text-sm sm:text-base">Start Date:</span>
                  <span className="dark:text-white text-gray-900 font-medium text-sm sm:text-base">
                    {sprintInfo.startDate ? new Date(sprintInfo.startDate).toLocaleDateString() : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 dark:bg-white/5 bg-gray-100/50 rounded-xl border dark:border-white/5 border-gray-200/50">
                  <span className="dark:text-gray-400 text-gray-600 text-sm sm:text-base">Countdown:</span>
                  <span className="text-[#60A5FA] font-bold text-sm sm:text-base animate-pulse">{getCountdownTimer()}</span>
                </div>
                <div className="flex justify-between items-center flex-wrap gap-2 p-3 dark:bg-white/5 bg-gray-100/50 rounded-xl border dark:border-white/5 border-gray-200/50">
                  <span className="dark:text-gray-400 text-gray-600 text-sm sm:text-base">Tech Stack:</span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {sprintInfo.techStack.length > 0 ? (
                      sprintInfo.techStack.map((tech, i) => (
                        <span key={i} className="text-xs dark:bg-[#1E3A8A] bg-blue-100 dark:text-[#60A5FA] text-[#2563EB] px-2 py-1 rounded-md border border-[#2563EB]/30">
                          {tech}
                        </span>
                      ))
                    ) : (
                      <span className="dark:text-white text-gray-900 font-medium text-xs sm:text-base">N/A</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Team List Card */}
          <div className="dark:bg-[#1a1a1a]/40 bg-white/80 backdrop-blur-xl border border-[#2563EB]/20 rounded-2xl p-4 sm:p-6 col-span-1 shadow-[0_0_20px_rgba(0,0,0,0.2)] hover:border-[#2563EB]/40 transition-colors">
            <div className="flex justify-between items-start mb-6 w-full">
              <h2 className="text-xl sm:text-2xl font-bold dark:bg-gradient-to-r dark:from-white dark:to-gray-300 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Team List</h2>
              <Link to={`/sprint/${sprintId}/teams`} className="text-[#60A5FA] dark:text-white text-gray-900 transition-colors text-sm font-medium flex items-center gap-1">
                View More <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
            {sprintInfo?.teamMembers?.length > 0 ? (
              <div className="space-y-3">
                {sprintInfo.teamMembers.slice(0, 3).map((member) => (
                  <div key={member._id} className="flex justify-between items-center p-3 dark:bg-white/5 bg-gray-100/50 rounded-xl border dark:border-white/5 border-gray-200/50 dark:hover:bg-white/10 hover:bg-gray-200 transition-colors group">
                    <Link
                      to={`/user/${member._id}`}
                      className="flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] flex items-center justify-center text-xs font-bold ring-2 ring-[#2563EB]/30 group-hover:ring-[#60A5FA] transition-all">
                        {member.username?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="dark:text-white text-gray-900 hover:text-[#60A5FA] transition-colors text-sm sm:text-base font-medium">
                        {member.username}
                      </span>
                    </Link>
                    <span className={`text-xs sm:text-sm px-2 py-1 rounded-full border ${((sprintInfo.creator?._id || sprintInfo.creator)?.toString() === member._id?.toString())
                      ? " text-white dark:text-yellow-400 bg-yellow-400 dark:bg-yellow-400/10 border-yellow-400/20"
                      : "text-[#60A5FA]/80 bg-[#60A5FA]/10 border-[#60A5FA]/20"
                      }`}>
                      {((sprintInfo.creator?._id || sprintInfo.creator)?.toString() === member._id?.toString()) ? "Owner" : (member.role || "Member")}
                    </span>
                  </div>
                ))}
                {sprintInfo.teamMembers.length > 3 && (
                  <p className="dark:text-gray-400 text-gray-600 text-xs sm:text-sm text-center pt-2">
                    +{sprintInfo.teamMembers.length - 3} more members
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <p className="text-sm">No team members yet</p>
              </div>
            )}
          </div>

          {/* Description Card */}
          <div className="dark:bg-[#1a1a1a]/40 bg-white/80 backdrop-blur-xl border border-[#2563EB]/20 rounded-2xl p-4 sm:p-6 col-span-1 sm:col-span-2 shadow-[0_0_20px_rgba(0,0,0,0.2)]">
            <h2 className="text-xl sm:text-2xl font-bold dark:bg-gradient-to-r dark:from-white dark:to-gray-300 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">Description</h2>
            <div className="dark:bg-black/20 bg-gray-50 rounded-xl p-4 sm:p-6 min-h-[80px] sm:min-h-[100px] border dark:border-white/5 border-gray-200/50">
              {sprintInfo?.description ? (
                <p className="dark:text-gray-200 text-gray-700 text-sm sm:text-base leading-relaxed">{sprintInfo.description}</p>
              ) : (
                <p className="text-gray-500 italic text-sm sm:text-base">No description provided</p>
              )}
            </div>
          </div>

          {/* Requests Card - Only show to sprint owner */}
          {isOwner && (
            <div className="dark:bg-[#1a1a1a]/40 bg-white/80 backdrop-blur-xl border border-[#2563EB]/20 rounded-2xl p-4 sm:p-6 col-span-1 sm:col-span-2 shadow-[0_0_20px_rgba(0,0,0,0.2)]">
              <h2 className="text-xl sm:text-2xl font-bold dark:bg-gradient-to-r dark:from-white dark:to-gray-300 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">Requests</h2>
              {requests.length > 0 ? (
                <div className="space-y-4">
                  {requests.map((req) => (
                    <div key={req._id} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 dark:bg-white/5 bg-gray-100/50 rounded-xl border dark:border-white/5 border-gray-200/50 hover:border-[#2563EB]/30 transition-all">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                          <span className="dark:text-white text-gray-900 font-bold text-sm sm:text-base">
                            {req.user.username?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/user/${req.user._id}`}
                            className="dark:text-white text-gray-900 hover:text-[#60A5FA] transition-colors font-bold text-base block truncate"
                          >
                            {req.user.username}
                          </Link>
                          <p className="dark:text-gray-400 text-gray-600 text-xs sm:text-sm line-clamp-2 mt-1">{req.message}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleJoinRequest(req._id, "rejected")}
                          className="bg-transparent border border-gray-600 dark:text-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:dark:bg-gray-800 bg-gray-100 hover:dark:text-white text-gray-900 transition-all text-xs sm:text-sm flex-1 sm:flex-initial font-medium"
                        >
                          Ignore
                        </button>
                        <button
                          onClick={() => handleJoinRequest(req._id, "accepted")}
                          className="bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white px-4 py-2 rounded-lg hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all text-xs sm:text-sm flex-1 sm:flex-initial font-bold"
                        >
                          Accept
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:bg-white/5 bg-gray-100/50 rounded-xl border border-dashed dark:border-gray-700 border-gray-300">
                  <p className="text-sm">No pending requests</p>
                </div>
              )}
            </div>
          )}

          {/* Resources Card */}
          <div className="dark:bg-[#1a1a1a]/40 bg-white/80 backdrop-blur-xl border border-[#2563EB]/20 rounded-2xl p-4 sm:p-6 col-span-1 sm:col-span-2 shadow-[0_0_20px_rgba(0,0,0,0.2)]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
              <h2 className="text-xl sm:text-2xl font-bold dark:bg-gradient-to-r dark:from-white dark:to-gray-300 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Resources</h2>
              {/* Only show edit button to sprint owner */}
              {isOwner && (
                <button
                  className="text-[#60A5FA] hover:dark:text-gray-200 dark:text-white text-gray-900 transition-colors font-medium border border-[#60A5FA]/30 hover:bg-[#60A5FA]/10 px-3 py-1.5 rounded-lg text-sm"
                  onClick={() => {
                    setEditResources({
                      github: sprintInfo?.resources?.github || "",
                      figma: sprintInfo?.resources?.figma || "",
                      docs: sprintInfo?.resources?.docs || "",
                      extraLinks: sprintInfo?.resources?.extraLinks?.length
                        ? [...sprintInfo.resources.extraLinks]
                        : [""],
                    });
                    setIsEditingResources(true);
                  }}
                >
                  + Edit Resources
                </button>
              )}
            </div>
            {!isEditingResources ? (
              <div className="space-y-3">
                {sprintInfo?.resources?.github && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-3 dark:bg-white/5 bg-gray-100/50 rounded-xl border dark:border-white/5 border-gray-200/50 dark:hover:bg-white/10 hover:bg-gray-200 transition-colors">
                    <span className="dark:text-gray-400 text-gray-600 text-sm sm:text-base min-w-[100px]">Github Repo:</span>
                    <a
                      href={sprintInfo.resources.github}
                      className="text-[#60A5FA] hover:underline text-xs sm:text-sm break-all font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {sprintInfo.resources.github}
                    </a>
                  </div>
                )}
                {sprintInfo?.resources?.figma && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-3 dark:bg-white/5 bg-gray-100/50 rounded-xl border dark:border-white/5 border-gray-200/50 dark:hover:bg-white/10 hover:bg-gray-200 transition-colors">
                    <span className="dark:text-gray-400 text-gray-600 text-sm sm:text-base min-w-[100px]">Figma Design:</span>
                    <a
                      href={sprintInfo.resources.figma}
                      className="text-[#60A5FA] hover:underline text-xs sm:text-sm break-all font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {sprintInfo.resources.figma}
                    </a>
                  </div>
                )}
                {sprintInfo?.resources?.docs && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-3 dark:bg-white/5 bg-gray-100/50 rounded-xl border dark:border-white/5 border-gray-200/50 dark:hover:bg-white/10 hover:bg-gray-200 transition-colors">
                    <span className="dark:text-gray-400 text-gray-600 text-sm sm:text-base min-w-[100px]">Docs:</span>
                    <a
                      href={sprintInfo.resources.docs}
                      className="text-[#60A5FA] hover:underline text-xs sm:text-sm break-all font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {sprintInfo.resources.docs}
                    </a>
                  </div>
                )}
                {sprintInfo?.resources?.extraLinks?.filter(link => link && link.trim() !== "").map((link, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-3 dark:bg-white/5 bg-gray-100/50 rounded-xl border dark:border-white/5 border-gray-200/50 dark:hover:bg-white/10 hover:bg-gray-200 transition-colors">
                    <span className="dark:text-gray-400 text-gray-600 text-sm sm:text-base min-w-[100px]">Extra Link:</span>
                    <a
                      href={link}
                      className="text-[#60A5FA] hover:underline text-xs sm:text-sm break-all font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link}
                    </a>
                  </div>
                ))}
                {!sprintInfo?.resources?.github &&
                  !sprintInfo?.resources?.figma &&
                  !sprintInfo?.resources?.docs &&
                  (!sprintInfo?.resources?.extraLinks || sprintInfo.resources.extraLinks.every(l => !l || !l.trim())) && (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:bg-white/5 bg-gray-100/50 rounded-xl border border-dashed dark:border-gray-700 border-gray-300">
                      <p className="text-sm">No resources added yet</p>
                    </div>
                  )}
              </div>
            ) : (
              // Edit form below - only show to owner
              isOwner && (
                <ResourceEditForm
                  editResources={editResources}
                  setEditResources={setEditResources}
                  setIsEditingResources={setIsEditingResources}
                  sprintId={sprintId}
                  setSprintInfo={setSprintInfo}
                />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SprintHome;



function ResourceEditForm({ editResources, setEditResources, setIsEditingResources, sprintId, setSprintInfo }) {
  const token = localStorage.getItem("token");
  const handleChange = (e) => {
    setEditResources({ ...editResources, [e.target.name]: e.target.value });
  };

  const handleExtraLinkChange = (idx, value) => {
    const newLinks = [...editResources.extraLinks];
    newLinks[idx] = value;
    setEditResources({ ...editResources, extraLinks: newLinks });
  };

  const addExtraLink = () => {
    setEditResources({ ...editResources, extraLinks: [...editResources.extraLinks, ""] });
  };

  const removeExtraLink = (idx) => {
    const newLinks = editResources.extraLinks.filter((_, i) => i !== idx);
    setEditResources({ ...editResources, extraLinks: newLinks });
  };
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/sprint/${sprintId}/resources`,
        editResources,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSprintInfo((prev) => ({
        ...prev,
        resources: { ...editResources },
      }));
      setIsEditingResources(false);
    } catch (err) {
      // alert("Failed to update resources");
      toast.error("Failed to update resources");
    }
  };
  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="space-y-3">
        <div>
          <label className="block dark:text-gray-300 text-gray-600 text-sm mb-2">Github Repo Link</label>
          <input
            type="text"
            name="github"
            placeholder="https://github.com/username/repo"
            value={editResources.github}
            onChange={handleChange}
            className="w-full px-3 py-2 dark:bg-gray-800 bg-gray-100 border dark:border-gray-600 border-gray-300 rounded-lg dark:text-white text-gray-900 placeholder-gray-400 focus:border-[#2563EB] focus:outline-none"
          />
        </div>

        <div>
          <label className="block dark:text-gray-300 text-gray-600 text-sm mb-2">Figma Design Link</label>
          <input
            type="text"
            name="figma"
            placeholder="https://figma.com/design/..."
            value={editResources.figma}
            onChange={handleChange}
            className="w-full px-3 py-2 dark:bg-gray-800 bg-gray-100 border dark:border-gray-600 border-gray-300 rounded-lg dark:text-white text-gray-900 placeholder-gray-400 focus:border-[#2563EB] focus:outline-none"
          />
        </div>

        <div>
          <label className="block dark:text-gray-300 text-gray-600 text-sm mb-2">Docs Link</label>
          <input
            type="text"
            name="docs"
            placeholder="https://docs.example.com"
            value={editResources.docs}
            onChange={handleChange}
            className="w-full px-3 py-2 dark:bg-gray-800 bg-gray-100 border dark:border-gray-600 border-gray-300 rounded-lg dark:text-white text-gray-900 placeholder-gray-400 focus:border-[#2563EB] focus:outline-none"
          />
        </div>

        <div>
          <label className="block dark:text-gray-300 text-gray-600 text-sm mb-2">Extra Links</label>
          {editResources.extraLinks.map((link, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={link}
                onChange={(e) => handleExtraLinkChange(idx, e.target.value)}
                className="flex-1 px-3 py-2 dark:bg-gray-800 bg-gray-100 border dark:border-gray-600 border-gray-300 rounded-lg dark:text-white text-gray-900 placeholder-gray-400 focus:border-[#2563EB] focus:outline-none"
                placeholder={`Extra Link #${idx + 1}`}
              />
              <button
                type="button"
                onClick={() => removeExtraLink(idx)}
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                disabled={editResources.extraLinks.length === 1}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addExtraLink}
            className="text-[#2563EB] hover:text-[#3B82F6] transition-colors text-sm"
          >
            + Add Extra Link
          </button>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="bg-[#2563EB] text-white px-6 py-2 rounded-lg hover:bg-[#3B82F6] transition-colors"
        >
          Save Changes
        </button>
        <button
          type="button"
          onClick={() => setIsEditingResources(false)}
          className="bg-white dark:bg-gray-800 dark:text-white text-gray-900 border-blue-500 border px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}



