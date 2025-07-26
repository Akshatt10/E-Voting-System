import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, FileText, Loader2, XCircle } from 'lucide-react';

const ElectionDetails = () => {
    const { id } = useParams();
    const [election, setElection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchElection = async () => {
            try {
                setLoading(true);
                // Ensure you're using the correct API endpoint
                const res = await fetch(`/api/elections/${id}`);
                const data = await res.json();

                if (res.ok && data.success) {
                    setElection(data.election);
                } else {
                    throw new Error(data.message || 'Failed to fetch election details.');
                }
            } catch (err) {
                console.error("Error fetching election:", err);
                setError(err.message || 'An unexpected error occurred.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchElection();
        }
    }, [id]);

    // Loading, Error, and Not Found states remain the same...
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p className="ml-2 text-lg text-gray-700">Loading election details...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-red-600">
                <XCircle className="w-10 h-10 mb-2" />
                <p className="text-xl font-semibold">Error:</p>
                <p className="text-lg text-center px-4">{error}</p>
                <p className="text-sm mt-2 text-gray-500">Please try again later or check the election ID.</p>
            </div>
        );
    }

    if (!election) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
                <FileText className="w-10 h-10 mb-2" />
                <p className="text-xl font-semibold">Election Not Found</p>
            </div>
        );
    }

    const formatDateTime = (isoString) => {
        if (!isoString) return 'N/A';
        return new Date(isoString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-10 sm:py-16 bg-white rounded-xl shadow-2xl border border-gray-100 animate-fade-in">
            <h1 className="text-4xl font-extrabold text-center text-blue-700 mb-4 tracking-tight">
                🗳️ {election.title}
            </h1>
            <p className="text-center text-lg text-gray-600 mb-10">{election.Matter}</p>
            
            <div className="space-y-8">
                {/* --- NEW: Resolutions Section --- */}
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <FileText className="w-6 h-6 text-blue-600 flex-shrink-0" />
                        <h2 className="text-2xl font-bold text-gray-800">Resolutions</h2>
                    </div>
                    <div className="pl-9 space-y-6">
                        {election.resolutions && election.resolutions.length > 0 ? (
                            election.resolutions.map((resolution, index) => (
                                <div key={resolution.id || index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{resolution.title}</h3>
                                    {/* This div safely renders the HTML from the rich text editor */}
                                    <div
                                        className="prose prose-blue max-w-none text-gray-700"
                                        dangerouslySetInnerHTML={{ __html: resolution.description }}
                                    />
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">No resolutions found for this election.</p>
                        )}
                    </div>
                </div>

                {/* --- Schedule Section --- */}
                <div className="space-y-4">
                     <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                        <Calendar className="w-6 h-6 text-green-600 flex-shrink-0" />
                        <div>
                            <p className="text-lg font-semibold">Voting Starts:</p>
                            <p className="text-md">{formatDateTime(election.startTime)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                        <Calendar className="w-6 h-6 text-red-600 flex-shrink-0" />
                        <div>
                            <p className="text-lg font-semibold">Voting Ends:</p>
                            <p className="text-md">{formatDateTime(election.endTime)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action buttons section remains the same */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <button
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg text-lg font-semibold transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
                >
                    Accept Nomination
                </button>
                <button
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg text-lg font-semibold transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
                >
                    Reject Nomination
                </button>
                <button
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg text-lg font-semibold transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
                >
                    View Candidates
                </button>
            </div>

            <p className="text-center text-sm text-gray-500 mt-8">
                Please ensure you review all details before making your decision.
            </p>
        </div>
    );
};

export default ElectionDetails;