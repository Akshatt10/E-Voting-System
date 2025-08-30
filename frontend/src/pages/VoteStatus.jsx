// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//     Clock, CheckCircle, XCircle, Loader, CalendarClock, AlertCircle,
//     Eye, Play, BarChart2
// } from "lucide-react";
// import ElectionDetails from '../pages/ElectionDetails';
// import api from '../utils/interceptor';
// import { socket } from '../utils/socket';

// const VoteStatus = () => {
//     const [elections, setElections] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");
//     const [expandedRow, setExpandedRow] = useState(null);
//     const [candidatesMap, setCandidatesMap] = useState({});
//     const [resendingEmail, setResendingEmail] = useState(null);
//     const [emailResendStatus, setEmailResendStatus] = useState({ success: false, message: "" });

//     const [selectedElectionId, setSelectedElectionId] = useState(null);
//     const [showDetails, setShowDetails] = useState(false);
//     const [user, setUser] = useState(null);

//     const navigate = useNavigate();

//     // Status colors/icons from DB status
//     const getElectionStatus = (dbStatus) => {
//         switch (dbStatus) {
//             case "ONGOING":
//                 return { text: "Ongoing", icon: Play, bgColor: "bg-orange-100", textColor: "text-orange-800", pulseClass: "animate-pulse" };
//             case "COMPLETED":
//                 return { text: "Completed", icon: CheckCircle, bgColor: "bg-green-100", textColor: "text-green-800" };
//             case "CANCELLED":
//                 return { text: "Cancelled", icon: XCircle, bgColor: "bg-red-100", textColor: "text-red-800" };
//             case "SCHEDULED":
//             default:
//                 return { text: "Scheduled", icon: CalendarClock, bgColor: "bg-blue-100", textColor: "text-blue-800" };
//         }
//     };

//     // Connect socket & fetch data
//     useEffect(() => {
//         const fetchInitialData = async () => {
//             try {
//                 setLoading(true);
//                 setError("");
//                 const [userRes, electionsRes] = await Promise.all([
//                     api.get('/auth/current-user'),
//                     api.get('/elections/user-elections')
//                 ]);
//                 setUser(userRes.data);
//                 setElections(electionsRes.data.elections || []);
//             } catch (err) {
//                 setError(err.message || "Could not load data.");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchInitialData();
//     }, []);

//     // WebSocket connection for real-time updates
//     useEffect(() => {
//         if (!user?.id) return;

//         socket.connect();
//         socket.emit('joinUserRoom', user.id);

//         const handleElectionUpdate = (updatedElection) => {
//             console.log('Received real-time election update:', updatedElection);
//             setElections(prev =>
//                 prev.map(e =>
//                     e.id === updatedElection.id ? { ...e, ...updatedElection } : e
//                 )
//             );
//         };

//         socket.on('electionUpdate', handleElectionUpdate);

//         return () => {
//             socket.off('electionUpdate', handleElectionUpdate);
//             socket.disconnect();
//         };
//     }, [user]);

//     const fetchCandidates = async (electionId) => {
//         try {
//             const res = await api.get(`/elections/candidates/${electionId}`);
//             setCandidatesMap(prev => ({
//                 ...prev,
//                 [electionId]: res.data.candidates.map(c => ({ ...c, selected: false }))
//             }));
//         } catch (error) {
//             console.error("Candidate fetch error:", error);
//             setCandidatesMap(prev => ({ ...prev, [electionId]: [] }));
//         }
//     };

//     const handleResendEmail = async (electionId, candidateEmail) => {
//         if (!candidateEmail) {
//             setEmailResendStatus({ success: false, message: "Candidate email is missing." });
//             setTimeout(() => setEmailResendStatus({ success: false, message: "" }), 5000);
//             return;
//         }
//         setResendingEmail(candidateEmail);
//         setEmailResendStatus({ success: false, message: "" });
//         try {
//             const res = await api.post(`/elections/resend-email/${electionId}`, { candidateEmail });
//             setEmailResendStatus({ success: true, message: res.data.message || "Email resent successfully!" });
//         } catch (err) {
//             console.error("Error resending email:", err);
//             setEmailResendStatus({ success: false, message: err.response?.data?.message || "Failed to resend email." });
//         } finally {
//             setResendingEmail(null);
//             setTimeout(() => setEmailResendStatus({ success: false, message: "" }), 5000);
//         }
//     };

