// import React, { useEffect, useState, useMemo } from "react";
// import { useNavigate } from "react-router-dom";
// import { 
//   Calendar, 
//   Clock, 
//   AlertCircle, 
//   CheckCircle, 
//   Search,
//   Filter,
//   ArrowLeft,
//   Users,
//   Info,
//   Zap,
//   Eye,
//   History,
//   ChevronDown,
//   ChevronUp
// } from "lucide-react";

// const RescheduleVoting = () => {
//   const [elections, setElections] = useState([]);
//   const [filteredElections, setFilteredElections] = useState([]);
//   const [selectedId, setSelectedId] = useState("");
//   const [newStartTime, setNewStartTime] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [fetchLoading, setFetchLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [showPreview, setShowPreview] = useState(false);
//   const [expandedDescription, setExpandedDescription] = useState(false);
//   const navigate = useNavigate();

//   // Get current date-time for min values
//   const getNowLocal = () => {
//     const now = new Date();
//     now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
//     return now.toISOString().slice(0, 16);
//   };

//   useEffect(() => {
//     const fetchElections = async () => {
//       setFetchLoading(true);
//       try {
//         const res = await fetch("/api/elections/user-elections", {
//           headers: {
//             Authorization: "Bearer " + localStorage.getItem("accessToken"),
//           },
//         });
//         const data = await res.json();
//         if (res.ok) {
//           setElections(data.elections || []);
//           setFilteredElections(data.elections || []);
//         } else {
//           setElections([]);
//           setFilteredElections([]);
//         }
//       } catch {
//         setElections([]);
//         setFilteredElections([]);
//       } finally {
//         setFetchLoading(false);
//       }
//     };
//     fetchElections();
//   }, []);

//     // --- THIS IS THE KEY FIX ---
//     // Filter elections based on the status from the database
//     const reschedulableElections = useMemo(() => {
//         return elections.filter(el => el.status === 'SCHEDULED' || el.status === 'ONGOING');
//     }, [elections]);
//     // --- END OF FIX ---
    
//     // Pre-fill times when an election is selected
//     useEffect(() => {
//         if (selectedId) {
//             const selected = elections.find(e => e.id === selectedId);
//             if (selected) {
//                 // Format for datetime-local input
//                 const formatForInput = (dateString) => new Date(new Date(dateString).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
//                 setNewStartTime(formatForInput(selected.startTime));
//                 setNewEndTime(formatForInput(selected.endTime));
//             }
//         }
//     }, [selectedId, elections]);


//     const handleReschedule = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setError("");
//         setSuccess("");

//         if (!selectedId || !newStartTime || !newEndTime) {
//             setError("Please select an election and provide new start and end times.");
//             setLoading(false);
//             return;
//         }

//         try {
//             await api.put(`/elections/reschedule/${selectedId}`, {
//                 startTime: newStartTime,
//                 endTime: newEndTime,
//             });

//             setSuccess("Election rescheduled successfully! Redirecting...");
//             setTimeout(() => navigate("/vote-status"), 2000);

//         } catch (err) {
//             setError(err.response?.data?.message || "Failed to reschedule election.");
//         } finally {
//             setLoading(false);
//         }
//     };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
//       <div className="max-w-4xl mx-auto">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <button
//             onClick={() => navigate(-1)}
//             className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4 transition-colors"
//           >
//             <ArrowLeft size={20} className="mr-2" />
//             Back
//           </button>
//           <div className="flex items-center justify-center mb-4">
//             <div className="bg-indigo-100 p-3 rounded-full">
//               <Calendar className="text-indigo-600" size={32} />
//             </div>
//           </div>
//           <h1 className="text-4xl font-bold text-gray-800 mb-2">Reschedule Election</h1>
//           <p className="text-gray-600 max-w-2xl mx-auto">
//             Adjust the timing of your elections with ease. Select an election and set new start and end times.
//           </p>
//         </div>

//         <div className="grid lg:grid-cols-3 gap-8">
//           {/* Left Column - Election Selection */}
//           <div className="lg:col-span-2 space-y-6">
//             <div className="bg-white rounded-2xl shadow-xl p-6">
//               <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
//                 <Filter className="mr-2 text-indigo-600" size={20} />
//                 Select Election
//               </h2>

//               {/* Search and Filter Controls */}
//               <div className="flex flex-col sm:flex-row gap-4 mb-6">
//                 <div className="flex-1 relative">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//                   <input
//                     type="text"
//                     placeholder="Search elections..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
//                   />
//                 </div>
//                 <select
//                   value={statusFilter}
//                   onChange={(e) => setStatusFilter(e.target.value)}
//                   className="px-4 py-3 border border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
//                 >
//                   <option value="all">All Status</option>
//                   <option value="upcoming">Upcoming</option>
//                   <option value="active">Active</option>
//                   <option value="completed">Completed</option>
//                 </select>
//               </div>

//               {/* Elections List */}
//               {fetchLoading ? (
//                 <div className="flex items-center justify-center py-8">
//                   <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
//                   <span className="ml-3 text-gray-600">Loading elections...</span>
//                 </div>
//               ) : filteredElections.length === 0 ? (
//                 <div className="text-center py-8">
//                   <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
//                   <p className="text-gray-500">No elections found</p>
//                 </div>
//               ) : (
//                 <div className="space-y-3 max-h-96 overflow-y-auto">
//                   {filteredElections.map((election) => {
//                     const statusInfo = getElectionStatus(election);
//                     return (
//                       <div
//                         key={election.id}
//                         className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
//                           selectedId === election.id
//                             ? "border-indigo-500 bg-indigo-50"
//                             : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
//                         }`}
//                         onClick={() => setSelectedId(election.id)}
//                       >
//                         <div className="flex items-start justify-between">
//                           <div className="flex-1">
//                             <h3 className="font-semibold text-gray-800 mb-1">{election.title}</h3>
//                             <div className="flex items-center text-sm text-gray-600 mb-2">
//                               <Clock size={14} className="mr-1" />
//                               {new Date(election.startTime).toLocaleDateString()} - {new Date(election.endTime).toLocaleDateString()}
//                             </div>
//                             {election.candidates && (
//                               <div className="flex items-center text-sm text-gray-500">
//                                 <Users size={14} className="mr-1" />
//                                 {election.candidates.length} candidates
//                               </div>
//                             )}
//                           </div>
//                           <span className={`px-3 py-1 rounded-full text-xs font-medium ${
//                             statusInfo.color === 'blue' ? 'bg-blue-100 text-blue-800' :
//                             statusInfo.color === 'green' ? 'bg-green-100 text-green-800' :
//                             'bg-gray-100 text-gray-800'
//                           }`}>
//                             {statusInfo.label}
//                           </span>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>

//             {/* Reschedule Form */}
//             {selectedId && (
//               <div className="bg-white rounded-2xl shadow-xl p-6">
//                 <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
//                   <Zap className="mr-2 text-indigo-600" size={20} />
//                   Set New Schedule
//                 </h2>

//                 <div onSubmit={handleSubmit} className="space-y-6">
//                   {error && (
//                     <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-center">
//                       <AlertCircle className="text-red-500 mr-2 flex-shrink-0" size={20} />
//                       <span className="text-red-700">{error}</span>
//                     </div>
//                   )}
                  
//                   {success && (
//                     <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg flex items-center">
//                       <CheckCircle className="text-green-500 mr-2 flex-shrink-0" size={20} />
//                       <span className="text-green-700">{success}</span>
//                     </div>
//                   )}

//                   <div className="grid md:grid-cols-2 gap-6">
//                     <div>
//                       <label htmlFor="start-time" className="block text-sm font-semibold text-gray-700 mb-2">
//                         <Clock className="inline mr-1" size={16} />
//                         New Start Time
//                       </label>
//                       <input
//                         id="start-time"
//                         type="datetime-local"
//                         value={startTime}
//                         onChange={(e) => setStartTime(e.target.value)}
//                         min={getNowLocal()}
//                         required
//                         className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors duration-200"
//                       />
//                     </div>
//                     <div>
//                       <label htmlFor="end-time" className="block text-sm font-semibold text-gray-700 mb-2">
//                         <Clock className="inline mr-1" size={16} />
//                         New End Time
//                       </label>
//                       <input
//                         id="end-time"
//                         type="datetime-local"
//                         value={endTime}
//                         onChange={(e) => setEndTime(e.target.value)}
//                         min={startTime || getNowLocal()}
//                         required
//                         className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors duration-200"
//                       />
//                     </div>
//                   </div>

//                   {calculateDuration() && (
//                     <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
//                       <div className="flex items-center text-blue-800">
//                         <Info className="mr-2 flex-shrink-0" size={16} />
//                         <span className="text-sm">
//                           <strong>New Duration:</strong> {calculateDuration()}
//                         </span>
//                       </div>
//                     </div>
//                   )}

//                   <div className="flex gap-4">
//                     <button
//                       type="button"
//                       onClick={() => setShowPreview(!showPreview)}
//                       className="flex items-center px-4 py-2 text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors"
//                     >
//                       <Eye className="mr-2" size={16} />
//                       {showPreview ? 'Hide' : 'Show'} Preview
//                     </button>
//                     <button
//                       type="submit"
//                       onClick={handleSubmit}
//                       className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
//                       disabled={loading}
//                     >
//                       {loading ? (
//                         <>
//                           <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                           Updating...
//                         </>
//                       ) : (
//                         <>
//                           <CheckCircle size={20} />
//                           Reschedule Election
//                         </>
//                       )}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Right Column - Preview/Info */}
//           <div className="space-y-6">
//             {selectedElection && (
//               <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-4">
//                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
//                   <History className="mr-2 text-indigo-600" size={20} />
//                   Election Details
//                 </h3>
                
//                 <div className="space-y-4">
//                   <div>
//                     <h4 className="font-semibold text-gray-700 text-sm mb-1">Title</h4>
//                     <p className="text-gray-800">{selectedElection.title}</p>
//                   </div>
                  
//                   {selectedElection.description && (
//                     <div>
//                       <h4 className="font-semibold text-gray-700 text-sm mb-1">Description</h4>
//                       <div className="text-gray-600 text-sm">
//                         <p className={`transition-all duration-300 ${expandedDescription ? '' : 'line-clamp-3'}`}>
//                           {expandedDescription 
//                             ? selectedElection.description 
//                             : truncateText(selectedElection.description, 150)
//                           }
//                         </p>
//                         {needsTruncation(selectedElection.description, 150) && (
//                           <button
//                             onClick={() => setExpandedDescription(!expandedDescription)}
//                             className="inline-flex items-center mt-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
//                           >
//                             {expandedDescription ? (
//                               <>
//                                 Show less <ChevronUp size={16} className="ml-1" />
//                               </>
//                             ) : (
//                               <>
//                                 Read more <ChevronDown size={16} className="ml-1" />
//                               </>
//                             )}
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   )}
                  
//                   <div>
//                     <h4 className="font-semibold text-gray-700 text-sm mb-2">Current Schedule</h4>
//                     <div className="space-y-2 text-sm">
//                       <div className="flex items-center text-gray-600">
//                         <Clock size={14} className="mr-2" />
//                         Start: {new Date(selectedElection.startTime).toLocaleString()}
//                       </div>
//                       <div className="flex items-center text-gray-600">
//                         <Clock size={14} className="mr-2" />
//                         End: {new Date(selectedElection.endTime).toLocaleString()}
//                       </div>
//                     </div>
//                   </div>

