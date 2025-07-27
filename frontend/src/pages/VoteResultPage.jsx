import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertTriangle, FileText, ArrowLeft, Download, FileSpreadsheet, ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';


const ResultBadge = ({ totals }) => {

    const participatingShares = totals.accept + totals.reject;
    const isApproved = participatingShares > 0 && (totals.accept / participatingShares) > 0.5;

    if (isApproved) {
        return (
            <span className="flex items-center gap-2 text-sm font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                <CheckCircle size={16} /> APPROVED
            </span>
        );
    }
    return (
        <span className="flex items-center gap-2 text-sm font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full">
            <XCircle size={16} /> REJECTED
        </span>
    );
};

// --- NEW: Helper component for the visual progress bar ---
const VoteProgressBar = ({ totals }) => {
    const totalVoted = totals.accept + totals.reject + totals.abstain;
    if (totalVoted === 0) return null; // Don't show a bar if no one voted

    const acceptPct = (totals.accept / totalVoted) * 100;
    const rejectPct = (totals.reject / totalVoted) * 100;
    const abstainPct = (totals.abstain / totalVoted) * 100;

    return (
        <div className="w-full bg-gray-200 rounded-full h-6 flex overflow-hidden my-4">
            <div className="bg-green-500 h-6" style={{ width: `${acceptPct}%` }} title={`Agree: ${totals.accept.toFixed(2)}%`}></div>
            <div className="bg-red-500 h-6" style={{ width: `${rejectPct}%` }} title={`Disagree: ${totals.reject.toFixed(2)}%`}></div>
            <div className="bg-gray-400 h-6" style={{ width: `${abstainPct}%` }} title={`Abstain: ${totals.abstain.toFixed(2)}%`}></div>
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

    const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
    const [isExportingExcel, setIsExportingExcel] = useState(false);
    const contentRef = useRef(null); // Ref for PDF export

    useEffect(() => {
        const fetchResults = async () => {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                setError("Authentication failed. Please log in.");
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`http://localhost:3000/api/elections/${electionId}/results`, {
                    headers: { 'Authorization': `Bearer ${accessToken}` },
                });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || 'Failed to fetch results.');
                }
                setResults(data.results);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [electionId]);

    const handleDownloadPDF = () => {
        setIsDownloadingPDF(true);
        const element = contentRef.current;
        const opt = {
            margin: 0.5,
            filename: `vote-results-${results.electionTitle.replace(/ /g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save().then(() => {
            setIsDownloadingPDF(false);
        });
    };

    // --- NEW: Handler for Excel Export ---
    const handleExportExcel = () => {
        setIsExportingExcel(true);

        const workbook = XLSX.utils.book_new();

        results.resolutions.forEach((res, index) => {
            const excelData = [];
            // Add headers
            excelData.push([`Item No. ${index + 1}: ${res.title}`]);
            excelData.push([]); // Blank row
            excelData.push(['Name of Members', 'Agree (%)', 'Disagree (%)', 'Abstain (%)', 'Submit Time']);

            // Add voted rows
            res.votes.forEach(vote => {
                excelData.push([
                    vote.candidateName,
                    vote.choice === 'ACCEPT' ? vote.share : 0,
                    vote.choice === 'REJECT' ? vote.share : 0,
                    vote.choice === 'ABSTAIN' ? vote.share : 0,
                    formatDateTime(vote.votedAt)
                ]);
            });

            // Add non-voter rows
            res.nonVoters.forEach(nonVoter => {
                excelData.push([nonVoter.candidateName, 'Not Voted', '', '', 'NA']);
            });

            // Add total row
            excelData.push([]); // Blank row
            excelData.push(['Total', res.totals.accept, res.totals.reject, res.totals.abstain]);

            const worksheet = XLSX.utils.aoa_to_sheet(excelData);
            // Use a truncated title for the sheet name (max 31 chars)
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

        // Use the first resolution to get the list of all candidates and their shares
        if (results.resolutions.length > 0) {
            const firstRes = results.resolutions[0];
            totalSharesPossible = firstRes.votes.reduce((sum, v) => sum + v.share, 0) + firstRes.nonVoters.reduce((sum, nv) => sum + nv.share, 0);
            totalSharesVoted = firstRes.totals.accept + firstRes.totals.reject + firstRes.totals.abstain;
        }

        results.resolutions.forEach(res => {
            const participatingShares = res.totals.accept + res.totals.reject;
            if (participatingShares > 0 && (res.totals.accept / participatingShares) > 0.5) {
                resolutionsPassed++;
            }
        });

        return {
            turnout: totalSharesPossible > 0 ? ((totalSharesVoted / totalSharesPossible) * 100).toFixed(2) : 0,
            passed: resolutionsPassed,
            rejected: results.resolutions.length - resolutionsPassed,
        };
    }, [results]);

    const toggleRow = (resolutionId) => {
        setExpandedRows(prev => ({
            ...prev,
            [resolutionId]: !prev[resolutionId]
        }));
    };


    const formatDateTime = (isoString) => {
        if (!isoString) return 'NA';
        return new Date(isoString).toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: false,
        });
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
        return <div>No results found.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={() => navigate('/vote-status')}
                    className="flex items-center gap-2 text-indigo-600 font-semibold mb-6 hover:underline"
                >
                    <ArrowLeft size={20} />
                    Back to Vote Status
                </button>

                <div ref={contentRef} className="bg-white p-8 rounded-xl shadow-lg">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b pb-6">
                        <div>
                            <h1 className="text-4xl font-extrabold text-gray-800">{results.electionTitle}</h1>
                            <p className="text-lg text-gray-600 mt-2">{results.electionMatter}</p>
                        </div>
                        <div className="flex-wrap gap-2 mt-5 sm:mt-0">
    
                            <button
                                onClick={handleDownloadPDF}
                                disabled={isDownloadingPDF}
                                className="bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-gray-900 transition-colors disabled:bg-gray-500 mr-2"
                            >
                                {isDownloadingPDF ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                                {isDownloadingPDF ? 'Generating...' : 'Download PDF'}
                            </button>
                            <button
                                onClick={handleExportExcel}
                                disabled={isExportingExcel}
                                className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors disabled:bg-green-400"
                            >
                                {isExportingExcel ? <Loader2 className="animate-spin" size={16} /> : <FileSpreadsheet size={16} />}
                                {isExportingExcel ? 'Exporting...' : 'Export to Excel'}
                            </button>
                        </div>
                    </div>
                    {/* --- NEW: Results Summary Card --- */}
                    {summaryStats && (
                        <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 text-center">
                                <h3 className="text-lg font-semibold text-blue-800">Voter Turnout</h3>
                                <p className="text-4xl font-bold text-blue-600 mt-2">{summaryStats.turnout}%</p>
                            </div>
                            <div className="bg-green-50 p-6 rounded-lg border border-green-200 text-center">
                                <h3 className="text-lg font-semibold text-green-800">Resolutions Approved</h3>
                                <p className="text-4xl font-bold text-green-600 mt-2">{summaryStats.passed}</p>
                            </div>
                            <div className="bg-red-50 p-6 rounded-lg border border-red-200 text-center">
                                <h3 className="text-lg font-semibold text-red-800">Resolutions Rejected</h3>
                                <p className="text-4xl font-bold text-red-600 mt-2">{summaryStats.rejected}</p>
                            </div>
                        </div>
                    )}


                    <div className="space-y-8">
                        {results.resolutions.map((res, index) => (
                            <div key={res.resolutionId} className="border border-gray-200 rounded-xl overflow-hidden">
                                {/* --- MODIFIED: Resolution Header --- */}
                                <div className="p-4 bg-gray-50 flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-gray-800">
                                        Item No. {index + 1}: {res.title}
                                    </h2>
                                    <ResultBadge totals={res.totals} />
                                </div>

                                <div className="p-6">
                                    <div className="prose max-w-none text-gray-700 mb-4" dangerouslySetInnerHTML={{ __html: res.description }} />

                                    {/* --- NEW: Progress Bar --- */}
                                    <VoteProgressBar totals={res.totals} />

                                    {/* --- NEW: Collapsible Section --- */}
                                    <button onClick={() => toggleRow(res.resolutionId)} className="flex items-center gap-2 text-sm text-indigo-600 font-semibold hover:underline mt-4">
                                        {expandedRows[res.resolutionId] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        {expandedRows[res.resolutionId] ? 'Hide Detailed Votes' : 'Show Detailed Votes'}
                                    </button>

                                    {expandedRows[res.resolutionId] && (
                                        <div className="mt-4 overflow-x-auto animate-fade-in">
                                            <table className="min-w-full border border-gray-200 text-sm">
                                                <thead className="bg-gray-50 text-left">
                                                    <tr>
                                                        <th className="p-3 font-semibold text-gray-600 border-b">Name of Members</th>
                                                        <th className="p-3 font-semibold text-gray-600 border-b text-center">Agree (%)</th>
                                                        <th className="p-3 font-semibold text-gray-600 border-b text-center">Disagree (%)</th>
                                                        <th className="p-3 font-semibold text-gray-600 border-b text-center">Abstain (%)</th>
                                                        <th className="p-3 font-semibold text-gray-600 border-b text-center">Not Voted (%)</th>
                                                        <th className="p-3 font-semibold text-gray-600 border-b">Submit Time</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {res.votes.map(vote => (
                                                        <tr key={vote.candidateName}>
                                                            <td className="p-3">{vote.candidateName}</td>
                                                            <td className="p-3 text-center text-green-600">{vote.choice === 'ACCEPT' ? vote.share.toFixed(2) : '0.00'}</td>
                                                            <td className="p-3 text-center text-red-600">{vote.choice === 'REJECT' ? vote.share.toFixed(2) : '0.00'}</td>
                                                            <td className="p-3 text-center text-gray-600">{vote.choice === 'ABSTAIN' ? vote.share.toFixed(2) : '0.00'}</td>
                                                            <td className="p-3 text-center text-orange-600">{vote.choice === 'NOT_VOTED' ? vote.share.toFixed(2) : '0.00'}</td>
                                                            <td className="p-3 text-gray-500">{formatDateTime(vote.votedAt)}</td>
                                                        </tr>
                                                    ))}
                                                    {res.nonVoters.map(nonVoter => (
                                                        <tr key={nonVoter.candidateName} className="bg-gray-50">
                                                            <td className="p-3">{nonVoter.candidateName}</td>
                                                            <td className="p-3 text-center">0.00</td>
                                                            <td className="p-3 text-center">0.00</td>
                                                            <td className="p-3 text-center">0.00</td>
                                                            <td className="p-3 text-center text-orange-600">{nonVoter.share.toFixed(2)}</td>
                                                            <td className="p-3 text-gray-500">NA</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot className="bg-gray-100 font-bold">
                                                    <tr>
                                                        <td className="p-3 border-t-2 border-gray-300">Total</td>
                                                        <td className="p-3 border-t-2 border-gray-300 text-center">{res.totals.accept.toFixed(2)}</td>
                                                        <td className="p-3 border-t-2 border-gray-300 text-center">{res.totals.reject.toFixed(2)}</td>
                                                        <td className="p-3 border-t-2 border-gray-300 text-center">{res.totals.abstain.toFixed(2)}</td>
                                                        <td className="p-3 border-t-2 border-gray-300 text-center">{res.totals.notVoted.toFixed(2)}</td>
                                                        <td className="p-3 border-t-2 border-gray-300"></td>
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