//     const handleViewElection = (electionId) => {
//         setSelectedElectionId(electionId);
//         setShowDetails(true);
//     };

//     const handleBackFromDetails = () => {
//         setShowDetails(false);
//         setSelectedElectionId(null);
//     };

//     const handleViewResults = (electionId) => {
//         navigate(`/election/${electionId}/results`);
//     };

//     const formatDateTime = (dateString) => {
//         const date = new Date(dateString);

//         return date.toLocaleDateString('en-GB', {
//             day: '2-digit',
//             month: 'short',
//             year: 'numeric',
//             timeZone: 'Asia/Kolkata'
//         }) + ' | ' + date.toLocaleTimeString('en-US', {
//             hour: '2-digit',
//             minute: '2-digit',
//             hour12: false,
//             timeZone: 'Asia/Kolkata'
//         });
//     };


//     if (showDetails && selectedElectionId) {
//         return <ElectionDetails electionId={selectedElectionId} onBack={handleBackFromDetails} />;
//     }

//     return (
//         <div className="min-h-screen bg-gray-50 p-6">
//             <div className="max-w-7xl mx-auto">
//                 <div className="mb-8">
//                     <h1 className="text-3xl font-bold text-gray-900 mb-2">Vote Status</h1>
//                     <p className="text-gray-600">Track and manage all your voting events and meetings in real-time.</p>
//                 </div>

//                 {loading && (
//                     <div className="flex justify-center items-center h-40">
//                         <Loader className="animate-spin text-indigo-600" size={36} />
//                         <p className="ml-3 text-lg text-gray-700">Loading elections...</p>
//                     </div>
//                 )}
//                 {error && (
//                     <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-center">
//                         <AlertCircle className="text-red-500 mr-3" size={24} />
//                         <span className="text-red-700 font-medium">{error}</span>
//                     </div>
//                 )}
//                 {emailResendStatus.message && (
//                     <div className={`mb-6 p-4 ${emailResendStatus.success ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'} border-l-4 rounded-lg flex items-center`}>
//                         {emailResendStatus.success ? <CheckCircle className="text-green-500 mr-3" size={24} /> : <AlertCircle className="text-red-500 mr-3" size={24} />}
//                         <span className={`${emailResendStatus.success ? 'text-green-700' : 'text-red-700'} font-medium`}>{emailResendStatus.message}</span>
//                     </div>
//                 )}

