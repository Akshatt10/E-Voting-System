import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertTriangle, FileText, ArrowLeft, Download, FileSpreadsheet, ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../utils/interceptor';

// --- Helper component for the outcome badge ---
const ResultBadge = ({ totals, totalCoCShares }) => {

    const isApproved = totalCoCShares > 0 && (totals.accept / totalCoCShares) >= 0.66;

    const baseClasses = "flex items-center gap-2 text-sm font-bold px-3 py-1 rounded-full";
    if (isApproved) {
        return (
            <span className={`${baseClasses} text-green-700 bg-green-100`}>
                <CheckCircle size={16} /> APPROVED
            </span>
        );
    }
    return (
        <span className={`${baseClasses} text-red-700 bg-red-100`}>
            <XCircle size={16} /> REJECTED
        </span>
    );
};

const VoteProgressBar = ({ totals }) => {
    const totalVoted = totals.accept + totals.reject + totals.abstain;
    if (totalVoted === 0) return <div className="text-sm text-slate-500">No votes were cast.</div>;

    const acceptPct = (totals.accept / totalVoted) * 100;
    const rejectPct = (totals.reject / totalVoted) * 100;
    const abstainPct = (totals.abstain / totalVoted) * 100;

    return (
        <div className="w-full bg-slate-200 rounded-full h-6 flex overflow-hidden my-4 text-white text-xs items-center justify-center font-bold">
            <div className="bg-indigo-600 h-6 flex items-center justify-center" style={{ width: `${acceptPct}%` }} title={`Agree: ${totals.accept.toFixed(2)}%`}>
                {acceptPct > 15 ? `${acceptPct.toFixed(0)}%` : ''}
            </div>
            <div className="bg-slate-500 h-6 flex items-center justify-center" style={{ width: `${rejectPct}%` }} title={`Disagree: ${totals.reject.toFixed(2)}%`}>
                {rejectPct > 15 ? `${rejectPct.toFixed(0)}%` : ''}
            </div>
            <div className="bg-slate-300 h-6 flex items-center justify-center" style={{ width: `${abstainPct}%` }} title={`Abstain: ${totals.abstain.toFixed(2)}%`}>
                {abstainPct > 15 ? `${abstainPct.toFixed(0)}%` : ''}
            </div>
        </div>
    );
};

