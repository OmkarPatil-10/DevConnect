import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useUser } from "@/context/UserContext";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
function Dashboard() {
  const { userData, loading } = useUser();
  const [sprints, setSprints] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchSprints = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/sprint`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.sprints) {
          console.log(res.data.sprints);
          setSprints(res.data.sprints);
        }
      } catch (e) {
        console.log("error while fetching all sprints", e);
      }
    };
    fetchSprints();
  }, []);

  // Add loading and error handling
  if (loading) {
    return (
      <div className="text-foreground bg-background h-screen flex-col items-center justify-center gap-4">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2563EB]"></div>
        <div className="text-foreground bg-background h-screen flex items-center justify-center  font-bold">
          {" "}
          Loading...
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="text-foreground bg-background h-screen flex-col items-center justify-center  p-10 ">
        <div className="text-foreground bg-background  flex justify-center   font-bold">
          {" "}
          Please log in to continue
        </div>
        <div className="text-foreground bg-background  flex justify-center    font-bold">
          <Link to="/auth/login" className="text-[#2563EB] hover:underline">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  //filter the sprints show only the sprints created by logged in user
  const mySprints = sprints.filter(
    (sprint) => sprint.creator.username === userData.username
  );

  const handleSignOut = () => {
    // Clear all profile-related data from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("profileForm");
    localStorage.removeItem("profileStep");
    localStorage.removeItem("profilePhoto");
    window.location.href = "/auth/login";
  };

  // const challenges = [
  //   {
  //     id: 1,
  //     title: "Transforming Cancer Navigation with Open Data & APIs",
  //     description: "Support care Navigators with digital tools that integrate openly available datasets and APIs. Enhance patient care and support systems.",
  //     author: "Shravani Sawant"
  //   },
  //   {
  //     id: 2,
  //     title: "Transforming Cancer Navigation with Open Data & APIs",
  //     description: "Support care Navigators with digital tools that integrate openly available datasets and APIs. Enhance patient care and support systems.",
  //     author: "Shravani Sawant"
  //   },
  //   {
  //     id: 3,
  //     title: "Transforming Cancer Navigation with Open Data & APIs",
  //     description: "Support care Navigators with digital tools that integrate openly available datasets and APIs. Enhance patient care and support systems.",
  //     author: "Shravani Sawant"
  //   }
  // ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header - Made Sticky */}
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
          {/* Welcome Section */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-[#2563EB] to-[#60A5FA] bg-clip-text text-transparent">
              Welcome back,
            </h1>
            <div className="flex flex-col sm:flex-row items-baseline gap-2">
              <p className="text-xl sm:text-2xl dark:text-gray-300 text-gray-600 flex items-center gap-2">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[#60A5FA]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                {userData?.username || "Developer"}
              </p>
            </div>
          </div>

          {/* Profile Hero Card */}
          <div className="bg-gradient-to-br dark:from-[#1E3A8A] dark:via-[#111] dark:to-[#1E3A8A] from-blue-50 via-white to-blue-50 rounded-2xl sm:rounded-3xl border-2 border-[#2563EB]/50 p-6 sm:p-8 mb-6 sm:mb-8 shadow-2xl relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#2563EB]/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#60A5FA]/10 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8 mb-6">
                {/* Profile Photo */}
                <div className="relative">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-[#2563EB] to-[#60A5FA] rounded-2xl sm:rounded-3xl overflow-hidden flex items-center justify-center shadow-xl border-4 border-[#2563EB]/30">
                    {userData?.profilePicture ? (
                      <img
                        src={`data:image/jpeg;base64,${userData.profilePicture}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="dark:text-white text-gray-900 text-4xl sm:text-5xl lg:text-6xl font-bold">
                        {userData?.username?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-4 border-[#1E3A8A]"></div>
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div>
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold dark:text-white text-gray-900 mb-2">
                        {userData?.username || "Developer"}
                      </h2>
                      {userData?.experienceYear !== undefined &&
                        userData?.experienceYear !== null && (
                          <p className="text-lg sm:text-xl dark:text-gray-300 text-gray-600">
                            {userData.experienceYear} year
                            {userData.experienceYear !== 1 ? "s" : ""} of
                            experience
                          </p>
                        )}
                    </div>
                    <Link
                      to="/completeprofile"
                      className="px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#2563EB] to-[#60A5FA] text-white rounded-lg hover:from-[#3B82F6] hover:to-[#60A5FA] transition-all text-sm sm:text-base font-semibold shadow-lg whitespace-nowrap flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      Edit Profile
                    </Link>
                  </div>
                </div>
              </div>

              {/* Profile Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Experience */}
                <div className="dark:bg-[#111]/50 bg-gray-100/80 rounded-xl p-4 border border-[#2563EB]/20">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-6 h-6 text-[#60A5FA]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    <h3 className="text-sm font-semibold text-[#60A5FA] uppercase tracking-wide">
                      Experience
                    </h3>
                  </div>
                  <p className="dark:text-white text-gray-900 text-lg font-medium">
                    {userData?.experienceYear !== undefined &&
                      userData?.experienceYear !== null
                      ? `${userData.experienceYear} year${userData.experienceYear !== 1 ? "s" : ""
                      }`
                      : "Not set"}
                  </p>
                </div>

                {/* Availability */}
                <div className="dark:bg-[#111]/50 bg-gray-100/80 rounded-xl p-4 border border-[#2563EB]/20">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-6 h-6 text-[#60A5FA]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <h3 className="text-sm font-semibold text-[#60A5FA] uppercase tracking-wide">
                      Availability
                    </h3>
                  </div>
                  <p className="dark:text-white text-gray-900 text-lg font-medium">
                    {userData?.availability || "Not set"}
                  </p>
                </div>
              </div>

              {/* Languages Section */}
              {userData?.preferredLanguages &&
                userData.preferredLanguages.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-[#60A5FA] uppercase tracking-wide mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-[#60A5FA]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg> Preferred Languages
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {userData.preferredLanguages.map((lang, idx) => (
                        <span
                          key={idx}
                          className="bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Additional Skills Section */}
              {userData?.additionalSkills &&
                userData.additionalSkills.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-[#60A5FA] uppercase tracking-wide mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-[#60A5FA]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> Additional Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {userData.additionalSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="bg-[#2563EB]/20 dark:text-white text-[#2563EB] border border-[#2563EB]/50 px-4 py-2 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* GitHub Status Section */}
          <div className="bg-gradient-to-br dark:from-[#1E3A8A] dark:via-[#111] dark:to-[#1E3A8A] from-blue-50 via-white to-blue-50 rounded-2xl sm:rounded-3xl border-2 border-[#2563EB]/50 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#2563EB]/10 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <svg
                  className="w-8 h-8 dark:text-white text-gray-900"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                    clipRule="evenodd"
                  />
                </svg>
                <h2 className="text-2xl sm:text-3xl font-bold dark:text-white text-gray-900">
                  GitHub Status
                </h2>
              </div>

              <div className="dark:bg-[#111]/50 bg-gray-100/80 rounded-xl p-6 sm:p-8 border border-[#2563EB]/20 text-center">
                <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#2563EB]/20 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-10 h-10 sm:w-12 sm:h-12 text-[#2563EB]"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold dark:text-white text-gray-900 mb-2">
                    Coming Soon...
                  </h3>
                  <p className="dark:text-gray-400 text-gray-600 text-sm sm:text-base max-w-md">
                    GitHub integration will help validate your identity and
                    showcase your contributions, repositories, and coding
                    activity.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Challenges Grid */}
          {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {mySprints.map((sprint) => (
              <div
                key={sprint._id}
                className="bg-[#111] border-2 border-[#60A5FA] rounded-2xl sm:rounded-3xl p-4 sm:p-6 hover:shadow-lg dark:text-white text-gray-900"
              >
                <div>
                  <div className="text-[#2563EB] font-semibold mb-2 text-sm sm:text-base">
                    ~By {sprint.creator?.username || "user"}
                  </div>
                  <div className="font-bold text-base sm:text-lg mb-1">{sprint.title}</div>
                  <div className="text-xs sm:text-sm mb-3 dark:text-gray-400 text-gray-600 line-clamp-2">
                    {sprint.description}
                  </div>
                </div>

                <button className="bg-[#2563EB] text-white rounded-md px-3 sm:px-4 py-2 mt-4 hover:bg-[#2563EB]/80 transition text-sm sm:text-base w-full sm:w-auto">
                  View
                </button>
              </div>
            ))}
          </div> */}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
