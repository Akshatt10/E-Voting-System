// import React, { useEffect, useState, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Clock, CheckCircle, XCircle, Loader, Calendar, Info, AlertCircle, Eye, Edit,
//   Play, CalendarClock, BarChart2
// } from "lucide-react";

// // Import the ElectionDetails component
// import ElectionDetails from '../pages/ElectionDetails'; // Adjust path as needed

// const VoteStatus = () => {
//   const [elections, setElections] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [expandedRow, setExpandedRow] = useState(null);
//   const [candidatesMap, setCandidatesMap] = useState({});
//   const [resendingEmail, setResendingEmail] = useState(null);
//   const [emailResendStatus, setEmailResendStatus] = useState({ success: false, message: "" });
//   const [currentTime, setCurrentTime] = useState(new Date());

//   // New state for handling details view
//   const [selectedElectionId, setSelectedElectionId] = useState(null);
//   const [showDetails, setShowDetails] = useState(false);

//   const navigate = useNavigate();

//   const fetchElections = useCallback(async () => {
//     setLoading(true);
//     setError("");
//     const accessToken = localStorage.getItem("accessToken");
//     if (!accessToken) {
//       setError("You are not logged in. Please log in to view election status.");
//       setLoading(false);
//       return;
//     }
//     try {
//       const res = await fetch("/api/elections/user-elections", {
//         headers: { Authorization: "Bearer " + accessToken },
//       });
//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(errorData.message || "Failed to fetch elections");
//       }
//       const data = await res.json();
//       setElections(data.elections || []);
//     } catch (err) {
//       setError(err.message || "Could not load elections.");
//       setElections([]);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const fetchCandidates = async (electionId) => {
//     try {
//       const accessToken = localStorage.getItem("accessToken");
//       const res = await fetch(`/api/elections/candidates/${electionId}`, {
//         headers: { Authorization: "Bearer " + accessToken },
//       });
//       if (!res.ok) throw new Error("Failed to fetch candidates.");

//       const data = await res.json();
//       setCandidatesMap(prev => ({
//         ...prev,
//         [electionId]: data.candidates.map(c => ({ ...c, selected: false }))
//       }));
//     } catch (error) {
//       console.error("Candidate fetch error:", error);
//       setCandidatesMap(prev => ({ ...prev, [electionId]: [] }));
//     }
//   };

//   const handleResendEmail = async (electionId, candidateEmail) => {
//     if (!candidateEmail) {
//       setEmailResendStatus({ success: false, message: "Candidate email is missing." });
//       setTimeout(() => setEmailResendStatus({ success: false, message: "" }), 5000);
//       return;
//     }

//     setResendingEmail(candidateEmail);
//     setEmailResendStatus({ success: false, message: "" });

//     const accessToken = localStorage.getItem("accessToken");
//     if (!accessToken) {
//       setEmailResendStatus({ success: false, message: "Authentication failed. Please log in." });
//       setResendingEmail(null);
//       return;
//     }

//     try {
//       const res = await fetch(`/api/elections/resend-email/${electionId}`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: "Bearer " + accessToken,
//         },
//         body: JSON.stringify({ candidateEmail: candidateEmail }),
//       });

//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(errorData.message || "Failed to send email.");
//       }

//       const data = await res.json();
//       setEmailResendStatus({ success: true, message: data.message || "Email resent successfully!" });
//     } catch (err) {
//       console.error("Error resending email:", err);
//       setEmailResendStatus({ success: false, message: err.message || "Failed to resend email." });
//     } finally {
//       setResendingEmail(null);
//       setTimeout(() => setEmailResendStatus({ success: false, message: "" }), 5000);
//     }
//   };

//   // Handle view election details
//   const handleViewElection = (electionId) => {
//     setSelectedElectionId(electionId);
//     setShowDetails(true);
//   };

//   // Handle back from details view
//   const handleBackFromDetails = () => {
//     setShowDetails(false);
//     setSelectedElectionId(null);
//   };

//   const handleViewResults = (electionId) => {
//     navigate(`/election/${electionId}/results`);
//   };

