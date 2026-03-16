import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const EXPERIENCE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const LANGUAGE_OPTIONS = [
  'JavaScript', 'Python', 'Java', 'C++', 'Ruby', 'PHP', 'Swift', 'Go', 'C#', 'Kotlin', 'Rust', 'TypeScript', 'Dart', 'Scala', 'Perl', 'Shell', 'C'
];
const AVAILABILITY_OPTIONS = ['Full-time', 'Part-time', 'Weekends'];

function Search() {
  const [userData, setUserData] = useState(null);
  const [filters, setFilters] = useState({ experienceYear: '', preferredLanguages: [], availability: '' });
  const [searchName, setSearchName] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState({}); // { userId: 'pending' | 'sent' | 'error' }
  const [hasSearched, setHasSearched] = useState(false);
  const [aiMatches, setAiMatches] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/check-auth`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) setUserData(res.data.user);
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };
    if (token) fetchUserData();
  }, [token]);

  // Load AI matches; attach connectionStatus and keep raw shape where possible
  const fetchAIMatches = async () => {
    if (!userData) return;
    setAiLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/match/ai/developers?userId=${userData._id}`);
      if (!res.data.success) {
        setAiMatches([]);
        setAiLoading(false);
        return;
      }
      const matches = res.data.matches || [];

      // Prefetch sent/pending once
      let sentRequests = [];
      let pendingRequests = [];
      try {
        const [sentRes, pendingRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/match/sent-requests/${userData._id}`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/match/requests/${userData._id}`)
        ]);
        sentRequests = sentRes.data.success ? sentRes.data.requests : [];
        pendingRequests = pendingRes.data.success ? pendingRes.data.requests : [];
      } catch (err) {
        // fallback per-match below
      }

      const matchesWithStatus = await Promise.all(matches.map(async (m) => {
        try {
          let allRequests = [...sentRequests, ...pendingRequests];
          if (allRequests.length === 0) {
            const [sentRes, pendingRes] = await Promise.all([
              axios.get(`${import.meta.env.VITE_API_URL}/api/match/sent-requests/${userData._id}`),
              axios.get(`${import.meta.env.VITE_API_URL}/api/match/requests/${userData._id}`)
            ]);
            allRequests = [
              ...(sentRes.data.success ? sentRes.data.requests : []),
              ...(pendingRes.data.success ? pendingRes.data.requests : [])
            ];
          }

          // partnerId might be used; fallback to _id if present
          const partnerId = m.partnerId || m._id;
          const found = allRequests.find(req => {
            const from = req.fromUser?._id || req.fromUser;
            const to = req.toUser?._id || req.toUser;
            return String(from) === String(partnerId) || String(to) === String(partnerId);
          });

          return {
            ...m,
            // prefer existing id if present
            _id: m._id || m.partnerId || null,
            partnerId: m.partnerId || m._id || null,
            connectionStatus: found ? (found.status || 'pending') : (m.connectionStatus || 'none')
          };
        } catch (err) {
          return {
            ...m,
            _id: m._id || m.partnerId || null,
            partnerId: m.partnerId || m._id || null,
            connectionStatus: m.connectionStatus || 'none'
          };
        }
      }));

      setAiMatches(matchesWithStatus);

      // We no longer overwrite search results with AI matches by default
      // since the user wants to show all normal developers first.
    } catch (err) {
      console.error('Error fetching AI matches:', err);
      setAiMatches([]);
    } finally {
      setAiLoading(false);
    }
  };

  // Fetch backend filtered results (only when filters or search applied)
  const fetchResults = async (customFilters = null, customSearchName = null) => {
    if (!userData) return;
    setLoading(true);
    try {
      const nameToUse = customSearchName !== null ? customSearchName : searchName;
      const filtersToUse = customFilters !== null ? customFilters : filters;

      // We always fetch from backend. If no filters are provided, backend returns all developers.

      // Build query params for server-side filter/search
      const params = new URLSearchParams();
      params.append('userId', userData._id);
      if (nameToUse.trim()) {
        params.append('name', nameToUse.trim());
      } else {
        if (filtersToUse.experienceYear) params.append('experienceYear', filtersToUse.experienceYear);
        if (filtersToUse.preferredLanguages && filtersToUse.preferredLanguages.length > 0) {
          filtersToUse.preferredLanguages.forEach(lang => params.append('preferredLanguages', lang));
        }
        if (filtersToUse.availability) params.append('availability', filtersToUse.availability);
      }

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/match?${params.toString()}`);
      if (res.data.success) {
        setResults(res.data.users || []);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error('Error fetching results:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData) {
      fetchAIMatches();
      fetchResults();
    }
    // eslint-disable-next-line
  }, [userData]);

  const handleFilterChange = (key, value) => {
    setHasSearched(true);
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleLanguageToggle = (lang) => {
    setHasSearched(true);
    setFilters(prev => ({
      ...prev,
      preferredLanguages: prev.preferredLanguages.includes(lang)
        ? prev.preferredLanguages.filter(l => l !== lang)
        : [...prev.preferredLanguages, lang]
    }));
  };

  const handleSearch = () => {
    setHasSearched(true);
    fetchResults();
  };

  const handleClear = () => {
    setHasSearched(true);
    setFilters({ experienceYear: '', preferredLanguages: [], availability: '' });
    setSearchName('');
    fetchResults({ experienceYear: '', preferredLanguages: [], availability: '' }, '');
  };

  // helper to normalize id used for requests
  const getDevId = (dev) => dev._id || dev.partnerId || dev.id || null;

  const handleConnect = async (target) => {
    const targetUserId = typeof target === 'string' ? target : getDevId(target);
    if (!userData || !targetUserId) return;
    setRequestStatus(prev => ({ ...prev, [targetUserId]: 'pending' }));
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/match/request`, {
        fromUserId: userData._id,
        toUserId: targetUserId
      });
      if (response.data.success) {
        setRequestStatus(prev => ({ ...prev, [targetUserId]: 'sent' }));
        setResults(prev => prev.map(u => {
          const id = getDevId(u);
          if (String(id) === String(targetUserId)) return { ...u, connectionStatus: 'pending' };
          return u;
        }));
      } else {
        setRequestStatus(prev => ({ ...prev, [targetUserId]: 'error' }));
      }
    } catch (err) {
      console.error('Error sending connection request:', err);
      setRequestStatus(prev => ({ ...prev, [targetUserId]: 'error' }));
    }
  };

  const getConnectionButtonProps = (user) => {
    const id = getDevId(user);
    const status = user.connectionStatus;
    switch (status) {
      case 'pending':
        return { text: 'Request Pending', disabled: true, className: 'bg-gray-600' };
      case 'accepted':
        return { text: 'Connected', disabled: true, className: 'bg-green-600' };
      case 'none':
        return {
          text: requestStatus[id] === 'sent' ? 'Request Sent' :
            requestStatus[id] === 'pending' ? 'Sending...' : 'Connect',
          disabled: requestStatus[id] === 'sent' || requestStatus[id] === 'pending',
          className: requestStatus[id] === 'sent' ? 'bg-gray-600' : 'bg-[#2563EB] hover:bg-[#2563EB]/80'
        };
      default:
        return { text: 'Connect', disabled: false, className: 'bg-[#2563EB] hover:bg-[#2563EB]/80' };
    }
  };

  // render helpers
  const renderAICardReasons = (dev) => {
    const reasons = dev.__aiReasons || dev.reasons || [];
    if (!reasons.length) return null;
    return (
      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Why we matched you</p>
        <div className="space-y-2">
          {reasons.map((r, i) => (
            <div key={i} className="flex items-start gap-2 text-sm dark:text-gray-300 text-gray-600 dark:bg-gray-800 bg-gray-100/30 px-3 py-2 rounded-lg border border-[#2563EB]/20">
              <span className="text-[#60A5FA] mt-0.5">✓</span>
              <span>{r}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('profileForm');
    localStorage.removeItem('profileStep');
    localStorage.removeItem('profilePhoto');
    window.location.href = '/auth/login';
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} userData={userData} />

      <div className="flex pt-[60px] sm:pt-[73px]">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onSignOut={handleSignOut}
        />

        {/* Main Content - Added margin-left to account for fixed sidebar */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-64">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-[#2563EB] to-[#60A5FA] bg-clip-text text-transparent">
                Find Your Perfect Developer Match
              </h1>
              <p className="dark:text-gray-400 text-gray-600 text-sm sm:text-base lg:text-lg">Connect with talented developers who share your passion</p>
            </div>

            {/* Search + Filters */}
            <div className="mb-6 sm:mb-8">
              <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 dark:text-gray-400 text-gray-600">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="w-full bg-white/5 backdrop-blur-md border border-[#2563EB]/30 rounded-lg sm:rounded-xl pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3.5 dark:text-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 focus:border-[#2563EB] transition-all text-sm sm:text-base"
                    placeholder="Search by developer name or use filter option..."
                    value={searchName}
                    onChange={e => setSearchName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
                  />
                </div>
                <button
                  className="bg-gradient-to-r from-[#2563EB] to-[#60A5FA] text-white px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl font-semibold hover:shadow-lg hover:shadow-[#2563EB]/30 transition-all duration-200 text-sm sm:text-base whitespace-nowrap"
                  onClick={handleSearch}
                >
                  Search
                </button>
              </div>
            </div>

            {/* Toggle Filters Button */}
            <div className="mb-4 sm:mb-6 flex justify-end">
              <button
                className="flex items-center gap-2 dark:text-gray-300 text-gray-700 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors border dark:border-white/10 border-[#2563EB]/20 text-sm font-medium"
                onClick={() => setShowFilters(!showFilters)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>

            {showFilters && (
              <div className="bg-white/5 backdrop-blur-md border border-[#2563EB]/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 dark:text-gray-200 text-gray-700">Filter Options</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div>
                    <label className="block mb-2 text-xs sm:text-sm font-medium dark:text-gray-300 text-gray-600">Experience Level</label>
                    <select
                      className="w-full bg-white/5 backdrop-blur-md border border-[#2563EB]/30 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 transition-all text-sm sm:text-base [&>option]:dark:bg-gray-900 [&>option]:bg-white"
                      value={filters.experienceYear}
                      onChange={e => handleFilterChange('experienceYear', e.target.value)}
                    >
                      <option value="">All Experience Levels</option>
                      {EXPERIENCE_OPTIONS.map(y => <option key={y} value={y}>{y} year{y > 1 ? 's' : ''}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 text-xs sm:text-sm font-medium dark:text-gray-300 text-gray-600">Availability</label>
                    <select
                      className="w-full bg-white/5 backdrop-blur-md border border-[#2563EB]/30 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 transition-all text-sm sm:text-base [&>option]:dark:bg-gray-900 [&>option]:bg-white"
                      value={filters.availability}
                      onChange={e => handleFilterChange('availability', e.target.value)}
                    >
                      <option value="">All Availability</option>
                      {AVAILABILITY_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>

                  <div className="flex items-end gap-2 sm:gap-3 sm:col-span-2 lg:col-span-1">
                    <button
                      className="flex-1 bg-gradient-to-r from-[#2563EB] to-[#60A5FA] text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold hover:shadow-lg hover:shadow-[#2563EB]/30 transition-all duration-200 text-sm sm:text-base"
                      onClick={handleSearch}
                    >
                      Apply Filters
                    </button>
                    <button
                      className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white/5 border border-white/10 dark:text-white text-gray-900 rounded-lg font-semibold hover:bg-white/10 transition-all text-sm sm:text-base"
                      onClick={handleClear}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block mb-3 text-xs sm:text-sm font-medium dark:text-gray-300 text-gray-600">Programming Languages</label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGE_OPTIONS.map(lang => (
                      <button
                        key={lang}
                        type="button"
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm ${filters.preferredLanguages.includes(lang)
                          ? 'bg-gradient-to-r from-[#2563EB] to-[#60A5FA] text-white shadow-lg shadow-[#2563EB]/30'
                          : 'bg-white/5 dark:text-gray-300 text-gray-600 border dark:border-white/10 border-gray-200 dark:hover:border-[#2563EB]/40 hover:border-[#2563EB]/40 hover:bg-white/10'
                          }`}
                        onClick={() => handleLanguageToggle(lang)}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Results */}
            {loading || aiLoading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2563EB]"></div>
                <p className="mt-4 dark:text-gray-400 text-gray-600">{aiLoading ? 'Analyzing profiles and generating recommendations...' : 'Searching for developers...'}</p>
              </div>
            ) : (
              <>
                {results.length === 0 && hasSearched ? (
                  <div className="text-center py-20">
                    <div className="w-24 h-24 dark:bg-gray-800 bg-gray-100/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <p className="text-xl dark:text-gray-400 text-gray-600 mb-2">No developers found</p>
                    <p className="text-gray-500">Try adjusting your filters or search terms</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {results.map(dev => {
                      const isAI = dev.__aiCompatibility !== undefined || dev.__aiReasons !== undefined || dev.reasons !== undefined;
                      const devId = getDevId(dev);
                      const buttonProps = getConnectionButtonProps(dev);
                      return (
                        <div key={devId || dev.username} className="group relative bg-gradient-to-br dark:from-gray-900/80 dark:to-gray-800/40 from-white to-gray-50 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-[#2563EB]/20 p-4 sm:p-6 hover:border-[#2563EB]/50 hover:shadow-xl hover:shadow-[#2563EB]/10 transition-all duration-300 flex flex-col h-full">
                          {/* If AI, show compatibility badge */}
                          {isAI && dev.__aiCompatibility && (
                            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-gradient-to-r from-[#2563EB] to-[#60A5FA] text-white px-2 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-lg z-10">
                              {dev.__aiCompatibility}% Match
                            </div>
                          )}

                          <div className="flex-1 flex flex-col">
                            <div className="flex items-center mb-3 sm:mb-4">
                              <div className="relative">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#2563EB] to-[#60A5FA] rounded-full overflow-hidden flex items-center justify-center ring-2 ring-[#2563EB]/30">
                                  {dev.profilePicture && dev.profilePicture !== 'data:image/jpeg;base64' ? (
                                    <img src={dev.profilePicture.startsWith('data:') ? dev.profilePicture : `data:image/jpeg;base64,${dev.profilePicture}`} alt="Profile" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                                  ) : (
                                    <span className="dark:text-white text-gray-900 text-lg sm:text-2xl font-bold">{dev.username?.charAt(0)?.toUpperCase() || 'U'}</span>
                                  )}
                                </div>
                                {dev.connectionStatus === 'accepted' && <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full border-2 dark:border-gray-900 border-white"></div>}
                              </div>
                              <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                                <Link to={`/user/${devId}`} className="text-base sm:text-lg font-bold dark:text-white text-gray-900 hover:text-[#60A5FA] transition-colors block truncate">
                                  {dev.username || dev.name || 'Unknown'}
                                </Link>
                                {/* For AI cards we avoid showing empty experience - show label only if value present */}
                                {(!isAI && dev.experienceYear) ? (
                                  <p className="text-xs sm:text-sm dark:text-gray-400 text-gray-600">{dev.experienceYear} year{dev.experienceYear > 1 ? 's' : ''} experience</p>
                                ) : (!isAI ? (
                                  <p className="text-xs sm:text-sm dark:text-gray-400 text-gray-600">No experience listed</p>
                                ) : (
                                  <p className="text-xs sm:text-sm dark:text-gray-400 text-gray-600">AI Recommended Match</p>
                                ))}
                              </div>
                            </div>

                            {/* If NOT AI, show Languages + availability as before */}
                            {!isAI ? (
                              <>
                                <div className="mb-4">
                                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Languages</p>
                                  <div className="flex flex-wrap gap-2">
                                    {dev.preferredLanguages && dev.preferredLanguages.length > 0 ? (
                                      dev.preferredLanguages.slice(0, 3).map((lang, idx) => (
                                        <span key={idx} className="px-2.5 py-1 bg-[#2563EB]/20 text-[#60A5FA] text-xs rounded-lg border border-[#2563EB]/30">{lang}</span>
                                      ))
                                    ) : (
                                      <span className="text-xs text-gray-500">Not specified</span>
                                    )}
                                    {dev.preferredLanguages && dev.preferredLanguages.length > 3 && <span className="px-2.5 py-1 dark:bg-gray-800 bg-gray-100/50 dark:text-gray-400 text-gray-600 text-xs rounded-lg">+{dev.preferredLanguages.length - 3} more</span>}
                                  </div>
                                </div>

                                {dev.availability && (
                                  <div className="mb-4 flex items-center text-sm dark:text-gray-400 text-gray-600">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {dev.availability}
                                  </div>
                                )}
                              </>
                            ) : (
                              // AI reasons section (only for AI)
                              renderAICardReasons(dev)
                            )}

                            {/* If AI and no explicit compatibility value passed in badge, optionally show it inline */}
                            {isAI && !dev.__aiCompatibility && dev.compatibility && (
                              <div className="mb-4 text-sm dark:text-gray-400 text-gray-600">AI Match: <span className="font-semibold dark:text-white text-gray-900">{dev.compatibility}%</span></div>
                            )}
                          </div>

                          {/* Connect button (works for both AI and non-AI) - Fixed at bottom */}
                          <button
                            className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold transition-all duration-200 text-sm sm:text-base mt-auto ${buttonProps.className} ${!buttonProps.disabled ? 'hover:shadow-lg hover:shadow-[#2563EB]/30 hover:scale-[1.02]' : ''}`}
                            disabled={buttonProps.disabled}
                            onClick={() => handleConnect(dev)}
                          >
                            {buttonProps.text}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Search;