//                 {!loading && !error && elections.length > 0 && (
//                     <div className="bg-white rounded-lg shadow overflow-hidden">
//                         <div className="overflow-x-auto">
//                             <table className="min-w-full divide-y divide-gray-200 text-xs">
//                                 <thead className="bg-gray-50">
//                                     <tr>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sr No</th>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name of Matter</th>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title of Meeting</th>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details of COC Members</th>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date & Time</th>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date & Time</th>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="bg-white divide-y divide-gray-200">
//                                     {elections.map((item, index) => {
//                                         const status = getElectionStatus(item.status);
//                                         return (
//                                             <React.Fragment key={item.id}>
//                                                 <tr className="hover:bg-gray-50">
//                                                     <td className="px-6 py-4 text-xs text-gray-900">{index + 1}</td>
//                                                     <td className="px-6 py-4 text-xs text-gray-900">{item.Matter}</td>
//                                                     <td className="px-6 py-4 text-xs text-gray-900">{item.title}</td>
//                                                     <td className="px-6 py-4 text-xs text-gray-900">
//                                                         <button
//                                                             onClick={async () => {
//                                                                 const alreadyOpen = expandedRow === item.id;
//                                                                 setExpandedRow(alreadyOpen ? null : item.id);
//                                                                 if (!alreadyOpen && !candidatesMap[item.id]) {
//                                                                     await fetchCandidates(item.id);
//                                                                 }
//                                                             }}
//                                                             className="bg-black text-white px-3 py-1 rounded text-xs hover:bg-gray-800"
//                                                         >
//                                                             Click Here
//                                                         </button>
//                                                     </td>
//                                                     <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
//                                                         {formatDateTime(item.startTime)}
//                                                     </td>
//                                                     <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
//                                                         {formatDateTime(item.endTime)}
//                                                     </td>
//                                                     <td className="px-6 py-4">
//                                                         {status.text === "Completed" ? (
//                                                             <button
//                                                                 onClick={() => handleViewResults(item.id)}
//                                                                 className="bg-green-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-green-700 transition-colors flex items-center gap-1"
//                                                             >
//                                                                 <BarChart2 size={12} />
//                                                                 View Results
//                                                             </button>
//                                                         ) : (
//                                                             <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-full ${status.bgColor} ${status.textColor} ${status.pulseClass || ''}`}>
//                                                                 <status.icon size={14} />
//                                                                 {status.text}
//                                                             </span>
//                                                         )}
//                                                     </td>
//                                                     <td className="px-10 py-4 text-xs flex items-center gap-2">
//                                                         <button onClick={() => handleViewElection(item.id)} className="text-blue-600 hover:text-blue-800"><Eye size={16} /></button>
//                                                     </td>
//                                                 </tr>
//                                                 {expandedRow === item.id && (
//                                                     <tr className="bg-gray-50 border-t">
//                                                         <td colSpan="8" className="p-4">
//                                                             {candidatesMap[item.id] ? (
//                                                                 candidatesMap[item.id].length > 0 ? (
//                                                                     <div className="overflow-x-auto">
//                                                                         <table className="min-w-full text-xs border rounded-md">
//                                                                             <thead className="bg-gray-100 text-xs text-gray-700 uppercase">
//                                                                                 <tr>
//                                                                                     <th className="px-4 py-2 border">Sr No</th>
//                                                                                     <th className="px-4 py-2 border">Name</th>
//                                                                                     <th className="px-4 py-2 border">Email</th>
//                                                                                     <th className="px-4 py-2 border">Share</th>
//                                                                                     <th className="px-4 py-2 border">Actions</th>
//                                                                                 </tr>
//                                                                             </thead>
//                                                                             <tbody>
//                                                                                 {candidatesMap[item.id].map((cand, idx) => (
//                                                                                     <tr key={cand.id} className="bg-white border-t">
//                                                                                         <td className="px-4 py-2 border">{idx + 1}</td>
//                                                                                         <td className="px-4 py-2 border">{cand.name}</td>
//                                                                                         <td className="px-4 py-2 border">{cand.email}</td>
//                                                                                         <td className="px-4 py-2 border">{cand.share}%</td>
//                                                                                         <td className="px-4 py-2 border">
//                                                                                             <button
//                                                                                                 onClick={() => handleResendEmail(item.id, cand.email)}
//                                                                                                 className="bg-blue-400 hover:bg-blue-500 text-black font-semibold py-1 px-3 rounded text-xs"
//                                                                                                 disabled={resendingEmail === cand.email}
//                                                                                             >
//                                                                                                 {resendingEmail === cand.email ? 'Sending...' : 'Resend Email'}
//                                                                                             </button>
//                                                                                         </td>
//                                                                                     </tr>
//                                                                                 ))}
//                                                                             </tbody>
//                                                                         </table>
//                                                                     </div>
//                                                                 ) : (<div className="text-gray-600">No candidates found.</div>)
//                                                             ) : (<div className="flex justify-center items-center"><Loader className="animate-spin text-indigo-600" /></div>)}
//                                                         </td>
//                                                     </tr>
//                                                 )}
//                                             </React.Fragment>
//                                         );
//                                     })}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default VoteStatus;




// import React, { useEffect, useState, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//     Clock, CheckCircle, XCircle, Loader, CalendarClock, AlertCircle,
//     Eye, Play, BarChart2
// } from "lucide-react";
// import ElectionDetails from '../pages/ElectionDetails';
// import api from '../utils/interceptor';
// import { socket } from '../utils/socket';

// const VoteStatus = () => {
//     const [elections, setElections] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");
//     const [expandedRow, setExpandedRow] = useState(null);
//     const [candidatesMap, setCandidatesMap] = useState({});
//     const [resendingEmail, setResendingEmail] = useState(null);
//     const [emailResendStatus, setEmailResendStatus] = useState({ success: false, message: "" });
//     const [selectedElectionId, setSelectedElectionId] = useState(null);
//     const [showDetails, setShowDetails] = useState(false);
//     const [user, setUser] = useState(null);
//     const navigate = useNavigate();

