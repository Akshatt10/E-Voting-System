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
