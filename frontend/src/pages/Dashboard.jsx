import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Plus, User, Clock, Calendar, CheckCircle, XCircle,
    Loader, AlertCircle, Info, Play, BarChart2, ListTodo, Eye, CreditCard, TrendingUp
} from 'lucide-react';
import ElectionDetails from '../pages/ElectionDetails';
import api from '../utils/interceptor';
import { socket } from '../utils/socket';

const Dashboard = () => {
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [paymentStats, setPaymentStats] = useState({ totalAmount: 0, totalPayments: 0 });
    const [recentPayments, setRecentPayments] = useState([]);
    const navigate = useNavigate();

    const [selectedElectionId, setSelectedElectionId] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                const [userResponse, electionsResponse, paymentStatsResponse, paymentsResponse] = await Promise.all([
                    api.get('/auth/current-user'),
                    api.get("/elections/user-elections"),
                    api.get('elections/payments/stats'),
                    api.get('elections/payments/history')
                ]);
                setUser(userResponse.data);
                setElections(electionsResponse.data.elections || []);
                setPaymentStats(paymentStatsResponse.data.stats || { totalAmount: 0, totalPayments: 0 });
                setRecentPayments(paymentsResponse.data.payments?.slice(0, 3) || []); // Get last 3 payments
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                setError(err.response?.data?.message || err.message || "Could not load dashboard data.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (user?.id) {
            socket.connect();
            socket.emit('joinUserRoom', user.id);

            const handleElectionUpdate = (updatedElection) => {
                console.log('Received real-time election update:', updatedElection);
                setElections(prevElections =>
                    prevElections.map(e =>
                        e.id === updatedElection.id ? { ...e, status: updatedElection.status } : e
                    )
                );
            };

            socket.on('electionUpdate', handleElectionUpdate);

            return () => {
                console.log("Disconnecting socket...");
                socket.off('electionUpdate', handleElectionUpdate);
                socket.disconnect();
            };
        }
    }, [user]);

    const handleViewElection = (electionId) => {
        setSelectedElectionId(electionId);
        setShowDetails(true);
    };

    const handleBackFromDetails = () => {
        setShowDetails(false);
        setSelectedElectionId(null);
    };

    const getStatus = (startTime, endTime, status) => {
        const now = new Date();
        const start = new Date(startTime);
        const end = new Date(endTime);
        if (status === "CANCELLED") return { text: "Cancelled", icon: XCircle, color: "text-red-700", bgColor: "bg-red-50" };
        if (now < start && status !== "ONGOING") return { text: "Scheduled", icon: Calendar, color: "text-blue-700", bgColor: "bg-blue-50" };
        if (now >= start && now <= end && status !== "COMPLETED") return { text: "Active", icon: Play, color: "text-green-700", bgColor: "bg-green-50" };
        return { text: "Completed", icon: CheckCircle, color: "text-slate-600", bgColor: "bg-slate-100" };
    };

    const summaryStats = useMemo(() => {
        const stats = { total: elections.length, active: 0, scheduled: 0, completed: 0 };
        elections.forEach(e => {
            const statusText = getStatus(e.startTime, e.endTime, e.status).text;
            if (statusText === 'Active') stats.active++;
            else if (statusText === 'Scheduled') stats.scheduled++;
            else if (statusText === 'Completed') stats.completed++;
        });
        return stats;
    }, [elections]);

    const recentActivity = useMemo(() => {
        return [...elections]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
    }, [elections]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-slate-50">
                <Loader className="animate-spin text-indigo-600" size={40} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex items-center">
                    <AlertCircle className="mr-3" size={24} />
                    <span>{error}</span>
                </div>
            </div>
        );
    }

    if (showDetails && selectedElectionId) {
        return (
            <ElectionDetails
                electionId={selectedElectionId}
                onBack={handleBackFromDetails}
            />
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900">
                            Welcome back, {user ? user.firstname : '...'}!
                        </h1>
                        <p className="text-slate-600 mt-2 text-lg">Here's a summary of your voting activities.</p>
                    </div>
                    <Link
                        to="/create-voting"
                        className="mt-4 sm:mt-0 bg-slate-800 text-white font-semibold py-3 px-5 rounded-lg flex items-center gap-2 hover:bg-slate-900 transition-colors shadow-sm"
                    >
                        <Plus size={20} />
                        Create New Election
                    </Link>
                </header>

                {/* Summary Stat Cards - Now includes payment stats */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-10">
                    <StatCard icon={ListTodo} title="Total Elections" value={summaryStats.total} color="indigo" />
                    <StatCard icon={Play} title="Active Elections" value={summaryStats.active} color="green" />
                    <StatCard icon={Calendar} title="Scheduled Elections" value={summaryStats.scheduled} color="blue" />
                    <StatCard icon={CheckCircle} title="Completed Elections" value={summaryStats.completed} color="slate" />
                    <StatCard icon={CreditCard} title="Total Payments" value={paymentStats.totalPayments} color="purple" />
                    <StatCard 
                        icon={TrendingUp} 
                        title="Total Spent" 
                        value={`₹${paymentStats.totalAmount.toFixed(0)}`} 
                        color="emerald" 
                    />
                </section>

                {/* Two Column Layout: Recent Activity + Recent Payments */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">
                    {/* Recent Activity Table */}
                    <section className="xl:col-span-2">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-slate-800">Recent Activity</h2>
                            <Link 
                                to="/vote-status" 
                                className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm"
                            >
                                View All →
                            </Link>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
                            {recentActivity.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full divide-y divide-slate-200">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Title of Meeting</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Start Date</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-slate-200">
                                            {recentActivity.map(e => {
                                                const status = getStatus(e.startTime, e.endTime, e.status);
                                                return (
                                                    <tr key={e.id} className="hover:bg-slate-50/75 transition-colors">
                                                        <td className="px-6 py-4 font-medium text-slate-900 max-w-xs">
                                                            <p className="truncate" title={e.title}>{e.title}</p>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${status.bgColor} ${status.color}`}>
                                                                <status.icon size={14} />
                                                                {status.text}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{new Date(e.startTime).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                                        <td className="px-6 py-4">
                                                            {status.text === 'Completed' ? (
                                                                <button onClick={() => navigate(`/election/${e.id}/results`)} className="font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm">
                                                                    <BarChart2 size={16} /> View Results
                                                                </button>
                                                            ) : (
                                                                <button onClick={() => handleViewElection(e.id)} className="font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm">
                                                                    <Eye size={16} /> View Details
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center text-slate-500 p-12">
                                    <Info className="mx-auto text-slate-400 mb-2" size={32} />
                                    <p>You haven't created any meeting yet.</p>
                                    <Link to="/create-voting" className="text-indigo-600 font-semibold hover:underline mt-2 inline-block">
                                        Schedule your first meeting
                                    </Link>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Recent Payments Sidebar */}
                    <section className="xl:col-span-1">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-slate-800">Recent Payments</h2>
                            <Link 
                                to="/payment-history" 
                                className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm"
                            >
                                View All →
                            </Link>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 p-6">
                            {recentPayments.length > 0 ? (
                                <div className="space-y-4">
                                    {recentPayments.map(payment => (
                                        <div key={payment.id} className="border-l-4 border-indigo-500 pl-4 py-2 hover:bg-slate-50 transition-colors rounded-r">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="font-semibold text-slate-900 text-sm truncate" title={payment.electionTitle}>
                                                    {payment.electionTitle}
                                                </p>
                                                <span className="text-green-600 font-bold text-sm ml-2">
                                                    ₹{payment.amount.toFixed(0)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs text-slate-500">
                                                <span>{new Date(payment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                <span className={`px-2 py-0.5 rounded-full ${
                                                    payment.refundStatus === 'REFUNDED' 
                                                        ? 'bg-green-100 text-green-700' 
                                                        : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {payment.refundStatus === 'REFUNDED' ? 'Refunded' : payment.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-slate-500 py-8">
                                    <CreditCard className="mx-auto text-slate-300 mb-2" size={32} />
                                    <p className="text-sm">No payments yet</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

// Updated StatCard component with more color options
const StatCard = ({ icon: Icon, title, value, color }) => {
    const colors = {
        indigo: 'bg-indigo-100 text-indigo-600',
        green: 'bg-green-100 text-green-600',
        blue: 'bg-blue-100 text-blue-600',
        slate: 'bg-slate-100 text-slate-600',
        purple: 'bg-purple-100 text-purple-600',
        emerald: 'bg-emerald-100 text-emerald-600',
    };
    return (
        <div className="bg-white rounded-xl shadow-sm p-6 ring-1 ring-slate-200">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colors[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase">{title}</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;