//     const getElectionStatus = (dbStatus) => {
//         switch (dbStatus) {
//             case "ONGOING":
//                 return { text: "Ongoing", icon: Play, bgColor: "bg-orange-100", textColor: "text-orange-800", pulseClass: "animate-pulse" };
//             case "COMPLETED":
//                 return { text: "Completed", icon: CheckCircle, bgColor: "bg-green-100", textColor: "text-green-800" };
//             case "CANCELLED":
//                 return { text: "Cancelled", icon: XCircle, bgColor: "bg-red-100", textColor: "text-red-800" };
//             case "SCHEDULED":
//             default:
//                 return { text: "Scheduled", icon: CalendarClock, bgColor: "bg-blue-100", textColor: "text-blue-800" };
//         }
//     };

//     useEffect(() => {
//         const fetchInitialData = async () => {
//             try {
//                 setLoading(true);
//                 setError("");
//                 const [userRes, electionsRes] = await Promise.all([
//                     api.get('/auth/current-user'),
//                     api.get('/elections/user-elections')
//                 ]);
//                 setUser(userRes.data);
//                 setElections(electionsRes.data.elections || []);
//             } catch (err) {
//                 setError(err.message || "Could not load data.");
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchInitialData();
//     }, []);

//     useEffect(() => {
//         if (!user?.id) return;
//         socket.connect();
//         socket.emit('joinUserRoom', user.id);
//         const handleElectionUpdate = (updatedElection) => {
//             setElections(prev =>
//                 prev.map(e =>
//                     e.id === updatedElection.id ? { ...e, ...updatedElection } : e
//                 )
//             );
//         };
//         socket.on('electionUpdate', handleElectionUpdate);
//         return () => {
//             socket.off('electionUpdate', handleElectionUpdate);
//             socket.disconnect();
//         };
//     }, [user]);

//     const fetchCandidates = async (electionId) => {
//         try {
//             const res = await api.get(`/elections/candidates/${electionId}`);
//             setCandidatesMap(prev => ({
//                 ...prev,
//                 [electionId]: res.data.candidates.map(c => ({ ...c, selected: false }))
//             }));
//         } catch (error) {
//             console.error("Candidate fetch error:", error);
//             setCandidatesMap(prev => ({ ...prev, [electionId]: [] }));
//         }
//     };

//     const handleResendEmail = async (electionId, candidateEmail) => {
//         if (!candidateEmail) {
//             setEmailResendStatus({ success: false, message: "Candidate email is missing." });
//             setTimeout(() => setEmailResendStatus({ success: false, message: "" }), 5000);
//             return;
//         }
//         setResendingEmail(candidateEmail);
//         setEmailResendStatus({ success: false, message: "" });
//         try {
//             const res = await api.post(`/elections/resend-email/${electionId}`, { candidateEmail });
//             setEmailResendStatus({ success: true, message: res.data.message || "Email resent successfully!" });
//         } catch (err) {
//             setEmailResendStatus({ success: false, message: err.response?.data?.message || "Failed to resend email." });
//         } finally {
//             setResendingEmail(null);
//             setTimeout(() => setEmailResendStatus({ success: false, message: "" }), 5000);
//         }
//     };

//     const handleViewElection = (electionId) => {
//         setSelectedElectionId(electionId);
//         setShowDetails(true);
//     };

//     const handleBackFromDetails = () => {
//         setShowDetails(false);
//         setSelectedElectionId(null);
//     };

//     const handleViewResults = (electionId) => {
//         navigate(`/election/${electionId}/results`);
//     };

//     const formatDateTime = (dateString) => {
//         if (!dateString) return 'N/A';
//         const date = new Date(dateString);
//         return date.toLocaleString('en-IN', {
//             day: '2-digit', month: 'short', year: 'numeric',
//             hour: '2-digit', minute: '2-digit', hour12: true,
//         });
//     };

//     if (showDetails && selectedElectionId) {
//         return <ElectionDetails electionId={selectedElectionId} onBack={handleBackFromDetails} />;
//     }

//     return (
//         <div className="min-h-screen bg-slate-50 p-6">
//             <div className="max-w-7xl mx-auto">
//                 <div className="mb-8">
//                     <h1 className="text-3xl font-bold text-slate-900 mb-2">Vote Status</h1>
//                     <p className="text-slate-600">Track and manage all your voting events and meetings in real-time.</p>
//                 </div>

