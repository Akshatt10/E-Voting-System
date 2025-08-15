// import React, { useEffect, useState, useMemo } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import {
//     LayoutDashboard, Plus, User, Clock, Calendar, CheckCircle, XCircle,
//     Loader, AlertCircle, Info, Play, BarChart2, ListTodo, Eye
// } from 'lucide-react';
// import ElectionDetails from '../pages/ElectionDetails'; // --- ADDED: Import details component
// import api from '../utils/interceptor';
// import { socket } from '../utils/socket';

// const Dashboard = () => {
//     const [elections, setElections] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [user, setUser] = useState(null);
//     const [error, setError] = useState('');
//     const navigate = useNavigate();

//     // --- ADDED: State for showing the details view ---
//     const [selectedElectionId, setSelectedElectionId] = useState(null);
//     const [showDetails, setShowDetails] = useState(false);

//     useEffect(() => {
//         const fetchData = async () => {
//             setLoading(true);
//             setError('');

//             try {
//                 // --- 2. Use the new 'api' client. No need to get token or set headers manually. ---
//                 const [userResponse, electionsResponse] = await Promise.all([
//                     api.get('/auth/current-user'),
//                     api.get("/elections/user-elections")
//                 ]);

//                 // --- 3. Axios puts the data directly in a 'data' property ---
//                 setUser(userResponse.data);
//                 setElections(electionsResponse.data.elections || []);

//             } catch (err) {
//                 // The interceptor will handle the 401 redirect automatically.
//                 // This catch block will only handle other errors (e.g., server is down).
//                 console.error("Error fetching dashboard data:", err);
//                 setError(err.response?.data?.message || err.message || "Could not load dashboard data.");
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchData();
//     }, []);

//     // --- ADDED: Handlers for the details view ---
//     const handleViewElection = (electionId) => {
//         setSelectedElectionId(electionId);
//         setShowDetails(true);
//     };

//     const handleBackFromDetails = () => {
//         setShowDetails(false);
//         setSelectedElectionId(null);
//     };

//     const getStatus = (startTime, endTime, status) => {
//         const now = new Date();
//         const start = new Date(startTime);
//         const end = new Date(endTime);
//         if (status === "CANCELLED") return { text: "Cancelled", icon: XCircle, color: "text-red-700", bgColor: "bg-red-50" };
//         if (now < start) return { text: "Scheduled", icon: Calendar, color: "text-blue-700", bgColor: "bg-blue-50" };
//         if (now >= start && now <= end) return { text: "Active", icon: Play, color: "text-green-700", bgColor: "bg-green-50" };
//         return { text: "Completed", icon: CheckCircle, color: "text-slate-600", bgColor: "bg-slate-100" };
//     };

//     const summaryStats = useMemo(() => {
//         const stats = { total: elections.length, active: 0, scheduled: 0, completed: 0 };
//         elections.forEach(e => {
//             const status = getStatus(e.startTime, e.endTime, e.status).text;
//             if (status === 'Active') stats.active++;
//             else if (status === 'Scheduled') stats.scheduled++;
//             else if (status === 'Completed') stats.completed++;
//         });
//         return stats;
//     }, [elections]);

//     const recentActivity = useMemo(() => {
//         return [...elections]
//             .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
//             .slice(0, 5);
//     }, [elections]);

//     if (loading) {
//         return (
//             <div className="flex justify-center items-center h-screen bg-slate-50">
//                 <Loader className="animate-spin text-indigo-600" size={40} />
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="p-8">
//                 <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex items-center">
//                     <AlertCircle className="mr-3" size={24} />
//                     <span>{error}</span>
//                 </div>
//             </div>
//         );
//     }

//     // --- ADDED: Conditional render for the details page ---
//     if (showDetails && selectedElectionId) {
//         return (
//             <ElectionDetails
//                 electionId={selectedElectionId}
//                 onBack={handleBackFromDetails}
//             />
//         );
//     }

//     return (
//         <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
//             <div className="max-w-7xl mx-auto">
//                 {/* Header */}
//                 <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10">
//                     <div>
//                         <h1 className="text-4xl font-bold text-slate-900">
//                             Welcome back, {user ? user.firstname : '...'}!
//                         </h1>
//                         <p className="text-slate-600 mt-2 text-lg">Here's a summary of your voting activities.</p>
//                     </div>
//                     <Link
//                         to="/create-voting"
//                         className="mt-4 sm:mt-0 bg-slate-800 text-white font-semibold py-3 px-5 rounded-lg flex items-center gap-2 hover:bg-slate-900 transition-colors shadow-sm"
//                     >
//                         <Plus size={20} />
//                         Create New Election
//                     </Link>
//                 </header>

//                 {/* Summary Stat Cards */}
//                 <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
//                     <StatCard icon={ListTodo} title="Total Elections" value={summaryStats.total} color="indigo" />
//                     <StatCard icon={Play} title="Active Elections" value={summaryStats.active} color="green" />
//                     <StatCard icon={Calendar} title="Scheduled Elections" value={summaryStats.scheduled} color="blue" />
//                     <StatCard icon={CheckCircle} title="Completed Elections" value={summaryStats.completed} color="slate" />
//                 </section>

