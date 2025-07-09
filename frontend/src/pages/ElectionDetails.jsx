import React, { useEffect, useState, useRef } from "react"; // Import useRef
import html2pdf from 'html2pdf.js'; // Import html2pdf
import {
  ArrowLeft, Calendar, Clock, Users, FileText, MapPin,
  CheckCircle, XCircle, Play, CalendarClock, AlertCircle,
  Mail, Phone, Building, Info, Globe, Download, Eye,
  Edit, Trash2, Share2, Printer, Copy, Loader
} from "lucide-react";

const ElectionDetails = ({ electionId, onBack }) => {
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDownloading, setIsDownloading] = useState(false); // New state for download
  const [isSendingReminder, setIsSendingReminder] = useState(false); // New state for reminder
  const contentRef = useRef(null); // Ref for the content to be downloaded

  useEffect(() => {
    fetchElectionDetails();
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, [electionId]);

  const fetchElectionDetails = async () => {
    setLoading(true);
    setError("");

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      setError("You are not logged in. Please log in to view election details.");
      setLoading(false);
      return;
    }

    try {
      // Fetch election details
      const electionRes = await fetch(`/api/elections/${electionId}`, {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      });

      if (!electionRes.ok) {
        throw new Error("Failed to fetch election details");
      }

      const electionData = await electionRes.json();
      setElection(electionData.election);

      // Fetch candidates
      const candidatesRes = await fetch(`/api/elections/candidates/${electionId}`, {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      });

      if (candidatesRes.ok) {
        const candidatesData = await candidatesRes.json();
        // Assuming candidatesData.candidates might contain a `voted` status.
        // For this example, let's assume if a candidate is listed, they *might* not have voted yet for reminders,
        // but for a real system, you'd need a clear `hasVoted` flag from the backend.
        setCandidates(candidatesData.candidates || []);
      }
    } catch (err) {
      console.error("Error fetching election details:", err);
      setError(err.message || "Could not load election details.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    const element = contentRef.current;
    if (!element) {
      alert("Content to download not found.");
      setIsDownloading(false);
      return;
    }

    const opt = {
      margin: 1,
      filename: `election-report-${election.id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, logging: true, dpi: 192, letterRendering: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    try {
      await html2pdf().set(opt).from(element).save();
      // You could add a success toast here
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to download report. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendReminder = async () => {
    setIsSendingReminder(true);
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      alert("You are not logged in. Please log in to send reminders.");
      setIsSendingReminder(false);
      return;
    }

    try {
      // In a real application, you'd send specific candidate IDs that haven't voted,
      // or let the backend determine based on electionId.
      // For this example, we'll just send the electionId.
      const response = await fetch(`/api/elections/resend-email/${electionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': "Bearer " + accessToken,
        },

      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send reminders.");
      }

      alert("Reminders sent successfully!");
      // You might want to refresh candidate status here if your backend updates it
    } catch (error) {
      console.error("Error sending reminder:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSendingReminder(false);
    }
  };


  const getElectionStatus = (startTime, endTime, currentStatus) => {
    const now = currentTime;
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (currentStatus === "CANCELLED") {
      return {
        text: "Cancelled",
        color: "red",
        bgColor: "bg-red-100",
        textColor: "text-red-800",
        icon: XCircle,
        pulseClass: ""
      };
    }

    if (now < start) {
      return {
        text: "Scheduled",
        color: "blue",
        bgColor: "bg-blue-100",
        textColor: "text-blue-800",
        icon: CalendarClock,
        pulseClass: ""
      };
    } else if (now >= start && now <= end) {
      return {
        text: "Ongoing",
        color: "orange",
        bgColor: "bg-orange-100",
        textColor: "text-orange-800",
        icon: Play,
        pulseClass: "animate-pulse"
      };
    } else if (now > end) {
      return {
        text: "Completed",
        color: "green",
        bgColor: "bg-green-100",
        textColor: "text-green-800",
        icon: CheckCircle,
        pulseClass: ""
      };
    }

    return {
      text: "Unknown",
      color: "gray",
      bgColor: "bg-gray-100",
      textColor: "text-gray-800",
      icon: Info,
      pulseClass: ""
    };
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
  };

  const calculateDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    }
    return `${diffMinutes}m`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="ml-3 text-lg text-gray-700">Loading election details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="text-red-500 mr-3" size={24} />
              <span className="text-red-700 font-medium">{error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <Info className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No election found</h3>
            <p className="mt-1 text-sm text-gray-500">The requested election could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  const status = getElectionStatus(election.startTime, election.endTime, election.status);
  const startDateTime = formatDateTime(election.startTime);
  const endDateTime = formatDateTime(election.endTime);
  const duration = calculateDuration(election.startTime, election.endTime);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4 font-medium"
          >
            <ArrowLeft className="mr-2" size={20} />
            Back to Elections
          </button>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{election.title}</h1>
              <div className="flex items-center space-x-4">
                <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${status.bgColor} ${status.textColor} ${status.pulseClass}`}>
                  <status.icon className="mr-2" size={16} />
                  {status.text}
                </span>
                <span className="text-gray-500 text-sm">ID: {election.id}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Main Content to be downloaded */}
        <div ref={contentRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Matter Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="mr-2 text-indigo-600" size={20} />
                Matter Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name of Matter</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{election.Matter || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                    {election.description || 'No description provided'}
                  </p>
                </div>
                {election.objectives && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Objectives</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                      {election.objectives}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Meeting Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="mr-2 text-indigo-600" size={20} />
                Meeting Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Type</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {election.meetingType || 'Committee of Creditors'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Mode</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {election.meetingMode || 'Virtual'}
                  </p>
                </div>
                {election.venue && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg flex items-center">
                      <MapPin className="mr-2 text-gray-500" size={16} />
                      {election.venue}
                    </p>
                  </div>
                )}
                {election.meetingLink && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
                    <div className="flex items-center space-x-2">
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg flex-1 flex items-center">
                        <Globe className="mr-2 text-gray-500" size={16} />
                        {election.meetingLink}
                      </p>
                      <button
                        onClick={() => copyToClipboard(election.meetingLink)}
                        className="p-2 text-gray-500 hover:text-gray-700"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* COC Members */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="mr-2 text-indigo-600" size={20} />
                Committee of Creditors Members ({candidates.length})
              </h2>
              {candidates.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sr No</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Share %</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {candidates.map((candidate, index) => (
                        <tr key={candidate.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {candidate.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="flex items-center">
                              <Mail className="mr-2 text-gray-400" size={14} />
                              {candidate.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {candidate.share}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {candidate.phone && (
                              <div className="flex items-center">
                                <Phone className="mr-2 text-gray-400" size={14} />
                                {candidate.phone}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>No committee members found</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Schedule Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="mr-2 text-indigo-600" size={18} />
                Schedule
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Start Date & Time
                  </label>
                  <div className="text-sm text-gray-900">
                    <div className="font-medium">{startDateTime.date}</div>
                    <div className="text-gray-600 flex items-center mt-1">
                      <Clock className="mr-1" size={14} />
                      {startDateTime.time}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    End Date & Time
                  </label>
                  <div className="text-sm text-gray-900">
                    <div className="font-medium">{endDateTime.date}</div>
                    <div className="text-gray-600 flex items-center mt-1">
                      <Clock className="mr-1" size={14} />
                      {endDateTime.time}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Duration
                  </label>
                  <div className="text-sm text-gray-900 font-medium">{duration}</div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Members</span>
                  <span className="text-sm font-semibold text-gray-900">{candidates.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Shares</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {candidates.reduce((sum, c) => sum + (parseFloat(c.share) || 0), 0).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {election.createdAt ? new Date(election.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={handleDownloadReport}
                  disabled={isDownloading}
                  className={`w-full bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center
                    ${isDownloading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                >
                  {isDownloading ? (
                    <Loader className="mr-2 animate-spin" size={16} />
                  ) : (
                    <Download className="mr-2" size={16} />
                  )}
                  {isDownloading ? 'Downloading...' : 'Download Report'}
                </button>
                <button
                  onClick={handleSendReminder}
                  disabled={isSendingReminder}
                  className={`w-full bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center justify-center
                    ${isSendingReminder ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'}`}
                >
                  {isSendingReminder ? (
                    <Loader className="mr-2 animate-spin" size={16} />
                  ) : (
                    <Mail className="mr-2" size={16} />
                  )}
                  {isSendingReminder ? 'Sending...' : 'Send Reminder'}
                </button>
                <button className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center">
                  <Trash2 className="mr-2" size={16} />
                  Cancel Election
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectionDetails;