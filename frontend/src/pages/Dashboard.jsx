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
//   const [loadingElections, setLoadingElections] = useState(true);
//   const [loadingUser, setLoadingUser] = useState(true);
//   const [user, setUser] = useState(null);
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   // Fetch user data
//   useEffect(() => {
//     const fetchUser = async () => {
//       const token = localStorage.getItem('accessToken');
//       if (!token) {
//         setError('No token found');
//         setLoadingUser(false);
//         return;
//       }

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
//         console.error('Error fetching user:', err);
//         setError('Error loading user profile');
//       } finally {
//         setLoadingUser(false);
//       }
//     };

//     fetchUser();
//   }, []);

//   // Fetch elections data
//   useEffect(() => {
//     const fetchElections = async () => {
//       setLoadingElections(true);
//       setError('');

//       const accessToken = localStorage.getItem("accessToken");
//       if (!accessToken) {
//         setError("You are not logged in. Please log in to view dashboard data.");
//         setLoadingElections(false);
//         return;
//       }

//       try {
//         console.log('Fetching elections...'); // Debug log
//         const res = await fetch("/api/elections/user-elections", {
//           headers: {
//             Authorization: "Bearer " + accessToken,
//           },
//         });

//         console.log('Response status:', res.status); // Debug log
//         console.log('Response ok:', res.ok); // Debug log

//         if (!res.ok) {
//           let errorData = {};
//           try {
//             errorData = await res.json();
//             console.log('Error response:', errorData); // Debug log
//           } catch (e) {
//             throw new Error(`Server responded with status ${res.status}: ${res.statusText}`);
//           }
//           throw new Error(errorData.message || "Failed to fetch dashboard data.");
//         }

//         const data = await res.json();
//         console.log('Elections data received:', data); // Debug log
//         setElections(data.elections || []);
//       } catch (err) {
//         console.error("Error fetching elections for dashboard:", err);
//         setError(err.message || "Could not load dashboard data.");
//         setElections([]);
//       } finally {
//         setLoadingElections(false);
//       }
//     };

//     fetchElections();
//   }, []);

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

//   // Show loading if either user or elections are still loading
//   const isLoading = loadingUser || loadingElections;

//   return (
//     <div className="min-h-screen bg-gray-50 p-6 md:p-8">
//       <div className="max-w-7xl mx-auto">
//         <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

//         {/* Loading and Error States */}
//         {isLoading && (
//           <div className="flex justify-center items-center h-40">
//             <Loader className="animate-spin text-blue-600" size={36} />
//             <p className="ml-3 text-lg text-gray-700">
//               {loadingUser && loadingElections ? 'Loading dashboard data...' : 
//                loadingUser ? 'Loading user data...' : 
//                'Loading elections...'}
//             </p>
//           </div>
//         )}

//         {error && (
//           <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg flex items-center animate-fadeIn">
//             <AlertCircle className="mr-3" size={24} />
//             <span>{error}</span>
//           </div>
//         )}

//         {!isLoading && !error && (
//           <>
//             {/* Profile Summary */}
//             <section className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
//               <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
//                 <FaCheckCircle className="text-blue-500 mr-2" /> Your Profile
//               </h2>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
//                 <div><strong className="font-medium text-gray-600">Name:</strong> {user ? `${user.firstname} ${user.lastname}` : '...'}</div>
//                 <div><strong className="font-medium text-gray-600">Email:</strong> {user?.email || '...'}</div>
//                 <div><strong className="font-medium text-gray-600">Reg. No.:</strong> {user?.IBBI || '...'}</div>
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
//                         {/* <p className="text-xs text-gray-500 line-clamp-1">{event.description}</p> */}
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
import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Plus, User, Clock, Calendar, CheckCircle, XCircle,
    Loader, AlertCircle, Info, Play, BarChart2, ListTodo, Eye
} from 'lucide-react';
import ElectionDetails from '../pages/ElectionDetails'; // --- ADDED: Import details component
import api from '../utils/interceptor';

