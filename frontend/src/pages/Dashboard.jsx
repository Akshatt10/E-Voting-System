// import React, { useEffect, useState, useCallback } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import {
//   FaVoteYea,
//   FaCalendarAlt,
//   FaTrashAlt,
//   FaCheckCircle,
//   FaPlusCircle,
//   FaClipboardList,
//   FaHourglassHalf,
//   FaGlobe,
//   FaHistory
// } from 'react-icons/fa';
// import { Loader, AlertCircle, Info } from 'lucide-react';

// const Dashboard = () => {
//   const [elections, setElections] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [user, setUser] = useState(null);
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchUser = async () => {
//       const token = localStorage.getItem('accessToken');
//       if (!token) return setError('No token found');

//       try {
//         const res = await fetch('/api/auth/current-user', {
//           headers: {
//             'Authorization': `Bearer ${token}`
//           }
//         });
//         if (!res.ok) throw new Error('Failed to fetch user data');

//         const data = await res.json();
//         setUser(data);
//       } catch (err) {
//         console.error(err);
//         setError('Error loading user profile');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUser();
//   }, []);


//   const fetchElections = useCallback(async () => {
//     setLoading(true);
//     setError('');

//     const accessToken = localStorage.getItem("accessToken");
//     if (!accessToken) {
//       setError("You are not logged in. Please log in to view dashboard data.");
//       setLoading(false);
//       // Optionally redirect to login if not logged in
//       // navigate('/login');
//       return;
//     }

//     try {
//       const res = await fetch("/api/elections/user-elections", {
//         headers: {
//           Authorization: "Bearer " + accessToken,
//         },
//       });
//       if (!res.ok) {
//         let errorData = {};
//         try {
//           errorData = await res.json();
//         } catch (e) {
//           throw new Error(`Server responded with status ${res.status}: ${res.statusText}`);
//         }
//         throw new Error(errorData.message || "Failed to fetch dashboard data.");
//       }
//       const data = await res.json();
//       setElections(data.elections || []);
//     } catch (err) {
//       console.error("Error fetching elections for dashboard:", err);
//       setError(err.message || "Could not load dashboard data.");
//       setElections([]);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // useEffect(() => {
//   //   fetchElections();
//   // }, [fetchElections]);

//   const getElectionStatus = (startTime, endTime, currentStatus) => {
//     const now = new Date();
//     const start = new Date(startTime);
//     const end = new Date(endTime);

//     if (currentStatus === "CANCELLED") {
//       return { text: "Cancelled", color: "red" };
//     } else if (now < start) {
//       return { text: "Scheduled", color: "blue" };
//     } else if (now >= start && now <= end) {
//       return { text: "Active", color: "green" };
//     } else {
//       return { text: "Completed", color: "gray" };
//     }
//   };

//   // Process elections for summary
//   const now = new Date();
//   const activeElections = elections.filter(e => {
//     const status = getElectionStatus(e.startTime, e.endTime, e.status);
//     return status.text === "Active";
//   });
//   const scheduledElections = elections.filter(e => {
//     const status = getElectionStatus(e.startTime, e.endTime, e.status);
//     return status.text === "Scheduled";
//   });
//   const completedElections = elections.filter(e => {
//     const status = getElectionStatus(e.startTime, e.endTime, e.status);
//     return status.text === "Completed";
//   });
//   const cancelledElections = elections.filter(e => {
//     const status = getElectionStatus(e.startTime, e.endTime, e.status);
//     return status.text === "Cancelled";
//   });

//   // Sort and pick recent/upcoming
//   const sortedElections = [...elections].sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
//   const upcomingEvents = sortedElections.filter(e => new Date(e.startTime) > now && getElectionStatus(e.startTime, e.endTime, e.status).text !== "Cancelled").slice(0, 3);
//   const recentCompletedEvents = [...elections].filter(e => getElectionStatus(e.startTime, e.endTime, e.status).text === "Completed")
//                                             .sort((a, b) => new Date(b.endTime) - new Date(a.endTime))
//                                             .slice(0, 3);

//   return (
//     <div className="min-h-screen bg-gray-50 p-6 md:p-8">
//       <div className="max-w-7xl mx-auto">
//         <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

//         {/* Loading and Error States */}
//         {loading && (
//           <div className="flex justify-center items-center h-40">
//             <Loader className="animate-spin text-blue-600" size={36} />
//             <p className="ml-3 text-lg text-gray-700">Loading dashboard data...</p>
//           </div>
//         )}

//         {error && (
//           <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg flex items-center animate-fadeIn">
//             <AlertCircle className="mr-3" size={24} />
//             <span>{error}</span>
//           </div>
//         )}

//         {!loading && !error && (
//           <>
//             {/* Profile Summary */}
//             <section className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
//               <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
//                 <FaCheckCircle className="text-blue-500 mr-2" /> Your Profile
//               </h2>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
//                 <div><strong className="font-medium text-gray-600">Name:</strong> {user ? `${user.firstname} ${user.lastname}` : '...'}</div>
//                 <div><strong className="font-medium text-gray-600">Email:</strong> {user.email}</div>
//                 <div><strong className="font-medium text-gray-600">IBBI No:</strong> {user.IBBI}</div>
//               </div>
//             </section>

//             {/* Voting Event Summary Cards */}
//             <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//               <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex items-center justify-between">
//                 <div>
//                   <h3 className="text-sm font-medium text-gray-500 uppercase mb-1">Total Elections</h3>
//                   <p className="text-3xl font-bold text-gray-900">{elections.length}</p>
//                 </div>
//                 <FaClipboardList className="text-5xl text-blue-400 opacity-20" />
//               </div>
//               <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex items-center justify-between">
//                 <div>
//                   <h3 className="text-sm font-medium text-gray-500 uppercase mb-1">Active Elections</h3>
//                   <p className="text-3xl font-bold text-green-600">{activeElections.length}</p>
//                 </div>
//                 <FaGlobe className="text-5xl text-green-400 opacity-20" />
//               </div>
//               <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex items-center justify-between">
//                 <div>
//                   <h3 className="text-sm font-medium text-gray-500 uppercase mb-1">Scheduled Elections</h3>
//                   <p className="text-3xl font-bold text-blue-600">{scheduledElections.length}</p>
//                 </div>
//                 <FaHourglassHalf className="text-5xl text-blue-400 opacity-20" />
//               </div>
//               <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex items-center justify-between">
//                 <div>
//                   <h3 className="text-sm font-medium text-gray-500 uppercase mb-1">Completed Elections</h3>
//                   <p className="text-3xl font-bold text-gray-600">{completedElections.length}</p>
//                 </div>
//                 <FaHistory className="text-5xl text-gray-400 opacity-20" />
//               </div>
//             </section>

//             {/* Quick Actions and Recent/Upcoming */}
//             <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               {/* Quick Actions */}
//               <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
//                 <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
//                   <FaPlusCircle className="text-purple-500 mr-2" /> Quick Actions
//                 </h2>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <Link
//                     to="/create-voting"
//                     className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200"
//                   >
//                     <FaVoteYea className="text-2xl text-purple-600 mr-3" />
//                     <div>
//                       <h4 className="font-semibold text-gray-800">New Event</h4>
//                       <p className="text-sm text-gray-600">Start a new vote.</p>
//                     </div>
//                   </Link>
//                   <Link
//                     to="/reschedule-voting"
//                     className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200"
//                   >
//                     <FaCalendarAlt className="text-2xl text-purple-600 mr-3" />
//                     <div>
//                       <h4 className="font-semibold text-gray-800">Reschedule</h4>
//                       <p className="text-sm text-gray-600">Change dates.</p>
//                     </div>
//                   </Link>
//                   <Link
//                     to="/cancel-voting"
//                     className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200"
//                   >
//                     <FaTrashAlt className="text-2xl text-purple-600 mr-3" />
//                     <div>
//                       <h4 className="font-semibold text-gray-800">Cancel Event</h4>
//                       <p className="text-sm text-gray-600">Stop a session.</p>
//                     </div>
//                   </Link>
//                   <Link
//                     to="/vote-status"
//                     className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200"
//                   >
//                     <FaCheckCircle className="text-2xl text-purple-600 mr-3" />
//                     <div>
//                       <h4 className="font-semibold text-gray-800">View Status</h4>
//                       <p className="text-sm text-gray-600">Track all events.</p>
//                     </div>
//                   </Link>
//                 </div>
//               </div>

//               {/* Upcoming Events */}
//               <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
//                 <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
//                   <FaCalendarAlt className="text-indigo-500 mr-2" /> Upcoming Events
//                 </h2>
//                 {upcomingEvents.length > 0 ? (
//                   <ul className="space-y-4">
//                     {upcomingEvents.map(event => (
//                       <li key={event.id} className="border-b border-gray-100 pb-2 last:border-b-0 last:pb-0">
//                         <p className="font-medium text-gray-900">{event.title}</p>
//                         <p className="text-sm text-gray-600">Starts: {new Date(event.startTime).toLocaleString()}</p>
//                         <p className="text-xs text-gray-500 line-clamp-1">{event.description}</p>
//                       </li>
//                     ))}
//                   </ul>
//                 ) : (
//                   <div className="text-center text-gray-500 p-4">
//                     <Info className="mx-auto text-gray-400 mb-2" size={32} />
//                     <p>No upcoming events.</p>
//                   </div>
//                 )}
//               </div>
//             </section>
            
//             {/* Recent Completed Events (Optional, can be added if needed) */}
//             {/*
//             <section className="mt-6 bg-white rounded-xl shadow-md p-6 border border-gray-100">
//                 <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
//                     <FaHistory className="text-green-500 mr-2" /> Recently Completed Events
//                 </h2>
//                 {recentCompletedEvents.length > 0 ? (
//                     <ul className="space-y-4">
//                         {recentCompletedEvents.map(event => (
//                             <li key={event.id} className="border-b border-gray-100 pb-2 last:border-b-0 last:pb-0">
//                                 <p className="font-medium text-gray-900">{event.title}</p>
//                                 <p className="text-sm text-gray-600">Ended: {new Date(event.endTime).toLocaleString()}</p>
//                                 <p className="text-xs text-gray-500 line-clamp-1">{event.description}</p>
//                             </li>
//                         ))}
//                     </ul>
//                 ) : (
//                     <div className="text-center text-gray-500 p-4">
//                         <Info className="mx-auto text-gray-400 mb-2" size={32} />
//                         <p>No recently completed events.</p>
//                     </div>
//                 )}
//             </section>
//             */}
//           </>
//         )}
//       </div>
//       <style>{`
//         @keyframes fadeIn {
//           from { opacity: 0; transform: translateY(10px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         .animate-fadeIn {
//           animation: fadeIn 0.3s ease-out;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default Dashboard;


import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaVoteYea,
  FaCalendarAlt,
  FaTrashAlt,
  FaCheckCircle,
  FaPlusCircle,
  FaClipboardList,
  FaHourglassHalf,
  FaGlobe,
  FaHistory
} from 'react-icons/fa';
import { Loader, AlertCircle, Info } from 'lucide-react';

