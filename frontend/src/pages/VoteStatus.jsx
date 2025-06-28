import React, { useEffect, useState, useCallback } from "react";
import {
  Clock, CheckCircle, XCircle, Loader, Calendar, Info, AlertCircle, Eye, Edit
} from "lucide-react";

const VoteStatus = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const [candidatesMap, setCandidatesMap] = useState({});
  const [resendingEmail, setResendingEmail] = useState(null); // To track which email is being resent
  const [emailResendStatus, setEmailResendStatus] = useState({ success: false, message: "" }); // For feedback

  const fetchElections = useCallback(async () => {
    setLoading(true);
    setError("");

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      setError("You are not logged in. Please log in to view election status.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/elections", {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch elections");
      }
      const data = await res.json();
      setElections(data.elections || []);
    } catch (err) {
      console.error("Error fetching elections:", err);
      setError(err.message || "Could not load elections.");
      setElections([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCandidates = async (electionId) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const res = await fetch(`http://localhost:3000/api/elections/candidates/${electionId}`, {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch candidates.");
      }
      const data = await res.json();
      setCandidatesMap(prev => ({
        ...prev,
        [electionId]: data.candidates.map(c => ({ ...c, selected: false }))
      }));
    } catch (error) {
      console.error("Candidate fetch error:", error);
      setCandidatesMap(prev => ({ ...prev, [electionId]: [] }));
    }
  };

  // --- NEW EMAIL RESEND LOGIC ---
  const handleResendEmail = async (electionId, candidateEmail, candidateName) => {
    setResendingEmail(candidateEmail); // Set loading state for this specific email
    setEmailResendStatus({ success: false, message: "" }); // Reset previous status

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      setEmailResendStatus({ success: false, message: "Authentication failed. Please log in." });
      setResendingEmail(null);
      return;
    }

    try {
      // Replace with your actual email sending API endpoint
      const res = await fetch(`/api/elections/${electionId}/resend-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + accessToken,
        },
        body: JSON.stringify({ email: candidateEmail, name: candidateName, electionId: electionId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to send email.");
      }

      const data = await res.json();
      setEmailResendStatus({ success: true, message: data.message || "Email resent successfully!" });
    } catch (err) {
      console.error("Error resending email:", err);
      setEmailResendStatus({ success: false, message: err.message || "Failed to resend email." });
    } finally {
      setResendingEmail(null); // Clear loading state
      // Optionally clear the success/error message after a few seconds
      setTimeout(() => setEmailResendStatus({ success: false, message: "" }), 5000);
    }
  };
  // --- END NEW EMAIL RESEND LOGIC ---

  useEffect(() => {
    fetchElections();
    const interval = setInterval(fetchElections, 60000);
    return () => clearInterval(interval);
  }, [fetchElections]);

  const getElectionStatus = (startTime, endTime, currentStatus) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (currentStatus === "CANCELLED") {
      return { text: "Cancelled", color: "red", bgColor: "bg-red-100", textColor: "text-red-800" };
    } else if (currentStatus === "SCHEDULED" || now < start) {
      return { text: "Scheduled", color: "blue", bgColor: "bg-blue-100", textColor: "text-blue-800" };
    } else if ((currentStatus === "ACTIVE") || (now >= start && now <= end)) {
      return { text: "Active", color: "green", bgColor: "bg-green-100", textColor: "text-green-800" };
    } else {
      return { text: "Completed", color: "green", bgColor: "bg-green-100", textColor: "text-green-800" };
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }) + ' | ' + date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vote Status</h1>
          <p className="text-gray-600">Track and manage all your voting events and meetings</p>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Edit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">View</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {elections.map((item, index) => {
                    const { text: statusText, bgColor, textColor } = getElectionStatus(item.startTime, item.endTime, item.status);
                    return (
                      <React.Fragment key={item.id}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{item.title.split(' ').slice(-3).join(' ')}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{item.title}</td>
                          <td className="px-6 py-4 text-sm">
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
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${bgColor} ${textColor}`}>
                              {statusText}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button className="text-blue-600 hover:text-blue-800">
                              <Edit size={16} />
                            </button>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700">
                              View
                            </button>
                          </td>
                        </tr>

                        {expandedRow === item.id && (
                          <tr className="bg-gray-50 border-t">
                            <td colSpan="9" className="p-4">
                              {candidatesMap[item.id]?.length > 0 ? (
                                <div className="overflow-x-auto">
                                  <table className="min-w-full text-sm border rounded-md">
                                    <thead className="bg-gray-100 text-xs text-gray-700 uppercase">
                                      <tr>
                                        <th className="px-4 py-2 border">
                                          <input
                                            type="checkbox"
                                            onChange={(e) => {
                                              const checked = e.target.checked;
                                              setCandidatesMap(prev => ({
                                                ...prev,
                                                [item.id]: prev[item.id].map(c => ({ ...c, selected: checked }))
                                              }));
                                            }}
                                          />
                                          <span className="ml-2">Check All</span>
                                        </th>
                                        <th className="px-4 py-2 border">Sr No</th>
                                        <th className="px-4 py-2 border">Name</th>
                                        <th className="px-4 py-2 border">Email</th>
                                        <th className="px-4 py-2 border">Share</th>
                                        <th className="px-4 py-2 border">Actions</th> {/* Changed "Email" to "Actions" */}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {candidatesMap[item.id].map((cand, idx) => (
                                        <tr key={cand.id} className="bg-white border-t">
                                          <td className="px-4 py-2 border text-center">
                                            <input
                                              type="checkbox"
                                              checked={cand.selected || false}
                                              onChange={(e) => {
                                                const updated = [...candidatesMap[item.id]];
                                                updated[idx].selected = e.target.checked;
                                                setCandidatesMap(prev => ({
                                                  ...prev,
                                                  [item.id]: updated
                                                }));
                                              }}
                                            />
                                          </td>
                                          <td className="px-4 py-2 border">{idx + 1}</td>
                                          <td className="px-4 py-2 border">{cand.name}</td>
                                          <td className="px-4 py-2 border">{cand.email}</td>
                                          <td className="px-4 py-2 border">{cand.share}</td>
                                          <td className="px-4 py-2 border">
                                            <button
                                              onClick={() => handleResendEmail(item.id, cand.email, cand.name)}
                                              className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-1 px-3 rounded text-xs flex items-center justify-center"
                                              disabled={resendingEmail === cand.email} // Disable button while sending
                                            >
                                              {resendingEmail === cand.email ? (
                                                <>
                                                  <Loader className="animate-spin mr-2" size={14} />
                                                  Sending...
                                                </>
                                              ) : (
                                                "Resend Email"
                                              )}
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div className="text-gray-600">No candidates found.</div>
                              )}
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