const Dashboard = () => {
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // --- ADDED: State for showing the details view ---
    const [selectedElectionId, setSelectedElectionId] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    // useEffect(() => {
    //     const fetchData = async () => {
    //         setLoading(true);
    //         setError('');
    //         const accessToken = localStorage.getItem("accessToken");
    //         if (!accessToken) {
    //             setError("Authentication failed. Please log in.");
    //             setLoading(false);
    //             return;
    //         }
    //         try {
    //             // Fetch user and elections data in parallel for efficiency
    //             const [userRes, electionsRes] = await Promise.all([
    //                 fetch('/api/auth/current-user', { headers: { 'Authorization': `Bearer ${accessToken}` } }),
    //                 fetch("/api/elections/user-elections", { headers: { 'Authorization': `Bearer ${accessToken}` } })
    //             ]);

    //             if (!userRes.ok) throw new Error('Failed to fetch user data');
    //             const userData = await userRes.json();
    //             setUser(userData);

    //             if (!electionsRes.ok) throw new Error('Failed to fetch elections data');
    //             const electionsData = await electionsRes.json();
    //             setElections(electionsData.elections || []);

    //         } catch (err) {
    //             console.error("Error fetching dashboard data:", err);
    //             setError(err.message || "Could not load dashboard data.");
    //         } finally {
    //             setLoading(false);
    //         }
    //     };
    //     fetchData();
    // }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');

            try {
                // --- 2. Use the new 'api' client. No need to get token or set headers manually. ---
                const [userResponse, electionsResponse] = await Promise.all([
                    api.get('/auth/current-user'),
                    api.get("/elections/user-elections")
                ]);

                // --- 3. Axios puts the data directly in a 'data' property ---
                setUser(userResponse.data);
                setElections(electionsResponse.data.elections || []);

            } catch (err) {
                // The interceptor will handle the 401 redirect automatically.
                // This catch block will only handle other errors (e.g., server is down).
                console.error("Error fetching dashboard data:", err);
                setError(err.response?.data?.message || err.message || "Could not load dashboard data.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- ADDED: Handlers for the details view ---
    const handleViewElection = (electionId) => {
        setSelectedElectionId(electionId);
        setShowDetails(true);
    };

    const handleBackFromDetails = () => {
        setShowDetails(false);
        setSelectedElectionId(null);
    };

    const getStatus = (startTime, endTime, status) => {
        const now = new Date();
        const start = new Date(startTime);
        const end = new Date(endTime);
        if (status === "CANCELLED") return { text: "Cancelled", icon: XCircle, color: "text-red-700", bgColor: "bg-red-50" };
        if (now < start) return { text: "Scheduled", icon: Calendar, color: "text-blue-700", bgColor: "bg-blue-50" };
        if (now >= start && now <= end) return { text: "Active", icon: Play, color: "text-green-700", bgColor: "bg-green-50" };
        return { text: "Completed", icon: CheckCircle, color: "text-slate-600", bgColor: "bg-slate-100" };
    };

    const summaryStats = useMemo(() => {
        const stats = { total: elections.length, active: 0, scheduled: 0, completed: 0 };
        elections.forEach(e => {
            const status = getStatus(e.startTime, e.endTime, e.status).text;
            if (status === 'Active') stats.active++;
            else if (status === 'Scheduled') stats.scheduled++;
            else if (status === 'Completed') stats.completed++;
        });
        return stats;
    }, [elections]);

    const recentActivity = useMemo(() => {
        return [...elections]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
    }, [elections]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-slate-50">
                <Loader className="animate-spin text-indigo-600" size={40} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex items-center">
                    <AlertCircle className="mr-3" size={24} />
                    <span>{error}</span>
                </div>
            </div>
        );
    }

    // --- ADDED: Conditional render for the details page ---
    if (showDetails && selectedElectionId) {
        return (
            <ElectionDetails
                electionId={selectedElectionId}
                onBack={handleBackFromDetails}
            />
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900">
                            Welcome back, {user ? user.firstname : '...'}!
                        </h1>
                        <p className="text-slate-600 mt-2 text-lg">Here's a summary of your voting activities.</p>
                    </div>
                    <Link
                        to="/create-voting"
                        className="mt-4 sm:mt-0 bg-slate-800 text-white font-semibold py-3 px-5 rounded-lg flex items-center gap-2 hover:bg-slate-900 transition-colors shadow-sm"
                    >
                        <Plus size={20} />
                        Create New Election
                    </Link>
                </header>

                {/* Summary Stat Cards */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <StatCard icon={ListTodo} title="Total Elections" value={summaryStats.total} color="indigo" />
                    <StatCard icon={Play} title="Active Elections" value={summaryStats.active} color="green" />
                    <StatCard icon={Calendar} title="Scheduled Elections" value={summaryStats.scheduled} color="blue" />
                    <StatCard icon={CheckCircle} title="Completed Elections" value={summaryStats.completed} color="slate" />
                </section>

                {/* Recent Activity Table */}
                <section>
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Recent Activity</h2>
                    <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
                        {recentActivity.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Election Title</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Start Date</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">End Date</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {recentActivity.map(e => {
                                            const status = getStatus(e.startTime, e.endTime, e.status);
                                            return (
                                                <tr key={e.id} className="hover:bg-slate-50/75 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-slate-900">{e.title}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${status.bgColor} ${status.color}`}>
                                                            <status.icon size={14} />
                                                            {status.text}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600">{new Date(e.startTime).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                                    <td className="px-6 py-4 text-slate-600">{new Date(e.endTime).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                                    <td className="px-6 py-4">
                                                        {status.text === 'Completed' ? (
                                                            <button onClick={() => navigate(`/election/${e.id}/results`)} className="font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm">
                                                                <BarChart2 size={16} /> View Results
                                                            </button>
                                                        ) : (
                                                            // --- MODIFIED: onClick handler ---
                                                            <button onClick={() => handleViewElection(e.id)} className="font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm">
                                                                <Eye size={16} /> View Details
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center text-slate-500 p-12">
                                <Info className="mx-auto text-slate-400 mb-2" size={32} />
                                <p>You haven't created any elections yet.</p>
                                <Link to="/create-voting" className="text-indigo-600 font-semibold hover:underline mt-2 inline-block">
                                    Create your first election
                                </Link>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

// Helper component for stat cards with a new, cleaner design
const StatCard = ({ icon: Icon, title, value, color }) => {
    const colors = {
        indigo: 'bg-indigo-100 text-indigo-600',
        green: 'bg-green-100 text-green-600',
        blue: 'bg-blue-100 text-blue-600',
        slate: 'bg-slate-100 text-slate-600',
    };
    return (
        <div className="bg-white rounded-xl shadow-sm p-6 ring-1 ring-slate-200">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colors[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase">{title}</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

