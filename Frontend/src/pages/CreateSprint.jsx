import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useUser } from "@/context/UserContext";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
const isSprintEnded = (sprint) => {
  if (!sprint) return false;
  if (sprint.isFinished) return true;
  if (sprint.isActive === false) return true;
  return false;
};

function CreateSprint() {
  const { register, handleSubmit } = useForm();
  const [showForm, setshowForm] = useState(false);
  const { userData, loading } = useUser();
  const [mySprints, setMySprints] = useState([]);
  const [statusFilter, setStatusFilter] = useState("active");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMySprints = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/sprint/user/list?scope=created&status=all`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.data.sprints) {
          setMySprints(res.data.sprints);
        }
      } catch (e) {
        console.log("error while fetching user sprints", e);
      }
    };
    fetchMySprints();
  }, [token]);

  // Add loading and error handling
  if (loading) {
    return <div className="text-foreground bg-background h-screen flex items-center justify-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2563EB]"></div>
      <div className="text-foreground bg-background h-screen flex items-center justify-center"> Loading...</div>
    </div>
  }

  if (!userData) {
    return <div className="text-foreground bg-background h-screen flex-col items-center justify-center  p-10 ">
      <div className="text-foreground bg-background  flex justify-center   font-bold"> Please log in to continue</div>
      <div className="text-foreground bg-background  flex justify-center    font-bold">
        <Link to="/auth/login" className="text-[#2563EB] hover:underline">
          Go to Login
        </Link>
      </div>
    </div>
  }

  const filteredSprints = useMemo(() => {
    return mySprints.filter((sprint) => {
      if (statusFilter === "active") return !isSprintEnded(sprint);
      if (statusFilter === "ended") return isSprintEnded(sprint);
      return true;
    });
  }, [mySprints, statusFilter]);

  const onSubmit = async (data) => {
    console.log(data);
    const sprintData = {
      title: data.sprintName,
      description: data.sprintDescription,
      techStack: data.techStack, // This should be an array
      duration: Number(data.sprintDuration),
      startDate: data.sprintStartDate, // Use the actual selected date
      maxTeamSize: Number(data.teamSize),
      creator: userData._id,
    };
    console.log("Sprint data being sent:", sprintData);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/sprint`,
        sprintData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const sprintId = res.data.sprintId;
      navigate(`/sprint/${sprintId}/board`);
      // alert("welcome to sprint room");
      setshowForm(false);
    } catch (err) {
      console.error("Sprint creation failed", err);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('profileForm');
    localStorage.removeItem('profileStep');
    localStorage.removeItem('profilePhoto');
    window.location.href = '/auth/login';
  };

  return (
    <>
      <div className="min-h-screen bg-background text-foreground">
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} userData={userData} />
        <div className="flex pt-[60px] sm:pt-[73px]">
          {/* Sidebar - Made Sticky */}
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onSignOut={handleSignOut}
          />

          {/* Main Content - Added margin-left to account for fixed sidebar */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-64">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#2563EB] to-[#60A5FA] bg-clip-text text-transparent">Create a Sprint</h1>
              <button
                className="group relative bg-[#2563EB] text-white rounded-xl px-5 py-2 hover:bg-[#3B82F6] transition-all text-sm sm:text-base font-bold shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] overflow-hidden"
                onClick={() => setshowForm(true)}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span>+</span> Create Sprint
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
              </button>
            </div>
            <div className="px-0">
              <div className="flex flex-wrap gap-2 sm:space-x-1 mb-6 dark:bg-[#1a1a1a]/40 bg-white/80 backdrop-blur-xl border border-[#2563EB]/20 p-1.5 rounded-xl w-full sm:w-fit">
                {["all", "active", "ended"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-6 py-2.5 rounded-lg font-medium transition-all text-sm sm:text-base ${statusFilter === status
                      ? 'bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]'
                      : 'dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 hover:bg-white/5'
                      }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)} Sprints
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredSprints.map((sprint) => (
                  <div
                    key={sprint._id}
                    className="group dark:bg-[#1a1a1a]/40 bg-white/80 backdrop-blur-xl border border-[#2563EB]/20 rounded-3xl p-6 hover:border-[#2563EB]/50 transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.15)] flex flex-col h-full relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#2563EB]/10 rounded-full blur-2xl -mr-16 -mt-16 transition-all group-hover:bg-[#2563EB]/20"></div>

                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold border ${isSprintEnded(sprint) ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-green-500/10 text-green-400 border-green-500/20"}`}>
                        {isSprintEnded(sprint) ? "● Ended" : "● Active"}
                      </div>
                      {sprint.endDate && (
                        <p className="text-xs dark:text-gray-400 text-gray-600 font-medium bg-black/20 px-2 py-1 rounded-lg">
                          Ends {new Date(sprint.endDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col relative z-10">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] flex items-center justify-center text-[10px] font-bold ring-1 ring-[#2563EB]/30">
                          {sprint.creator?.username?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="dark:text-gray-400 text-gray-600 text-xs font-medium">
                          {sprint.creator?.username || "user"}
                        </div>
                      </div>
                      <div className="font-bold text-lg mb-2 dark:text-white text-gray-900 group-hover:text-[#60A5FA] transition-colors">{sprint.title}</div>
                      <div className="text-sm mb-4 dark:text-gray-400 text-gray-600 line-clamp-2 leading-relaxed">
                        {sprint.description}
                      </div>
                    </div>

                    <button className="bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white rounded-xl px-4 py-3 mt-auto hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all text-sm font-bold w-full relative z-10" onClick={() => navigate(isSprintEnded(sprint) ? `/sprint/${sprint._id}/end` : `/sprint/${sprint._id}/board`)}>
                      {isSprintEnded(sprint) ? "View Summary" : "View Board →"}
                    </button>
                  </div>
                ))}
                {filteredSprints.length === 0 && (
                  <div className="col-span-full text-center text-gray-500 py-12">
                    No sprints in this filter.
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="dark:bg-[#1a1a1a] bg-white border border-[#2563EB]/30 p-6 sm:p-8 rounded-3xl shadow-2xl max-w-lg w-full space-y-6 relative max-h-[90vh] overflow-y-auto"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#2563EB]/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>

            <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#2563EB]/20 relative z-10">
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#2563EB] to-[#60A5FA] bg-clip-text text-transparent">
                Create New Sprint
              </h2>
              <button
                type="button"
                className="dark:text-gray-400 text-gray-600 hover:dark:text-white text-gray-900 p-2 hover:bg-white/10 rounded-full transition-all"
                onClick={() => setshowForm(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-5 relative z-10">
              <div>
                <label className="block text-sm font-bold text-[#60A5FA] mb-2 pl-1">
                  Sprint Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Q4 Feature Implementation"
                  {...register("sprintName", { required: true })}
                  className="w-full px-4 py-3 dark:bg-[#0a0a0a]/50 bg-gray-50 border border-[#2563EB]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent dark:text-white text-gray-900 placeholder-gray-600 transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#60A5FA] mb-2 pl-1">
                  Sprint Description
                </label>
                <textarea
                  placeholder="What are the main goals of this sprint?"
                  {...register("sprintDescription", { required: true })}
                  rows={4}
                  className="w-full px-4 py-3 dark:bg-[#0a0a0a]/50 bg-gray-50 border border-[#2563EB]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent dark:text-white text-gray-900 placeholder-gray-600 transition-all resize-none font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#60A5FA] mb-2 pl-1">
                  Tech Stack
                </label>
                <div className="grid grid-cols-2 gap-3 dark:bg-[#0a0a0a]/30 bg-gray-50 p-4 rounded-xl border border-[#2563EB]/20">
                  {['React', 'Node.js', 'MongoDB', 'Python', 'Express', 'Tailwind', 'TypeScript', 'JavaScript'].map((tech) => (
                    <label key={tech} className="flex items-center gap-3 dark:text-gray-300 text-gray-600 cursor-pointer hover:dark:text-white text-gray-900 transition-colors p-1 rounded-lg hover:bg-white/5">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          value={tech}
                          {...register("techStack")}
                          className="peer appearance-none w-5 h-5 border border-[#2563EB]/50 rounded checked:bg-[#2563EB] checked:border-[#2563EB] transition-all cursor-pointer"
                        />
                        <svg className="absolute w-3.5 h-3.5 text-white hidden peer-checked:block pointer-events-none left-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <span className="font-medium text-sm">{tech}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#60A5FA] mb-2 pl-1">
                    Duration (days)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="e.g., 14"
                      {...register("sprintDuration", { required: true })}
                      className="w-full px-4 py-3 dark:bg-[#0a0a0a]/50 bg-gray-50 border border-[#2563EB]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] dark:text-white text-gray-900 placeholder-gray-600 transition-all font-medium pl-10"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#60A5FA] mb-2 pl-1">
                    Max Team Size
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="e.g., 5"
                      {...register("teamSize", { required: true })}
                      className="w-full px-4 py-3 dark:bg-[#0a0a0a]/50 bg-gray-50 border border-[#2563EB]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] dark:text-white text-gray-900 placeholder-gray-600 transition-all font-medium pl-10"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg></span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#60A5FA] mb-2 pl-1">
                  Start Date
                </label>
                <input
                  type="date"
                  {...register("sprintStartDate", { required: true })}
                  className="w-full px-4 py-3 dark:bg-[#0a0a0a]/50 bg-gray-50 border border-[#2563EB]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] dark:text-white text-gray-900 [color-scheme:dark] transition-all font-medium cursor-pointer uppercase text-sm tracking-wider"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#2563EB] to-[#60A5FA] text-white rounded-xl px-6 py-4 hover:from-[#3B82F6] hover:to-[#60A5FA] transition-all text-base font-bold shadow-[0_4px_20px_rgba(37,99,235,0.4)] hover:shadow-[0_6px_25px_rgba(37,99,235,0.6)] transform hover:-translate-y-0.5 mt-4 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Launch Sprint
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default CreateSprint;