//                 {loading && (
//                     <div className="flex justify-center items-center h-40">
//                         <Loader className="animate-spin text-indigo-600" size={36} />
//                         <p className="ml-3 text-lg text-slate-700">Loading elections...</p>
//                     </div>
//                 )}
//                 {error && (
//                     <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-center">
//                         <AlertCircle className="text-red-500 mr-3" size={24} />
//                         <span className="text-red-700 font-medium">{error}</span>
//                     </div>
//                 )}
//                 {emailResendStatus.message && (
//                     <div className={`mb-6 p-4 ${emailResendStatus.success ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'} border-l-4 rounded-lg flex items-center`}>
//                         {emailResendStatus.success ? <CheckCircle className="text-green-500 mr-3" size={24} /> : <AlertCircle className="text-red-500 mr-3" size={24} />}
//                         <span className={`${emailResendStatus.success ? 'text-green-700' : 'text-red-700'} font-medium`}>{emailResendStatus.message}</span>
//                     </div>
//                 )}

//                 {!loading && !error && (
//                     <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
//                         <div className="overflow-x-auto">
//                             <table className="min-w-full divide-y divide-slate-200">
//                                 <thead className="bg-slate-50">
//                                     <tr>
//                                         <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Sr No</th>
//                                         <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name of Matter</th>
//                                         <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Title of Meeting</th>
//                                         <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">COC Members</th>
//                                         <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Start Time</th>
//                                         <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">End Time</th>
//                                         <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
//                                         <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="bg-white divide-y divide-slate-200">
//                                     {elections.map((item, index) => {
//                                         const status = getElectionStatus(item.status);
//                                         return (
//                                             <React.Fragment key={item.id}>
//                                                 <tr className="hover:bg-slate-50/75 transition-colors">
//                                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{index + 1}</td>
//                                                     <td className="px-6 py-4 text-sm text-slate-800 font-medium max-w-xs">
//                                                         <p className="truncate" title={item.Matter}>{item.Matter}</p>
//                                                     </td>
//                                                     <td className="px-6 py-4 text-sm text-slate-800 font-medium max-w-xs">
//                                                         <p className="truncate" title={item.title}>{item.title}</p>
//                                                     </td>
//                                                     <td className="px-6 py-4 whitespace-nowrap text-sm">
//                                                         <button
//                                                             onClick={async () => {
//                                                                 const alreadyOpen = expandedRow === item.id;
//                                                                 setExpandedRow(alreadyOpen ? null : item.id);
//                                                                 if (!alreadyOpen && !candidatesMap[item.id]) {
//                                                                     await fetchCandidates(item.id);
//                                                                 }
//                                                             }}
//                                                             className="bg-slate-800 text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-slate-900"
//                                                         >
//                                                             Click Here
//                                                         </button>
//                                                     </td>
//                                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{formatDateTime(item.startTime)}</td>
//                                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{formatDateTime(item.endTime)}</td>
//                                                     <td className="px-6 py-4 whitespace-nowrap">
//                                                         {status.text === "Completed" ? (
//                                                             <button
//                                                                 onClick={() => handleViewResults(item.id)}
//                                                                 className="bg-green-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-green-700 transition-colors flex items-center gap-1"
//                                                             >
//                                                                 <BarChart2 size={14} />
//                                                                 View Results
//                                                             </button>
//                                                         ) : (
//                                                             <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${status.bgColor} ${status.textColor} ${status.pulseClass || ''}`}>
//                                                                 <status.icon size={14} />
//                                                                 {status.text}
//                                                             </span>
//                                                         )}
//                                                     </td>
//                                                     <td className="px-6 py-4 whitespace-nowrap text-sm">
//                                                         <button onClick={() => handleViewElection(item.id)} className="text-slate-500 hover:text-indigo-600"><Eye size={18} /></button>
//                                                     </td>
//                                                 </tr>