//   useEffect(() => {
//     fetchElections();
//     const interval = setInterval(fetchElections, 60000);
//     return () => clearInterval(interval);
//   }, [fetchElections]);

//   useEffect(() => {
//     const interval = setInterval(() => setCurrentTime(new Date()), 1000);
//     return () => clearInterval(interval);
//   }, []);

//   const getElectionStatus = (startTime, endTime, currentStatus) => {
//     const now = currentTime;
//     const start = new Date(startTime);
//     const end = new Date(endTime);

//     if (currentStatus === "CANCELLED") {
//       return {
//         text: "Cancelled",
//         color: "red",
//         bgColor: "bg-red-100",
//         textColor: "text-red-800",
//         icon: XCircle,
//         pulseClass: ""
//       };
//     }

//     if (now < start) {
//       return {
//         text: "Scheduled",
//         color: "blue",
//         bgColor: "bg-blue-100",
//         textColor: "text-blue-800",
//         icon: CalendarClock,
//         pulseClass: ""
//       };
//     } else if (now >= start && now <= end) {
//       return {
//         text: "Ongoing",
//         color: "orange",
//         bgColor: "bg-orange-100",
//         textColor: "text-orange-800",
//         icon: Play,
//         pulseClass: "animate-pulse"
//       };
//     } else if (now > end) {
//       return {
//         text: "Completed",
//         color: "green",
//         bgColor: "bg-green-100",
//         textColor: "text-green-800",
//         icon: CheckCircle,
//         pulseClass: ""
//       };
//     }

//     return {
//       text: "Unknown",
//       color: "gray",
//       bgColor: "bg-gray-100",
//       textColor: "text-gray-800",
//       icon: Info,
//       pulseClass: ""
//     };
//   };

//   const formatDateTime = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-GB', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric'
//     }) + ' | ' + date.toLocaleTimeString('en-US', {
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: false
//     });
//   };

//   // If showing details, render the ElectionDetails component
//   if (showDetails && selectedElectionId) {
//     return (
//       <ElectionDetails
//         electionId={selectedElectionId}
//         onBack={handleBackFromDetails}
//       />
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">Vote Status</h1>
//           <p className="text-gray-600">Track and manage all your voting events and meetings</p>
//         </div>

//         {loading && (
//           <div className="flex justify-center items-center h-40">
//             <Loader className="animate-spin text-indigo-600" size={36} />
//             <p className="ml-3 text-lg text-gray-700">Loading elections...</p>
//           </div>
//         )}

//         {error && (
//           <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-center">
//             <AlertCircle className="text-red-500 mr-3" size={24} />
//             <span className="text-red-700 font-medium">{error}</span>
//           </div>
//         )}

//         {emailResendStatus.message && (
//           <div className={`mb-6 p-4 ${emailResendStatus.success ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'} border-l-4 rounded-lg flex items-center`}>
//             {emailResendStatus.success ? <CheckCircle className="text-green-500 mr-3" size={24} /> : <AlertCircle className="text-red-500 mr-3" size={24} />}
//             <span className={`${emailResendStatus.success ? 'text-green-700' : 'text-red-700'} font-medium`}>{emailResendStatus.message}</span>
//           </div>
//         )}

//         {!loading && !error && elections.length > 0 && (
//           <div className="bg-white rounded-lg shadow overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sr No</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name of Matter</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title of Meeting</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details of COC Members</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date & Time</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date & Time</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {elections.map((item, index) => {
//                     const status = getElectionStatus(item.startTime, item.endTime, item.status);
//                     return (
//                       <React.Fragment key={item.id}>
//                         <tr className="hover:bg-gray-50">
//                           <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
//                           <td className="px-6 py-4 text-sm text-gray-900">{item.Matter}</td>
//                           <td className="px-6 py-4 text-sm text-gray-900">{item.title}</td>
//                           <td className="px-6 py-4 text-sm text-gray-900">
//                             <button
//                               onClick={async () => {
//                                 const alreadyOpen = expandedRow === item.id;
//                                 setExpandedRow(alreadyOpen ? null : item.id);
//                                 if (!alreadyOpen && !candidatesMap[item.id]) {
//                                   await fetchCandidates(item.id);
//                                 }
//                               }}
//                               className="bg-black text-white px-3 py-1 rounded text-xs hover:bg-gray-800"
//                             >
//                               Click Here
//                             </button>
//                           </td>
//                           <td className="px-6 py-4 text-sm text-gray-500">{formatDateTime(item.startTime)}</td>
//                           <td className="px-6 py-4 text-sm text-gray-500">{formatDateTime(item.endTime)}</td>
//                           <td className="px-6 py-4">
//                             {status.text === "Completed" ? (
//                               <button
//                                 onClick={() => handleViewResults(item.id)}
//                                 className="bg-green-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-green-700 transition-colors flex items-center gap-1"
//                               >
//                                 <BarChart2 size={12} />
//                                 View Results
//                               </button>
//                             ) : (
//                               <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.bgColor} ${status.textColor}`}>
//                                 {status.text}
//                               </span>
//                             )}
//                           </td>
                          