//                 {/* Recent Activity Table */}
//                 <section>
//                     <h2 className="text-2xl font-bold text-slate-800 mb-4">Recent Activity</h2>
//                     <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
//                         {recentActivity.length > 0 ? (
//                             <div className="overflow-x-auto">
//                                 <table className="min-w-full divide-y divide-slate-200">
//                                     <thead className="bg-slate-50">
//                                         <tr>
//                                             <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Title of Metting</th>
//                                             <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
//                                             <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Start Date</th>
//                                             <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">End Date</th>
//                                             <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody className="bg-white divide-y divide-slate-200">
//                                         {recentActivity.map(e => {
//                                             const status = getStatus(e.startTime, e.endTime, e.status);
//                                             return (
//                                                 <tr key={e.id} className="hover:bg-slate-50/75 transition-colors">
//                                                     <td className="px-6 py-4 font-medium text-slate-900">{e.title}</td>
//                                                     <td className="px-6 py-4">
//                                                         <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${status.bgColor} ${status.color}`}>
//                                                             <status.icon size={14} />
//                                                             {status.text}
//                                                         </span>
//                                                     </td>
//                                                     <td className="px-6 py-4 text-slate-600">{new Date(e.startTime).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
//                                                     <td className="px-6 py-4 text-slate-600">{new Date(e.endTime).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
//                                                     <td className="px-6 py-4">
//                                                         {status.text === 'Completed' ? (
//                                                             <button onClick={() => navigate(`/election/${e.id}/results`)} className="font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm">
//                                                                 <BarChart2 size={16} /> View Results
//                                                             </button>
//                                                         ) : (
//                                                             // --- MODIFIED: onClick handler ---
//                                                             <button onClick={() => handleViewElection(e.id)} className="font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm">
//                                                                 <Eye size={16} /> View Details
//                                                             </button>
//                                                         )}
//                                                     </td>
//                                                 </tr>
//                                             );
//                                         })}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         ) : (
//                             <div className="text-center text-slate-500 p-12">
//                                 <Info className="mx-auto text-slate-400 mb-2" size={32} />
//                                 <p>You haven't created any meeting yet.</p>
//                                 <Link to="/create-voting" className="text-indigo-600 font-semibold hover:underline mt-2 inline-block">
//                                     Schedule your first meeting 
//                                 </Link>
//                             </div>
//                         )}
//                     </div>
//                 </section>
//             </div>
//         </div>
//     );
// };

// // Helper component for stat cards with a new, cleaner design
// const StatCard = ({ icon: Icon, title, value, color }) => {
//     const colors = {
//         indigo: 'bg-indigo-100 text-indigo-600',
//         green: 'bg-green-100 text-green-600',
//         blue: 'bg-blue-100 text-blue-600',
//         slate: 'bg-slate-100 text-slate-600',
//     };
//     return (
//         <div className="bg-white rounded-xl shadow-sm p-6 ring-1 ring-slate-200">
//             <div className="flex items-center gap-4">
//                 <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colors[color]}`}>
//                     <Icon className="w-6 h-6" />
//                 </div>
//                 <div>
//                     <h3 className="text-sm font-semibold text-slate-500 uppercase">{title}</h3>
//                     <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Dashboard;





import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Plus, User, Clock, Calendar, CheckCircle, XCircle,
    Loader, AlertCircle, Info, Play, BarChart2, ListTodo, Eye
} from 'lucide-react';
import ElectionDetails from '../pages/ElectionDetails';
import api from '../utils/interceptor';
import { socket } from '../utils/socket'; // 1. Import the socket instance

const Dashboard = () => {
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const [selectedElectionId, setSelectedElectionId] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                const [userResponse, electionsResponse] = await Promise.all([
                    api.get('/auth/current-user'),
                    api.get("/elections/user-elections")
                ]);
                setUser(userResponse.data);
                setElections(electionsResponse.data.elections || []);
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                setError(err.response?.data?.message || err.message || "Could not load dashboard data.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- NEW: useEffect for WebSocket connection ---
    useEffect(() => {
        // Only connect if we have a user ID
        if (user?.id) {
            // 1. Connect to the WebSocket server
            socket.connect();

            // 2. Join the user-specific room to receive updates
            socket.emit('joinUserRoom', user.id);

            // 3. Listen for 'electionUpdate' events from the server
            const handleElectionUpdate = (updatedElection) => {
                console.log('Received real-time election update:', updatedElection);
                setElections(prevElections => 
                    prevElections.map(e => 
                        e.id === updatedElection.id ? { ...e, status: updatedElection.status } : e
                    )
                );
            };
            
            socket.on('electionUpdate', handleElectionUpdate);

            // Cleanup function: This runs when the component unmounts
            return () => {
                console.log("Disconnecting socket...");
                socket.off('electionUpdate', handleElectionUpdate); // Remove the specific listener
                socket.disconnect();
            };
        }
    }, [user]); // This effect depends on the user object being loaded

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
        if (now < start && status !== "ONGOING") return { text: "Scheduled", icon: Calendar, color: "text-blue-700", bgColor: "bg-blue-50" };
        if (now >= start && now <= end && status !== "COMPLETED") return { text: "Active", icon: Play, color: "text-green-700", bgColor: "bg-green-50" };
        return { text: "Completed", icon: CheckCircle, color: "text-slate-600", bgColor: "bg-slate-100" };
    };

    const summaryStats = useMemo(() => {
        const stats = { total: elections.length, active: 0, scheduled: 0, completed: 0 };
        elections.forEach(e => {
            const statusText = getStatus(e.startTime, e.endTime, e.status).text;
            if (statusText === 'Active') stats.active++;
            else if (statusText === 'Scheduled') stats.scheduled++;
            else if (statusText === 'Completed') stats.completed++;
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
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Title of Metting</th>
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
                                <p>You haven't created any meeting yet.</p>
                                <Link to="/create-voting" className="text-indigo-600 font-semibold hover:underline mt-2 inline-block">
                                    Schedule your first meeting 
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