//                                                 {expandedRow === item.id && (
//                                                     <tr className="bg-slate-50">
//                                                         <td colSpan="8" className="p-4">
//                                                             {candidatesMap[item.id] ? (
//                                                                 candidatesMap[item.id].length > 0 ? (
//                                                                     <div className="overflow-x-auto">
//                                                                         <table className="min-w-full text-sm border rounded-md">
//                                                                             <thead className="bg-slate-100 text-xs text-slate-700 uppercase">
//                                                                                 <tr>
//                                                                                     <th className="px-4 py-2 border">Sr No</th>
//                                                                                     <th className="px-4 py-2 border">Name</th>
//                                                                                     <th className="px-4 py-2 border">Email</th>
//                                                                                     <th className="px-4 py-2 border">Share</th>
//                                                                                     <th className="px-4 py-2 border">Actions</th>
//                                                                                 </tr>
//                                                                             </thead>
//                                                                             <tbody className="bg-white">
//                                                                                 {candidatesMap[item.id].map((cand, idx) => (
//                                                                                     <tr key={cand.id} className="border-t">
//                                                                                         <td className="px-4 py-2 border">{idx + 1}</td>
//                                                                                         <td className="px-4 py-2 border">{cand.name}</td>
//                                                                                         <td className="px-4 py-2 border">{cand.email}</td>
//                                                                                         <td className="px-4 py-2 border">{cand.share}%</td>
//                                                                                         <td className="px-4 py-2 border">
//                                                                                             <button
//                                                                                                 onClick={() => handleResendEmail(item.id, cand.email)}
//                                                                                                 className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-1 px-3 rounded text-xs"
//                                                                                                 disabled={resendingEmail === cand.email}
//                                                                                             >
//                                                                                                 {resendingEmail === cand.email ? 'Sending...' : 'Resend Email'}
//                                                                                             </button>
//                                                                                         </td>
//                                                                                     </tr>
//                                                                                 ))}
//                                                                             </tbody>
//                                                                         </table>
//                                                                     </div>
//                                                                 ) : (<div className="text-slate-600 p-4 text-center">No candidates found for this election.</div>)
//                                                             ) : (<div className="flex justify-center items-center p-4"><Loader className="animate-spin text-indigo-600" /></div>)}
//                                                         </td>
//                                                     </tr>
//                                                 )}
//                                             </React.Fragment>
//                                         );
//                                     })}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default VoteStatus;




// import React, { useEffect, useState, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//     Clock, CheckCircle, XCircle, Loader, CalendarClock, AlertCircle,
//     Eye, Play, BarChart2, Users
// } from "lucide-react";
// import ElectionDetails from '../pages/ElectionDetails';
// import api from '../utils/interceptor';
// import { socket } from '../utils/socket';

// const VoteStatus = () => {
//     const [elections, setElections] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");
//     const [selectedElectionId, setSelectedElectionId] = useState(null);
//     const [showDetails, setShowDetails] = useState(false);
//     const [user, setUser] = useState(null);
//     const navigate = useNavigate();

//     const getElectionStatus = (dbStatus) => {
//         switch (dbStatus) {
//             case "ONGOING":
//                 return { text: "Ongoing", icon: Play, bgColor: "bg-orange-100", textColor: "text-orange-800", pulseClass: "animate-pulse" };
//             case "COMPLETED":
//                 return { text: "Completed", icon: CheckCircle, bgColor: "bg-green-100", textColor: "text-green-800" };
//             case "CANCELLED":
//                 return { text: "Cancelled", icon: XCircle, bgColor: "bg-red-100", textColor: "text-red-800" };
//             case "SCHEDULED":
//             default:
//                 return { text: "Scheduled", icon: CalendarClock, bgColor: "bg-blue-100", textColor: "text-blue-800" };
//         }
//     };

//     useEffect(() => {
//         const fetchInitialData = async () => {
//             try {
//                 setLoading(true);
//                 setError("");
//                 const [userRes, electionsRes] = await Promise.all([
//                     api.get('/auth/current-user'),
//                     api.get('/elections/user-elections')
//                 ]);
//                 setUser(userRes.data);
//                 setElections(electionsRes.data.elections || []);
//             } catch (err) {
//                 setError(err.message || "Could not load data.");
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchInitialData();
//     }, []);

//     useEffect(() => {
//         if (!user?.id) return;
//         socket.connect();
//         socket.emit('joinUserRoom', user.id);
//         const handleElectionUpdate = (updatedElection) => {
//             setElections(prev =>
//                 prev.map(e =>
//                     e.id === updatedElection.id ? { ...e, ...updatedElection } : e
//                 )
//             );
//         };
//         socket.on('electionUpdate', handleElectionUpdate);
//         return () => {
//             socket.off('electionUpdate', handleElectionUpdate);
//             socket.disconnect();
//         };
//     }, [user]);

//     const handleViewElection = (electionId) => {
//         setSelectedElectionId(electionId);
//         setShowDetails(true);
//     };

//     const handleBackFromDetails = () => {
//         setShowDetails(false);
//         setSelectedElectionId(null);
//     };

//     const handleViewResults = (electionId) => {
//         navigate(`/election/${electionId}/results`);
//     };