//                           <td className="px-10 py-4 text-sm flex items-center gap-2">
//                              <button onClick={() => handleViewElection(item.id)} className="text-blue-600 hover:text-blue-800"><Eye size={16} /></button>
                             
//                           </td>
//                         </tr>

//                         {expandedRow === item.id && (
//                           <tr className="bg-gray-50 border-t">
//                             <td colSpan="9" className="p-4">
//                               {candidatesMap[item.id] ? (
//                                 candidatesMap[item.id].length > 0 ? (
//                                   <div className="overflow-x-auto">
//                                     <table className="min-w-full text-sm border rounded-md">
//                                       {/* This is the full table from your original code */}
//                                       <thead className="bg-gray-100 text-xs text-gray-700 uppercase">
//                                         <tr>
//                                           <th className="px-4 py-2 border">Sr No</th>
//                                           <th className="px-4 py-2 border">Name</th>
//                                           <th className="px-4 py-2 border">Email</th>
//                                           <th className="px-4 py-2 border">Share</th>
//                                           <th className="px-4 py-2 border">Actions</th>
//                                         </tr>
//                                       </thead>
//                                       <tbody>
//                                         {candidatesMap[item.id].map((cand, idx) => (
//                                           <tr key={cand.id} className="bg-white border-t">
//                                             <td className="px-4 py-2 border">{idx + 1}</td>
//                                             <td className="px-4 py-2 border">{cand.name}</td>
//                                             <td className="px-4 py-2 border">{cand.email}</td>
//                                             <td className="px-4 py-2 border">{cand.share}%</td>
//                                             <td className="px-4 py-2 border">
//                                               <button
//                                                 onClick={() => handleResendEmail(item.id, cand.email)}
//                                                 className="bg-blue-400 hover:bg-blue-500 text-black font-semibold py-1 px-3 rounded text-xs"
//                                                 disabled={resendingEmail === cand.email}
//                                               >
//                                                 {resendingEmail === cand.email ? 'Sending...' : 'Resend Email'}
//                                               </button>
//                                             </td>
//                                           </tr>
//                                         ))}
//                                       </tbody>
//                                     </table>
//                                   </div>
//                                 ) : (
//                                   <div className="text-gray-600">No candidates found for this election.</div>
//                                 )
//                               ) : (
//                                 <div className="flex justify-center items-center"><Loader className="animate-spin text-indigo-600" /></div>
//                               )}
//                             </td>
//                           </tr>
//                         )}
//                       </React.Fragment>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default VoteStatus


import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Clock, CheckCircle, XCircle, Loader, CalendarClock, AlertCircle,
    Eye, Play, BarChart2
} from "lucide-react";
import ElectionDetails from '../pages/ElectionDetails';
import api from '../utils/interceptor';
import { socket } from '../utils/socket';

