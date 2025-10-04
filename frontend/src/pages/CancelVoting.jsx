import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  XCircle,
  AlertCircle,
  CheckCircle,
  Trash2,
  Calendar,
  Clock,
} from "lucide-react";

const CancelVoting = () => {
  const [elections, setElections] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmModal, setConfirmModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await fetch("/api/elections/user-elections", {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("accessToken"),
          },
        });
        const data = await res.json();
        if (res.ok) setElections(data.elections || []);
        else setElections([]);
      } catch {
        setElections([]);
      }
    };
    fetchElections();
  }, []);

  const cancellableElections = useMemo(() => {
    const now = new Date();
    return elections.filter((el) => {
      const endTime = new Date(el.endTime);
      return endTime > now && el.status !== "CANCELLED";
    });
  }, [elections]);

  const handleCancel = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/elections/cancel/${selectedId}`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("accessToken"),
        },
      });
      const data = await res.json();
      
      if (res.ok) {
        // Check if refund was processed
        if (data.refund) {
          setSuccess(
            `Election cancelled successfully! Refund of ${data.refund.currency} ${data.refund.amount} has been initiated. Refund Transaction ID: ${data.refund.refundTransactionId}`
          );
        } else {
          setSuccess("Election cancelled successfully! No payment found to refund.");
        }
        
        setElections(elections.filter((el) => el.id !== selectedId));
        setTimeout(() => navigate("/vote-status"), 4000); // Increased timeout to read message
      } else {
        setError(data.message || "Failed to cancel election.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
    setConfirmModal(false);
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-red-50 via-white to-orange-50 p-6">
      <div className="w-full max-w-2xl bg-white shadow-2xl p-8 rounded-2xl animate-fadeIn relative">
        <div className="text-center mb-8">
          <XCircle className="mx-auto text-red-600 mb-3" size={48} />
          <h2 className="text-3xl font-bold text-gray-900">Cancel Voting Event</h2>
          <p className="text-gray-600 mt-2">
            Select an upcoming or ongoing election to permanently cancel.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-center">
            <AlertCircle className="text-red-500 mr-3" size={22} />
            <span className="text-red-700 font-medium">{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg flex items-center">
            <CheckCircle className="text-green-500 mr-3" size={22} />
            <span className="text-green-700 font-medium">{success}</span>
          </div>
        )}

        <div className="space-y-4 mb-8">
          {cancellableElections.length > 0 ? (
            cancellableElections.map((el) => (
              <label
                key={el.id}
                className={`block border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                  selectedId === el.id
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 hover:border-red-400"
                }`}
              >
                <input
                  type="radio"
                  name="election"
                  value={el.id}
                  checked={selectedId === el.id}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="hidden"
                />
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Calendar size={18} className="text-red-500" />
                      {el.title}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                      <Clock size={16} />
                      {new Date(el.startTime).toLocaleString()} —{" "}
                      {new Date(el.endTime).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      el.status === "ONGOING"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {el.status}
                  </span>
                </div>
              </label>
            ))
          ) : (
            <p className="text-center text-gray-500">
              No upcoming or ongoing elections available.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => selectedId && setConfirmModal(true)}
          disabled={!selectedId || loading}
          className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-xl font-bold hover:from-red-700 hover:to-red-800 transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Cancelling...
            </>
          ) : (
            <>
              <Trash2 size={20} />
              Cancel Election
            </>
          )}
        </button>

        {/* Confirmation Modal */}
        {confirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Confirm Cancellation
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to cancel this election? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setConfirmModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
                >
                  Keep Election
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
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

export default CancelVoting;