//     const formatDateTime = (dateString) => {
//         if (!dateString) return 'N/A';
//         const date = new Date(dateString);
//         return date.toLocaleString('en-IN', {
//             day: '2-digit', month: 'short', year: 'numeric',
//             hour: '2-digit', minute: '2-digit', hour12: true,
//         });
//     };

//     if (showDetails && selectedElectionId) {
//         return <ElectionDetails electionId={selectedElectionId} onBack={handleBackFromDetails} />;
//     }

//     return (
//         <div className="min-h-screen bg-slate-50 p-6">
//             <div className="max-w-7xl mx-auto">
//                 <div className="mb-8">
//                     <h1 className="text-3xl font-bold text-slate-900 mb-2">Vote Status</h1>
//                     <p className="text-slate-600">Track and manage all your voting events and meetings in real-time.</p>
//                 </div>

//                 {loading && (
//                     <div className="flex justify-center items-center h-40">
//                         <Loader className="animate-spin text-indigo-600" size={36} />
//                         <p className="ml-3 text-lg text-slate-700">Loading elections...</p>
//                     </div>
//                 )}
//                 {error && (
//                     <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-center">
//                         <AlertCircle className="text-red-500 mr-3" size={24} />
//                         <span className="text-red-700 font-medium">{error}</span>
//                     </div>
//                 )}

//                 {!loading && !error && (
//                     <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
//                         <div className="overflow-x-auto">
//                             <table className="w-full divide-y divide-slate-200 table-fixed">
//                                 <thead className="bg-slate-50">
//                                     <tr>
//                                         <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-[5%]">Sr No</th>
//                                         <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-[20%]">Name of Matter</th>
//                                         <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-[20%]">Title of Meeting</th>
//                                         <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-[10%]">Members</th>
//                                         <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-[15%]">Start Time</th>
//                                         <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-[15%]">End Time</th>
//                                         <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-[10%]">Status</th>
//                                         <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-[5%]">Actions</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="bg-white divide-y divide-slate-200">
//                                     {elections.map((item, index) => {
//                                         const status = getElectionStatus(item.status);
//                                         return (
//                                             <tr key={item.id} className="hover:bg-slate-50/75 transition-colors">
//                                                 <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-700">{index + 1}</td>
//                                                 <td className="px-4 py-3 text-xs text-slate-800 font-medium">
//                                                     <p className="truncate" title={item.Matter}>{item.Matter}</p>
//                                                 </td>
//                                                 <td className="px-4 py-3 text-xs text-slate-800 font-medium">
//                                                     <p className="truncate" title={item.title}>{item.title}</p>
//                                                 </td>
//                                                 <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-700">
//                                                     <div className="flex items-center gap-2">
//                                                         <Users size={14} className="text-slate-400"/>
//                                                         <span>{item.candidates?.length || 0}</span>
//                                                     </div>
//                                                 </td>
//                                                 <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-600">{formatDateTime(item.startTime)}</td>
//                                                 <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-600">{formatDateTime(item.endTime)}</td>
//                                                 <td className="px-4 py-3 whitespace-nowrap">
//                                                     {status.text === "Completed" ? (
//                                                         <button
//                                                             onClick={() => handleViewResults(item.id)}
//                                                             className="bg-green-600 text-white px-2.5 py-1 rounded-md text-xs font-semibold hover:bg-green-700 transition-colors flex items-center gap-1"
//                                                         >
//                                                             <BarChart2 size={12} />
//                                                             Results
//                                                         </button>
//                                                     ) : (
//                                                         <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full ${status.bgColor} ${status.textColor} ${status.pulseClass || ''}`}>
//                                                             <status.icon size={12} />
//                                                             {status.text}
//                                                         </span>
//                                                     )}
//                                                 </td>
//                                                 <td className="px-4 py-3 whitespace-nowrap text-center text-xs">
//                                                     <button onClick={() => handleViewElection(item.id)} className="text-slate-500 hover:text-indigo-600" title="View Details">
//                                                         <Eye size={16} />
//                                                     </button>
//                                                 </td>
//                                             </tr>
//                                         );
//                                     })}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default VoteStatus;