const VoteStatus = () => {
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expandedRow, setExpandedRow] = useState(null);
    const [candidatesMap, setCandidatesMap] = useState({});
    const [resendingEmail, setResendingEmail] = useState(null);
    const [emailResendStatus, setEmailResendStatus] = useState({ success: false, message: "" });

    const [selectedElectionId, setSelectedElectionId] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [user, setUser] = useState(null);

    const navigate = useNavigate();

    // Status colors/icons from DB status
    const getElectionStatus = (dbStatus) => {
        switch (dbStatus) {
            case "ONGOING":
                return { text: "Ongoing", icon: Play, bgColor: "bg-orange-100", textColor: "text-orange-800", pulseClass: "animate-pulse" };
            case "COMPLETED":
                return { text: "Completed", icon: CheckCircle, bgColor: "bg-green-100", textColor: "text-green-800" };
            case "CANCELLED":
                return { text: "Cancelled", icon: XCircle, bgColor: "bg-red-100", textColor: "text-red-800" };
            case "SCHEDULED":
            default:
                return { text: "Scheduled", icon: CalendarClock, bgColor: "bg-blue-100", textColor: "text-blue-800" };
        }
    };

    // Connect socket & fetch data
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                setError("");
                const [userRes, electionsRes] = await Promise.all([
                    api.get('/auth/current-user'),
                    api.get('/elections/user-elections')
                ]);
                setUser(userRes.data);
                setElections(electionsRes.data.elections || []);
            } catch (err) {
                setError(err.message || "Could not load data.");
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // WebSocket connection for real-time updates
    useEffect(() => {
        if (!user?.id) return;

        socket.connect();
        socket.emit('joinUserRoom', user.id);

        const handleElectionUpdate = (updatedElection) => {
            console.log('Received real-time election update:', updatedElection);
            setElections(prev =>
                prev.map(e =>
                    e.id === updatedElection.id ? { ...e, ...updatedElection } : e
                )
            );
        };

        socket.on('electionUpdate', handleElectionUpdate);

        return () => {
            socket.off('electionUpdate', handleElectionUpdate);
            socket.disconnect();
        };
    }, [user]);

    const fetchCandidates = async (electionId) => {
        try {
            const res = await api.get(`/elections/candidates/${electionId}`);
            setCandidatesMap(prev => ({
                ...prev,
                [electionId]: res.data.candidates.map(c => ({ ...c, selected: false }))
            }));
        } catch (error) {
            console.error("Candidate fetch error:", error);
            setCandidatesMap(prev => ({ ...prev, [electionId]: [] }));
        }
    };

    const handleResendEmail = async (electionId, candidateEmail) => {
        if (!candidateEmail) {
            setEmailResendStatus({ success: false, message: "Candidate email is missing." });
            setTimeout(() => setEmailResendStatus({ success: false, message: "" }), 5000);
            return;
        }
        setResendingEmail(candidateEmail);
        setEmailResendStatus({ success: false, message: "" });
        try {
            const res = await api.post(`/elections/resend-email/${electionId}`, { candidateEmail });
            setEmailResendStatus({ success: true, message: res.data.message || "Email resent successfully!" });
        } catch (err) {
            console.error("Error resending email:", err);
            setEmailResendStatus({ success: false, message: err.response?.data?.message || "Failed to resend email." });
        } finally {
            setResendingEmail(null);
            setTimeout(() => setEmailResendStatus({ success: false, message: "" }), 5000);
        }
    };

    const handleViewElection = (electionId) => {
        setSelectedElectionId(electionId);
        setShowDetails(true);
    };

    const handleBackFromDetails = () => {
        setShowDetails(false);
        setSelectedElectionId(null);
    };

    const handleViewResults = (electionId) => {
        navigate(`/election/${electionId}/results`);
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        }) + ' | ' + date.toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit', hour12: false
        });
    };

    if (showDetails && selectedElectionId) {
        return <ElectionDetails electionId={selectedElectionId} onBack={handleBackFromDetails} />;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Vote Status</h1>
                    <p className="text-gray-600">Track and manage all your voting events and meetings in real-time.</p>
                </div>

                {loading && (
                    <div className="flex justify-center items-center h-40">
                        <Loader className="animate-spin text-indigo-600" size={36} />
                        <p className="ml-3 text-lg text-gray-700">Loading elections...</p>
                    </div>
                )}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-center">
                        <AlertCircle className="text-red-500 mr-3" size={24} />
                        <span className="text-red-700 font-medium">{error}</span>
                    </div>
                )}
                {emailResendStatus.message && (
                    <div className={`mb-6 p-4 ${emailResendStatus.success ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'} border-l-4 rounded-lg flex items-center`}>
                        {emailResendStatus.success ? <CheckCircle className="text-green-500 mr-3" size={24} /> : <AlertCircle className="text-red-500 mr-3" size={24} />}
                        <span className={`${emailResendStatus.success ? 'text-green-700' : 'text-red-700'} font-medium`}>{emailResendStatus.message}</span>
                    </div>
                )}

                {!loading && !error && elections.length > 0 && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sr No</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name of Matter</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title of Meeting</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details of COC Members</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date & Time</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date & Time</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {elections.map((item, index) => {
                                        const status = getElectionStatus(item.status);
                                        return (
                                            <React.Fragment key={item.id}>
                                                <tr className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">{item.Matter}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">{item.title}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">
                                                        <button
                                                            onClick={async () => {
                                                                const alreadyOpen = expandedRow === item.id;
                                                                setExpandedRow(alreadyOpen ? null : item.id);
                                                                if (!alreadyOpen && !candidatesMap[item.id]) {
                                                                    await fetchCandidates(item.id);
                                                                }
                                                            }}
                                                            className="bg-black text-white px-3 py-1 rounded text-xs hover:bg-gray-800"
                                                        >
                                                            Click Here
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">{formatDateTime(item.startTime)}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">{formatDateTime(item.endTime)}</td>
                                                    <td className="px-6 py-4">
                                                        {status.text === "Completed" ? (
                                                            <button
                                                                onClick={() => handleViewResults(item.id)}
                                                                className="bg-green-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-green-700 transition-colors flex items-center gap-1"
                                                            >
                                                                <BarChart2 size={12} />
                                                                View Results
                                                            </button>
                                                        ) : (
                                                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-full ${status.bgColor} ${status.textColor} ${status.pulseClass || ''}`}>
                                                                <status.icon size={14} />
                                                                {status.text}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-10 py-4 text-sm flex items-center gap-2">
                                                        <button onClick={() => handleViewElection(item.id)} className="text-blue-600 hover:text-blue-800"><Eye size={16} /></button>
                                                    </td>
                                                </tr>
                                                {expandedRow === item.id && (
                                                    <tr className="bg-gray-50 border-t">
                                                        <td colSpan="8" className="p-4">
                                                            {candidatesMap[item.id] ? (
                                                                candidatesMap[item.id].length > 0 ? (
                                                                    <div className="overflow-x-auto">
                                                                        <table className="min-w-full text-sm border rounded-md">
                                                                            <thead className="bg-gray-100 text-xs text-gray-700 uppercase">
                                                                                <tr>
                                                                                    <th className="px-4 py-2 border">Sr No</th>
                                                                                    <th className="px-4 py-2 border">Name</th>
                                                                                    <th className="px-4 py-2 border">Email</th>
                                                                                    <th className="px-4 py-2 border">Share</th>
                                                                                    <th className="px-4 py-2 border">Actions</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {candidatesMap[item.id].map((cand, idx) => (
                                                                                    <tr key={cand.id} className="bg-white border-t">
                                                                                        <td className="px-4 py-2 border">{idx + 1}</td>
                                                                                        <td className="px-4 py-2 border">{cand.name}</td>
                                                                                        <td className="px-4 py-2 border">{cand.email}</td>
                                                                                        <td className="px-4 py-2 border">{cand.share}%</td>
                                                                                        <td className="px-4 py-2 border">
                                                                                            <button
                                                                                                onClick={() => handleResendEmail(item.id, cand.email)}
                                                                                                className="bg-blue-400 hover:bg-blue-500 text-black font-semibold py-1 px-3 rounded text-xs"
                                                                                                disabled={resendingEmail === cand.email}
                                                                                            >
                                                                                                {resendingEmail === cand.email ? 'Sending...' : 'Resend Email'}
                                                                                            </button>
                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                ) : (<div className="text-gray-600">No candidates found.</div>)
                                                            ) : (<div className="flex justify-center items-center"><Loader className="animate-spin text-indigo-600" /></div>)}
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VoteStatus;
