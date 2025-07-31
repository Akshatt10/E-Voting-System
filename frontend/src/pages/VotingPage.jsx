import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ShieldAlert, ShieldCheck, ThumbsUp, ThumbsDown, CircleSlash, Send, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

// Helper component for the countdown timer
const CountdownTimer = ({ endTime }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(endTime) - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearTimeout(timer);
    });

    const format = (value, label) => value > 0 ? `${value}${label}` : '';
    
    const timeString = [
        format(timeLeft.days, 'd'),
        format(timeLeft.hours, 'h'),
        format(timeLeft.minutes, 'm'),
        `${timeLeft.seconds < 10 ? '0' : ''}${timeLeft.seconds || 0}s`
    ].filter(Boolean).join(' : ');

    return (
        <div className="flex items-center gap-2 text-sm font-semibold text-red-700 bg-red-100 px-3 py-2 rounded-full">
            <Clock size={16} />
            <span>Voting Ends In:</span>
            <span className="font-mono text-base">{timeLeft.days || timeLeft.hours || timeLeft.minutes || timeLeft.seconds ? timeString : "Time's up!"}</span>
        </div>
    );
};


const VotePage = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [election, setElection] = useState(null);
    const [votes, setVotes] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [voteSubmitted, setVoteSubmitted] = useState(false);
    const [activeResolutionId, setActiveResolutionId] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        if (!token) {
            setError("No voting token provided. This link is invalid.");
            setLoading(false);
            return;
        }

        const fetchVoteDetails = async () => {
            try {
                const res = await fetch(`/api/elections/vote/details/${token}`);
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || "An unknown error occurred.");
                }
                setElection(data.election);
                if (data.election?.resolutions?.length > 0) {
                    setActiveResolutionId(data.election.resolutions[0].id);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchVoteDetails();
    }, [token]);

    const handleVoteChange = (resolutionId, choice) => {
        setVotes(prev => ({ ...prev, [resolutionId]: choice }));
    };

    const handleSubmit = () => {
        if (Object.keys(votes).length !== election.resolutions.length) {
            alert("Please cast your vote for all resolutions before submitting.");
            return;
        }
        setShowConfirmModal(true);
    };

    const handleConfirmSubmit = async () => {
        setShowConfirmModal(false);
        setIsSubmitting(true);
        setError(null);

        try {
            const res = await fetch(`/api/elections/vote/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, votes }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to submit vote.');
            }
            setVoteSubmitted(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Loading, Error, and Submitted states are unchanged
    if (loading) {
        return (
             <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 text-gray-700">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
                <p className="mt-4 text-xl font-semibold">Loading Voting Portal...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-red-50 text-red-800 p-4">
                <ShieldAlert className="w-16 h-16 mb-4" />
                <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
                <p className="text-lg text-center max-w-md">{error}</p>
            </div>
        );
    }
    
    if (voteSubmitted) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-green-50 text-green-800 p-4">
                <ShieldCheck className="w-16 h-16 mb-4" />
                <h1 className="text-3xl font-bold mb-2">Thank You!</h1>
                <p className="text-lg text-center max-w-md">Your vote has been successfully recorded.</p>
                <button onClick={() => navigate('/')} className="mt-6 bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors">
                    Return to Home
                </button>
            </div>
        );
    }

    if (!election) {
        return null; // Should be handled by loading/error states
    }
    
    const activeResolution = election.resolutions.find(res => res.id === activeResolutionId);
    const allVotesCast = Object.keys(votes).length === election.resolutions.length;

    const ConfirmationModal = () => (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 shadow-xl max-w-md w-full">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Confirm Your Vote</h2>
                <p className="text-gray-600 mb-8">Are you sure you want to submit your final vote? This action cannot be undone.</p>
                <div className="flex justify-end gap-4">
                    <button onClick={() => setShowConfirmModal(false)} className="px-6 py-2 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition-colors">Cancel</button>
                    <button onClick={handleConfirmSubmit} className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors">Confirm & Submit</button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {showConfirmModal && <ConfirmationModal />}
            {/* Header */}
            <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{election.title}</h1>
                        <p className="text-sm text-gray-500">{election.Matter}</p>
                    </div>
                    <CountdownTimer endTime={election.endTime} />
                </div>
            </header>

            <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row gap-8 p-4 md:p-8">
                {/* Sidebar Navigation */}
                <aside className="w-full md:w-1/4 lg:w-1/5">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 px-1">Resolutions</h2>
                    <nav className="space-y-2">
                        {election.resolutions.map((res, index) => (
                            <button
                                key={res.id}
                                onClick={() => setActiveResolutionId(res.id)}
                                className={`w-full text-left p-3 rounded-lg flex items-center justify-between transition-colors text-base ${
                                    activeResolutionId === res.id ? 'bg-indigo-600 text-white shadow' : 'text-gray-700 hover:bg-indigo-50'
                                }`}
                            >
                                <span className="font-semibold">Item #{index + 1}</span>
                                {votes[res.id] && <CheckCircle className="text-green-400" size={20} />}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 bg-white p-6 sm:p-8 rounded-xl shadow-lg">
                    {activeResolution ? (
                        <div>
                            <h3 className="text-3xl font-extrabold text-gray-800 mb-2">
                                {activeResolution.title}
                            </h3>
                            <div className="border-t border-gray-200 mt-4 mb-6"></div>
                            <div
                                className="prose prose-lg max-w-none text-gray-700 mb-8"
                                dangerouslySetInnerHTML={{ __html: activeResolution.description }}
                            />
                            <div className="bg-gray-50 p-6 rounded-lg border mt-10">
                                 <h4 className="text-lg font-semibold text-center text-gray-700 mb-4">Cast Your Vote for this Item</h4>
                                <div className="flex flex-col sm:flex-row justify-center gap-4">
                                    {['ACCEPT', 'REJECT', 'ABSTAIN'].map((choice) => (
                                        <button
                                            key={choice}
                                            onClick={() => handleVoteChange(activeResolution.id, choice)}
                                            className={`w-full font-bold py-3 px-6 rounded-lg transition-all duration-200 ease-in-out transform flex items-center justify-center gap-2 text-lg border-2
                                                ${votes[activeResolution.id] === choice
                                                    ? (choice === 'ACCEPT' ? 'bg-indigo-600 text-white border-indigo-700 shadow-lg scale-105' :
                                                       choice === 'REJECT' ? 'bg-gray-700 text-white border-gray-800 shadow-lg scale-105' :
                                                       'bg-gray-500 text-white border-gray-600 shadow-lg scale-105')
                                                    : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100 hover:border-gray-400'
                                                }`}
                                        >
                                            {choice === 'ACCEPT' && <ThumbsUp />}
                                            {choice === 'REJECT' && <ThumbsDown />}
                                            {choice === 'ABSTAIN' && <CircleSlash />}
                                            {activeResolution[choice.toLowerCase() + 'Label'] || choice}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p>Select a resolution to view.</p>
                    )}
                </main>
            </div>
             {/* Footer for Submission */}
            <footer className="bg-white/90 backdrop-blur-sm p-4 sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] border-t">
                 <div className="max-w-3xl mx-auto text-center">
                     <button
                        onClick={handleSubmit}
                        disabled={!allVotesCast || isSubmitting}
                        className="w-full bg-indigo-600 text-white font-bold py-4 px-6 rounded-xl text-xl flex items-center justify-center gap-3
                                   hover:bg-indigo-700 transition-colors disabled:bg-indigo-300 disabled:cursor-not-allowed shadow-lg"
                    >
                        {isSubmitting ? (
                            <><Loader2 className="animate-spin" /> Submitting Final Vote...</>
                        ) : (
                            <><Send /> Submit Final Vote</>
                        )}
                    </button>
                    {!allVotesCast && (
                        <p className="text-center text-sm text-gray-600 mt-2 flex items-center justify-center gap-2">
                            <AlertTriangle size={16} className="text-yellow-600" /> You must vote on all {election.resolutions.length} resolutions to submit.
                        </p>
                    )}
                 </div>
            </footer>
        </div>
    );
};

export default VotePage;