import React, { useEffect, useState, useCallback } from "react";
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

    useEffect(() => {
        if (!user?.id) return;
        socket.connect();
        socket.emit('joinUserRoom', user.id);
        const handleElectionUpdate = (updatedElection) => {
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
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true,
        });
    };

    if (showDetails && selectedElectionId) {
        return <ElectionDetails electionId={selectedElectionId} onBack={handleBackFromDetails} />;
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Vote Status</h1>
                    <p className="text-slate-600">Track and manage all your voting events and meetings in real-time.</p>
                </div>

                {loading && (
                    <div className="flex justify-center items-center h-40">
                        <Loader className="animate-spin text-indigo-600" size={36} />
                        <p className="ml-3 text-lg text-slate-700">Loading elections...</p>
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

                {!loading && !error && (
                    <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full divide-y divide-slate-200 table-fixed">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-[5%]">Sr No</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-[20%]">Name of Matter</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-[20%]">Title of Meeting</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-[12%]">COC Members</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-[15%]">Start Time</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-[15%]">End Time</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-[8%]">Status</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider w-[5%]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {elections.map((item, index) => {
                                        const status = getElectionStatus(item.status);
                                        return (
                                            <React.Fragment key={item.id}>
                                                <tr className="hover:bg-slate-50/75 transition-colors">
                                                    <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-700">{index + 1}</td>
                                                    <td className="px-4 py-3 text-xs text-slate-800 font-medium">
                                                        <p className="truncate" title={item.Matter}>{item.Matter}</p>
                                                    </td>
                                                    <td className="px-4 py-3 text-xs text-slate-800 font-medium">
                                                        <p className="truncate" title={item.title}>{item.title}</p>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-xs">
                                                        <button
                                                            onClick={async () => {
                                                                const alreadyOpen = expandedRow === item.id;
                                                                setExpandedRow(alreadyOpen ? null : item.id);
                                                                if (!alreadyOpen && !candidatesMap[item.id]) {
                                                                    await fetchCandidates(item.id);
                                                                }
                                                            }}
                                                            className="bg-slate-800 text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-slate-900"
                                                        >
                                                            Click Here
                                                        </button>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-600">{formatDateTime(item.startTime)}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-600">{formatDateTime(item.endTime)}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        {status.text === "Completed" ? (
                                                            <button
                                                                onClick={() => handleViewResults(item.id)}
                                                                className="bg-green-600 text-white px-2.5 py-1 rounded-md text-xs font-semibold hover:bg-green-700 transition-colors flex items-center gap-1"
                                                            >
                                                                <BarChart2 size={12} />
                                                                Results
                                                            </button>
                                                        ) : (
                                                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full ${status.bgColor} ${status.textColor} ${status.pulseClass || ''}`}>
                                                                <status.icon size={12} />
                                                                {status.text}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-center text-xs">
                                                        <button onClick={() => handleViewElection(item.id)} className="text-slate-500 hover:text-indigo-600" title="View Details">
                                                            <Eye size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                                {expandedRow === item.id && (
                                                    <tr className="bg-slate-50">
                                                        <td colSpan="8" className="p-4">
                                                            {candidatesMap[item.id] ? (
                                                                candidatesMap[item.id].length > 0 ? (
                                                                    <div>
                                                                        <table className="min-w-full text-sm border rounded-md">
                                                                            <thead className="bg-slate-100 text-xs text-slate-700 uppercase">
                                                                                <tr>
                                                                                    <th className="px-4 py-2 border">Sr No</th>
                                                                                    <th className="px-4 py-2 border">Name</th>
                                                                                    <th className="px-4 py-2 border">Email</th>
                                                                                    <th className="px-4 py-2 border">Share</th>
                                                                                    <th className="px-4 py-2 border">Actions</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody className="bg-white">
                                                                                {candidatesMap[item.id].map((cand, idx) => (
                                                                                    <tr key={cand.id} className="border-t">
                                                                                        <td className="px-4 py-2 border">{idx + 1}</td>
                                                                                        <td className="px-4 py-2 border">{cand.name}</td>
                                                                                        <td className="px-4 py-2 border">{cand.email}</td>
                                                                                        <td className="px-4 py-2 border">{cand.share}%</td>
                                                                                        <td className="px-4 py-2 border">
                                                                                            <button
                                                                                                onClick={() => handleResendEmail(item.id, cand.email)}
                                                                                                className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-1 px-3 rounded text-xs"
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
                                                                ) : (<div className="text-slate-600 p-4 text-center">No candidates found for this election.</div>)
                                                            ) : (<div className="flex justify-center items-center p-4"><Loader className="animate-spin text-indigo-600" /></div>)}
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

