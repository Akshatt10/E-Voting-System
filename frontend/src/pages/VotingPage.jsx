import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ShieldAlert, ShieldCheck, ThumbsUp, ThumbsDown, CircleSlash, Send, AlertTriangle } from 'lucide-react';

const VotePage = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [election, setElection] = useState(null);
    const [votes, setVotes] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [voteSubmitted, setVoteSubmitted] = useState(false);

    useEffect(() => {
        if (!token) {
            setError("No voting token provided. This link is invalid.");
            setLoading(false);
            return;
        }

        const fetchVoteDetails = async () => {
            try {
                const res = await fetch(`http://localhost:3000/api/elections/vote/details/${token}`);
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || "An unknown error occurred.");
                }

                setElection(data.election);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchVoteDetails();
    }, [token]);

    const handleVoteChange = (resolutionId, choice) => {
        setVotes(prev => ({
            ...prev,
            [resolutionId]: choice
        }));
    };

    const handleSubmit = async () => {
    if (Object.keys(votes).length !== election.resolutions.length) {
        alert("Please cast your vote for all resolutions.");
        return;
    }

    setIsSubmitting(true);
    setError(null);

    // --- THIS IS THE UPDATED PART ---
    try {
        const res = await fetch(`http://localhost:3000/api/elections/vote/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token, votes }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || 'Failed to submit vote.');
        }

        // If successful, show the "Thank You" screen
        setVoteSubmitted(true);

    } catch (err) {
        setError(err.message);
    } finally {
        setIsSubmitting(false);
    }
}; // <-- Correctly close handleSubmit function here

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 text-gray-700">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
                <p className="mt-4 text-xl font-semibold">Validating your voting link...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-red-50 text-red-800 p-4">
                <ShieldAlert className="w-16 h-16 mb-4" />
                <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
                <p className="text-lg text-center max-w-md">{error}</p>
                <p className="mt-4 text-sm text-red-600">If you believe this is an error, please contact the election administrator.</p>
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

    const allVotesCast = Object.keys(votes).length === election.resolutions.length;

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-gray-800">{election.title}</h1>
                    <p className="text-lg text-gray-600 mt-2">{election.Matter}</p>
                </div>
                
                <div className="space-y-8">
                    {election.resolutions.map((res, index) => (
                        <div key={res.id} className="p-6 border border-gray-200 rounded-lg bg-gray-50/50">
                            <h3 className="text-2xl font-bold text-gray-800 mb-3">
                                Resolution #{index + 1}: {res.title}
                            </h3>
                            <div
                                className="prose prose-lg max-w-none text-gray-700 mb-6"
                                dangerouslySetInnerHTML={{ __html: res.description }}
                            />
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                {['ACCEPT', 'REJECT', 'ABSTAIN'].map((choice) => (
                                    <button
                                        key={choice}
                                        onClick={() => handleVoteChange(res.id, choice)}
                                        className={`w-full font-bold py-3 px-6 rounded-lg transition-all duration-200 ease-in-out transform flex items-center justify-center gap-2 text-lg
                                            ${votes[res.id] === choice
                                                ? (choice === 'ACCEPT' ? 'bg-green-600 text-white shadow-lg scale-105' :
                                                   choice === 'REJECT' ? 'bg-red-600 text-white shadow-lg scale-105' :
                                                   'bg-gray-600 text-white shadow-lg scale-105')
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                    >
                                        {choice === 'ACCEPT' && <ThumbsUp />}
                                        {choice === 'REJECT' && <ThumbsDown />}
                                        {choice === 'ABSTAIN' && <CircleSlash />}
                                        {res[choice.toLowerCase() + 'Label'] || choice}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-10 pt-6 border-t border-gray-200">
                    <button
                        onClick={handleSubmit}
                        disabled={!allVotesCast || isSubmitting}
                        className="w-full bg-indigo-600 text-white font-bold py-4 px-6 rounded-xl text-xl flex items-center justify-center gap-3
                                   hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="animate-spin" /> Submitting Your Vote...
                            </>
                        ) : (
                            <>
                                <Send /> Submit My Vote
                            </>
                        )}
                    </button>
                    {!allVotesCast && (
                        <p className="text-center text-sm text-yellow-700 mt-3 flex items-center justify-center gap-2">
                            <AlertTriangle size={16} /> Please vote on all resolutions to submit.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VotePage;