const VoteResultPage = () => {
    const { electionId } = useParams();
    const navigate = useNavigate();

    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedRows, setExpandedRows] = useState({});
    const [isExportingExcel, setIsExportingExcel] = useState(false);

    // useEffect(() => {
    //     const fetchResults = async () => {
    //         const accessToken = localStorage.getItem("accessToken");
    //         if (!accessToken) {
    //             setError("Authentication failed. Please log in.");
    //             setLoading(false);
    //             return;
    //         }
    //         try {
    //             const res = await fetch(`/api/elections/${electionId}/results`, {
    //                 headers: { 'Authorization': `Bearer ${accessToken}` },
    //             });
    //             const data = await res.json();
    //             if (!res.ok) {
    //                 throw new Error(data.message || 'Failed to fetch results.');
    //             }
    //             setResults(data.results);
    //         } catch (err) {
    //             setError(err.message);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchResults();
    // }, [electionId]);
    useEffect(() => {
        const fetchResults = async () => {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
            setError("Authentication failed. Please log in.");
            setLoading(false);
            return;
            }

            try {
            const res = await api.get(`/elections/${electionId}/results`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            setResults(res.data.results);
            } catch (err) {
            setError(err.response?.data?.message || err.message || "Failed to fetch results.");
            } finally {
            setLoading(false);
            }
        };

        fetchResults();
}, [electionId]);

    const handleExportExcel = () => {
        setIsExportingExcel(true);
        const workbook = XLSX.utils.book_new();
        results.resolutions.forEach((res, index) => {
            const excelData = [
                [`Item No. ${index + 1}: ${res.title}`],
                [],
                ['Name of Members', 'Agree (%)', 'Disagree (%)', 'Abstain (%)', 'Not Voted (%)', 'Submit Time']
            ];
            res.votes.forEach(vote => {
                excelData.push([
                    vote.candidateName,
                    vote.choice === 'ACCEPT' ? vote.share : 0,
                    vote.choice === 'REJECT' ? vote.share : 0,
                    vote.choice === 'ABSTAIN' ? vote.share : 0,
                    0,
                    formatDateTime(vote.votedAt)
                ]);
            });
            res.nonVoters.forEach(nonVoter => {
                excelData.push([nonVoter.candidateName, 0, 0, 0, nonVoter.share, 'NA']);
            });
            excelData.push([]);
            excelData.push(['Total', res.totals.accept, res.totals.reject, res.totals.abstain, res.totals.notVoted]);
            const worksheet = XLSX.utils.aoa_to_sheet(excelData);
            const sheetName = `Resolution ${index + 1}`.substring(0, 31);
            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        });
        XLSX.writeFile(workbook, `vote-results-${results.electionTitle.replace(/ /g, '_')}.xlsx`);
        setIsExportingExcel(false);
    };

    const summaryStats = useMemo(() => {
        if (!results) return null;
        let totalSharesPossible = 0;
        let totalSharesVoted = 0;
        let resolutionsPassed = 0;

        if (results.resolutions.length > 0) {
            const firstRes = results.resolutions[0];
            totalSharesPossible = firstRes.totals.accept + firstRes.totals.reject + firstRes.totals.abstain + firstRes.totals.notVoted;
            totalSharesVoted = firstRes.totals.accept + firstRes.totals.reject + firstRes.totals.abstain;
        }

        results.resolutions.forEach(res => {
            // --- CORRECTED LOGIC ---
            // Use the same total share logic for the summary card
            const totalCoCShares = res.totals.accept + res.totals.reject + res.totals.abstain + res.totals.notVoted;
            if (totalCoCShares > 0 && (res.totals.accept / totalCoCShares) >= 0.66) {
                resolutionsPassed++;
            }
        });

        return {
            turnout: totalSharesPossible > 0 ? ((totalSharesVoted / totalSharesPossible) * 100).toFixed(2) : 0,
            passed: resolutionsPassed,
            rejected: results.resolutions.length - resolutionsPassed,
        };
    }, [results]);


    const formatDateTime = (isoString) => {
        if (!isoString) return 'NA';
        return new Date(isoString).toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: false,
        });
    };

    const toggleRow = (resolutionId) => {
        setExpandedRows(prev => ({
            ...prev,
            [resolutionId]: !prev[resolutionId]
        }));
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
                <p className="mt-4 text-xl font-semibold">Generating Results Report...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-red-50 text-red-800 p-4">
                <AlertTriangle className="w-16 h-16 mb-4" />
                <h1 className="text-3xl font-bold mb-2">Error Fetching Results</h1>
                <p className="text-lg text-center max-w-md">{error}</p>
            </div>
        );
    }

    if (!results) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
                <FileText className="w-12 h-12 text-slate-400" />
                <p className="mt-4 text-xl font-semibold text-slate-600">No results found.</p>
                <p className="text-slate-500">The election may not have results available yet.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={() => navigate('/vote-status')}
                    className="flex items-center gap-2 text-indigo-600 font-semibold mb-6 hover:underline"
                >
                    <ArrowLeft size={20} />
                    Back to Vote Status
                </button>

                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm ring-1 ring-slate-200">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-slate-200 pb-6">
                        {/* This div now grows and allows its content to be truncated */}
                        <div className="flex-1 min-w-0">
                            <h1 className="text-3xl md:text-2xl font-bold text-slate-900 truncate" title={results.electionTitle}>
                                {results.electionTitle}
                            </h1>
                            <p className="text-base md:text-lg text-slate-500 mt-2 truncate" title={results.electionMatter}>
                                {results.electionMatter}
                            </p>
                        </div>
                        {/* This div will no longer shrink or wrap to a new line */}
                        <div className="flex-shrink-0 mt-4 sm:mt-0 sm:ml-4">
                            <button
                                onClick={handleExportExcel}
                                disabled={isExportingExcel}
                                className="bg-green-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-green-800 transition-colors disabled:bg-green-400"
                            >
                                {isExportingExcel ? <Loader2 className="animate-spin" size={16} /> : <FileSpreadsheet size={16} />}
                                {isExportingExcel ? 'Exporting...' : 'Export to Excel'}
                            </button>
                        </div>
                    </div>

                    {summaryStats && (
                        <div className="mb-12">
                            <h2 className="text-xl font-bold text-slate-800 mb-4">Results Summary</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-xl ring-1 ring-slate-200 border-t-4 border-indigo-500">
                                    <h3 className="text-base font-semibold text-slate-500">Voter Turnout</h3>
                                    <p className="text-4xl font-bold text-slate-900 mt-2">{summaryStats.turnout}%</p>
                                </div>
                                <div className="bg-white p-6 rounded-xl ring-1 ring-slate-200 border-t-4 border-green-500">
                                    <h3 className="text-base font-semibold text-slate-500">Resolutions Approved</h3>
                                    <p className="text-4xl font-bold text-slate-900 mt-2">{summaryStats.passed}</p>
                                </div>
                                <div className="bg-white p-6 rounded-xl ring-1 ring-slate-200 border-t-4 border-red-500">
                                    <h3 className="text-base font-semibold text-slate-500">Resolutions Rejected</h3>
                                    <p className="text-4xl font-bold text-slate-900 mt-2">{summaryStats.rejected}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-8">
                        {results.resolutions.map((res, index) => (
                            <div key={res.resolutionId} className="bg-white ring-1 ring-slate-900/5 rounded-xl">
                                <div className="p-4 bg-slate-50/75 flex justify-between items-center rounded-t-xl">
                                    <h2 className="text-xl font-bold text-slate-800">
                                        Item No. {index + 1}: {res.title}
                                    </h2>
                                    <ResultBadge totals={res.totals} />
                                </div>

                                <div className="p-6">
                                    <div className="prose max-w-none text-slate-600 mb-4" dangerouslySetInnerHTML={{ __html: res.description }} />
                                    <VoteProgressBar totals={res.totals} />
                                    <button onClick={() => toggleRow(res.resolutionId)} className="flex items-center gap-2 text-sm text-indigo-600 font-semibold hover:underline mt-4">
                                        {expandedRows[res.resolutionId] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        {expandedRows[res.resolutionId] ? 'Hide Detailed Votes' : 'Show Detailed Votes'}
                                    </button>

                                    {expandedRows[res.resolutionId] && (
                                        <div className="mt-4 overflow-x-auto animate-fade-in">
                                            <table className="min-w-full border-t border-slate-200 text-sm">
                                                <thead className="bg-slate-50 text-left">
                                                    <tr>
                                                        <th className="p-3 font-semibold text-slate-600">Name of Members</th>
                                                        <th className="p-3 font-semibold text-slate-600 text-center">Agree (%)</th>
                                                        <th className="p-3 font-semibold text-slate-600 text-center">Disagree (%)</th>
                                                        <th className="p-3 font-semibold text-slate-600 text-center">Abstain (%)</th>
                                                        <th className="p-3 font-semibold text-slate-600 text-center">Not Voted (%)</th>
                                                        <th className="p-3 font-semibold text-slate-600">Submit Time</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200">
                                                    {res.votes.map(vote => (
                                                        <tr key={vote.candidateName}>
                                                            <td className="p-3 font-medium text-slate-800">{vote.candidateName}</td>
                                                            <td className="p-3 text-center text-slate-700">{vote.choice === 'ACCEPT' ? vote.share.toFixed(2) : '-'}</td>
                                                            <td className="p-3 text-center text-slate-700">{vote.choice === 'REJECT' ? vote.share.toFixed(2) : '-'}</td>
                                                            <td className="p-3 text-center text-slate-700">{vote.choice === 'ABSTAIN' ? vote.share.toFixed(2) : '-'}</td>
                                                            <td className="p-3 text-center text-slate-700">-</td>
                                                            <td className="p-3 text-slate-500">{formatDateTime(vote.votedAt)}</td>
                                                        </tr>
                                                    ))}
                                                    {res.nonVoters && res.nonVoters.map(nonVoter => (
                                                        <tr key={nonVoter.candidateName}>
                                                            <td className="p-3 font-medium text-slate-800">{nonVoter.candidateName}</td>
                                                            <td className="p-3 text-center text-slate-700">-</td>
                                                            <td className="p-3 text-center text-slate-700">-</td>
                                                            <td className="p-3 text-center text-slate-700">-</td>
                                                            <td className="p-3 text-center text-slate-700">{nonVoter.share.toFixed(2)}</td>
                                                            <td className="p-3 text-slate-500">NA</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot className="bg-slate-100 font-bold">
                                                    <tr>
                                                        <td className="p-3 border-t-2 border-slate-300">Total</td>
                                                        <td className="p-3 border-t-2 border-slate-300 text-center">{res.totals.accept.toFixed(2)}</td>
                                                        <td className="p-3 border-t-2 border-slate-300 text-center">{res.totals.reject.toFixed(2)}</td>
                                                        <td className="p-3 border-t-2 border-slate-300 text-center">{res.totals.abstain.toFixed(2)}</td>
                                                        <td className="p-3 border-t-2 border-slate-300 text-center">{res.totals.notVoted ? res.totals.notVoted.toFixed(2) : '0.00'}</td>
                                                        <td className="p-3 border-t-2 border-slate-300"></td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoteResultPage;