const Dashboard = () => {
  const [elections, setElections] = useState([]);
  const [loadingElections, setLoadingElections] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('No token found');
        setLoadingUser(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/current-user', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error('Failed to fetch user data');

        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Error loading user profile');
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, []);

  // Fetch elections data
  useEffect(() => {
    const fetchElections = async () => {
      setLoadingElections(true);
      setError('');

      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        setError("You are not logged in. Please log in to view dashboard data.");
        setLoadingElections(false);
        return;
      }

      try {
        console.log('Fetching elections...'); // Debug log
        const res = await fetch("/api/elections/user-elections", {
          headers: {
            Authorization: "Bearer " + accessToken,
          },
        });
        
        console.log('Response status:', res.status); // Debug log
        console.log('Response ok:', res.ok); // Debug log
        
        if (!res.ok) {
          let errorData = {};
          try {
            errorData = await res.json();
            console.log('Error response:', errorData); // Debug log
          } catch (e) {
            throw new Error(`Server responded with status ${res.status}: ${res.statusText}`);
          }
          throw new Error(errorData.message || "Failed to fetch dashboard data.");
        }
        
        const data = await res.json();
        console.log('Elections data received:', data); // Debug log
        setElections(data.elections || []);
      } catch (err) {
        console.error("Error fetching elections for dashboard:", err);
        setError(err.message || "Could not load dashboard data.");
        setElections([]);
      } finally {
        setLoadingElections(false);
      }
    };

    fetchElections();
  }, []);

  const getElectionStatus = (startTime, endTime, currentStatus) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (currentStatus === "CANCELLED") {
      return { text: "Cancelled", color: "red" };
    } else if (now < start) {
      return { text: "Scheduled", color: "blue" };
    } else if (now >= start && now <= end) {
      return { text: "Active", color: "green" };
    } else {
      return { text: "Completed", color: "gray" };
    }
  };

  // Process elections for summary
  const now = new Date();
  const activeElections = elections.filter(e => {
    const status = getElectionStatus(e.startTime, e.endTime, e.status);
    return status.text === "Active";
  });
  const scheduledElections = elections.filter(e => {
    const status = getElectionStatus(e.startTime, e.endTime, e.status);
    return status.text === "Scheduled";
  });
  const completedElections = elections.filter(e => {
    const status = getElectionStatus(e.startTime, e.endTime, e.status);
    return status.text === "Completed";
  });
  const cancelledElections = elections.filter(e => {
    const status = getElectionStatus(e.startTime, e.endTime, e.status);
    return status.text === "Cancelled";
  });

  // Sort and pick recent/upcoming
  const sortedElections = [...elections].sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  const upcomingEvents = sortedElections.filter(e => new Date(e.startTime) > now && getElectionStatus(e.startTime, e.endTime, e.status).text !== "Cancelled").slice(0, 3);
  const recentCompletedEvents = [...elections].filter(e => getElectionStatus(e.startTime, e.endTime, e.status).text === "Completed")
                                            .sort((a, b) => new Date(b.endTime) - new Date(a.endTime))
                                            .slice(0, 3);

  // Show loading if either user or elections are still loading
  const isLoading = loadingUser || loadingElections;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

        {/* Loading and Error States */}
        {isLoading && (
          <div className="flex justify-center items-center h-40">
            <Loader className="animate-spin text-blue-600" size={36} />
            <p className="ml-3 text-lg text-gray-700">
              {loadingUser && loadingElections ? 'Loading dashboard data...' : 
               loadingUser ? 'Loading user data...' : 
               'Loading elections...'}
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg flex items-center animate-fadeIn">
            <AlertCircle className="mr-3" size={24} />
            <span>{error}</span>
          </div>
        )}

        {!isLoading && !error && (
          <>
            {/* Profile Summary */}
            <section className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FaCheckCircle className="text-blue-500 mr-2" /> Your Profile
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
                <div><strong className="font-medium text-gray-600">Name:</strong> {user ? `${user.firstname} ${user.lastname}` : '...'}</div>
                <div><strong className="font-medium text-gray-600">Email:</strong> {user?.email || '...'}</div>
                <div><strong className="font-medium text-gray-600">IBBI No:</strong> {user?.IBBI || '...'}</div>
              </div>
            </section>

            {/* Voting Event Summary Cards */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase mb-1">Total Elections</h3>
                  <p className="text-3xl font-bold text-gray-900">{elections.length}</p>
                </div>
                <FaClipboardList className="text-5xl text-blue-400 opacity-20" />
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase mb-1">Active Elections</h3>
                  <p className="text-3xl font-bold text-green-600">{activeElections.length}</p>
                </div>
                <FaGlobe className="text-5xl text-green-400 opacity-20" />
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase mb-1">Scheduled Elections</h3>
                  <p className="text-3xl font-bold text-blue-600">{scheduledElections.length}</p>
                </div>
                <FaHourglassHalf className="text-5xl text-blue-400 opacity-20" />
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase mb-1">Completed Elections</h3>
                  <p className="text-3xl font-bold text-gray-600">{completedElections.length}</p>
                </div>
                <FaHistory className="text-5xl text-gray-400 opacity-20" />
              </div>
            </section>

            {/* Quick Actions and Recent/Upcoming */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <FaPlusCircle className="text-purple-500 mr-2" /> Quick Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link
                    to="/create-voting"
                    className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200"
                  >
                    <FaVoteYea className="text-2xl text-purple-600 mr-3" />
                    <div>
                      <h4 className="font-semibold text-gray-800">New Event</h4>
                      <p className="text-sm text-gray-600">Start a new vote.</p>
                    </div>
                  </Link>
                  <Link
                    to="/reschedule-voting"
                    className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200"
                  >
                    <FaCalendarAlt className="text-2xl text-purple-600 mr-3" />
                    <div>
                      <h4 className="font-semibold text-gray-800">Reschedule</h4>
                      <p className="text-sm text-gray-600">Change dates.</p>
                    </div>
                  </Link>
                  <Link
                    to="/cancel-voting"
                    className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200"
                  >
                    <FaTrashAlt className="text-2xl text-purple-600 mr-3" />
                    <div>
                      <h4 className="font-semibold text-gray-800">Cancel Event</h4>
                      <p className="text-sm text-gray-600">Stop a session.</p>
                    </div>
                  </Link>
                  <Link
                    to="/vote-status"
                    className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200"
                  >
                    <FaCheckCircle className="text-2xl text-purple-600 mr-3" />
                    <div>
                      <h4 className="font-semibold text-gray-800">View Status</h4>
                      <p className="text-sm text-gray-600">Track all events.</p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <FaCalendarAlt className="text-indigo-500 mr-2" /> Upcoming Events
                </h2>
                {upcomingEvents.length > 0 ? (
                  <ul className="space-y-4">
                    {upcomingEvents.map(event => (
                      <li key={event.id} className="border-b border-gray-100 pb-2 last:border-b-0 last:pb-0">
                        <p className="font-medium text-gray-900">{event.title}</p>
                        <p className="text-sm text-gray-600">Starts: {new Date(event.startTime).toLocaleString()}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{event.description}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center text-gray-500 p-4">
                    <Info className="mx-auto text-gray-400 mb-2" size={32} />
                    <p>No upcoming events.</p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;