//                   {selectedElection.candidates && (
//                     <div>
//                       <h4 className="font-semibold text-gray-700 text-sm mb-2">Candidates</h4>
//                       <div className="space-y-1">
//                         {selectedElection.candidates.slice(0, 3).map((candidate, idx) => (
//                           <div key={idx} className="text-sm text-gray-600 flex items-center">
//                             <div className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></div>
//                             {candidate.name || candidate}
//                           </div>
//                         ))}
//                         {selectedElection.candidates.length > 3 && (
//                           <div className="text-sm text-gray-500">
//                             +{selectedElection.candidates.length - 3} more
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 {/* Preview new schedule */}
//                 {showPreview && startTime && endTime && (
//                   <div className="mt-6 pt-4 border-t border-gray-200">
//                     <h4 className="font-semibold text-gray-700 text-sm mb-2 text-green-700">New Schedule Preview</h4>
//                     <div className="space-y-2 text-sm">
//                       <div className="flex items-center text-green-600">
//                         <Clock size={14} className="mr-2" />
//                         Start: {new Date(startTime).toLocaleString()}
//                       </div>
//                       <div className="flex items-center text-green-600">
//                         <Clock size={14} className="mr-2" />
//                         End: {new Date(endTime).toLocaleString()}
//                       </div>
//                       <div className="text-green-600 font-medium">
//                         Duration: {calculateDuration()}
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       <style jsx>{`
//         @keyframes fadeIn {
//           from { opacity: 0; transform: translateY(10px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         .animate-fadeIn {
//           animation: fadeIn 0.3s ease-out;
//         }
//         .line-clamp-3 {
//           display: -webkit-box;
//           -webkit-line-clamp: 3;
//           -webkit-box-orient: vertical;
//           overflow: hidden;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default RescheduleVoting;



import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Calendar, Clock, AlertCircle, CheckCircle, Search, Filter, ArrowLeft,
    Users, Info, Zap, Eye, History, ChevronDown, ChevronUp, Loader2
} from "lucide-react";
import api from '../utils/interceptor';

const RescheduleVoting = () => {
    const [elections, setElections] = useState([]);
    const [filteredElections, setFilteredElections] = useState([]);
    const [selectedId, setSelectedId] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'SCHEDULED', 'ONGOING'
    const navigate = useNavigate();

    const getNowLocal = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    useEffect(() => {
        const fetchElections = async () => {
            setFetchLoading(true);
            try {
                const res = await api.get("/elections/user-elections");
                const allElections = res.data.elections || [];
                // Only show elections that can be rescheduled
                const reschedulable = allElections.filter(e => e.status === 'SCHEDULED' || e.status === 'ONGOING');
                setElections(reschedulable);
                setFilteredElections(reschedulable);
            } catch {
                setError("Failed to load elections.");
                setElections([]);
                setFilteredElections([]);
            } finally {
                setFetchLoading(false);
            }
        };
        fetchElections();
    }, []);

    // Filter elections based on search and status
    useEffect(() => {
        let filtered = elections;

        if (searchTerm) {
            filtered = filtered.filter(election =>
                election.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // --- MODIFIED: Filter by database status ---
        if (statusFilter !== "all") {
            filtered = filtered.filter(election => election.status === statusFilter);
        }

        setFilteredElections(filtered);
    }, [elections, searchTerm, statusFilter]);
    
    // Pre-fill times when an election is selected
    useEffect(() => {
        if (selectedId) {
            const sel = elections.find((e) => e.id === selectedId);
            if (sel) {
                const formatForInput = (dateString) => new Date(new Date(dateString).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                setStartTime(formatForInput(sel.startTime));
                setEndTime(formatForInput(sel.endTime));
            }
        } else {
            setStartTime("");
            setEndTime("");
        }
    }, [selectedId, elections]);

    const calculateDuration = () => {
        if (startTime && endTime) {
            const start = new Date(startTime);
            const end = new Date(endTime);
            const diffMs = end - start;
            if (diffMs < 0) return "Invalid duration";
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const days = Math.floor(diffHours / 24);
            const hours = diffHours % 24;
            let durationString = '';
            if (days > 0) durationString += `${days} day${days > 1 ? 's' : ''} `;
            if (hours > 0) durationString += `${hours} hour${hours > 1 ? 's' : ''}`;
            return durationString.trim();
        }
        return "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        if (new Date(endTime) <= new Date(startTime)) {
            setError("End time must be after start time.");
            setLoading(false);
            return;
        }

        try {
            await api.put(`/elections/reschedule/${selectedId}`, { startTime, endTime });
            setSuccess("Election rescheduled successfully! Redirecting...");
            setTimeout(() => navigate("/vote-status"), 2000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to reschedule.");
        } finally {
            setLoading(false);
        }
    };

    const selectedElection = elections.find(e => e.id === selectedId);

    return (
        <div className="min-h-screen bg-slate-50 p-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <button onClick={() => navigate(-1)} className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4 transition-colors">
                        <ArrowLeft size={20} className="mr-2" />
                        Back
                    </button>
                    <div className="flex items-center justify-center mb-4">
                        <div className="bg-indigo-100 p-3 rounded-full">
                            <Calendar className="text-indigo-600" size={32} />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-slate-800 mb-2">Reschedule Election</h1>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        Adjust the timing of your elections. Only scheduled or ongoing elections are shown here.
                    </p>
                </div>

                <div className="grid lg:grid-cols-5 gap-8">
                    {/* Left Column - Election Selection */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-2xl shadow-lg ring-1 ring-slate-200 p-6">
                            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                                <Filter className="mr-2 text-indigo-600" size={20} />
                                Select Election
                            </h2>

                            {/* Search and Filter Controls */}
                            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="text" placeholder="Search elections..." value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                                    />
                                </div>
                                <select
                                    value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-4 py-3 border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="SCHEDULED">Scheduled</option>
                                    <option value="ONGOING">Ongoing</option>
                                </select>
                            </div>

                            {/* Elections List */}
                            {fetchLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                    <span className="ml-3 text-slate-600">Loading elections...</span>
                                </div>
                            ) : filteredElections.length === 0 ? (
                                <div className="text-center py-8">
                                    <Calendar className="mx-auto text-slate-400 mb-4" size={48} />
                                    <p className="text-slate-500">No elections found matching your criteria.</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                    {filteredElections.map((election) => (
                                        <div
                                            key={election.id}
                                            className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                                                selectedId === election.id ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
                                            }`}
                                            onClick={() => setSelectedId(election.id)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-slate-800 mb-1">{election.title}</h3>
                                                    <div className="flex items-center text-sm text-slate-500">
                                                        <Users size={14} className="mr-1.5" />
                                                        {election.candidates.length} members
                                                    </div>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    election.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                                }`}>
                                                    {election.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Reschedule Form & Preview */}
                    <div className="lg:col-span-2">
                        {selectedId ? (
                            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg ring-1 ring-slate-200 p-6 space-y-6 sticky top-8">
                                <h2 className="text-xl font-bold text-slate-800 flex items-center">
                                    <Zap className="mr-2 text-indigo-600" size={20} />
                                    Set New Schedule
                                </h2>
                                {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
                                {success && <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">{success}</div>}
                                
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="start-time" className="block text-sm font-semibold text-slate-700 mb-2">New Start Time</label>
                                        <input id="start-time" type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} min={getNowLocal()} required className="w-full px-4 py-3 border border-slate-300 rounded-xl"/>
                                    </div>
                                    <div>
                                        <label htmlFor="end-time" className="block text-sm font-semibold text-slate-700 mb-2">New End Time</label>
                                        <input id="end-time" type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} min={startTime || getNowLocal()} required className="w-full px-4 py-3 border border-slate-300 rounded-xl"/>
                                    </div>
                                </div>
                                {calculateDuration() && (
                                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                                        <div className="flex items-center text-blue-800">
                                            <Info className="mr-2 flex-shrink-0" size={16} />
                                            <span className="text-sm"><strong>New Duration:</strong> {calculateDuration()}</span>
                                        </div>
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:bg-indigo-400"
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : <CheckCircle size={20} />}
                                    Reschedule Election
                                </button>
                            </form>
                        ) : (
                             <div className="bg-white rounded-2xl shadow-lg ring-1 ring-slate-200 p-6 text-center sticky top-8">
                                <Info className="mx-auto text-slate-400 mb-4" size={40} />
                                <h3 className="font-semibold text-slate-700">Select an Election</h3>
                                <p className="text-slate-500 mt-2 text-sm">Choose an election from the list to view its details and set a new schedule.</p>
                             </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RescheduleVoting;
