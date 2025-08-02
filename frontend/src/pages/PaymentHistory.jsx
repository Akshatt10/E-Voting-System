// src/pages/PaymentHistory.js

import React, { useState, useEffect } from 'react';
import { Loader2, AlertTriangle, Receipt, CheckCircle, XCircle, Clock } from 'lucide-react';

const PaymentHistory = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                setError("Authentication failed. Please log in.");
                setLoading(false);
                return;
            }

            try {
                const res = await fetch('/api/payments/history', {
                    headers: { 'Authorization': `Bearer ${accessToken}` },
                });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || 'Failed to fetch payment history.');
                }
                setPayments(data.payments || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const formatAmount = (amount, currency) => {
        // Assuming amount is in the smallest unit (e.g., paise)
        const value = amount / 100;
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency.toUpperCase(),
        }).format(value);
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            SUCCESS: 'bg-green-100 text-green-800',
            PENDING: 'bg-yellow-100 text-yellow-800',
            FAILED: 'bg-red-100 text-red-800',
        };
        const icons = {
            SUCCESS: <CheckCircle size={14} />,
            PENDING: <Clock size={14} />,
            FAILED: <XCircle size={14} />,
        };
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {icons[status]}
                {status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-slate-50">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex items-center">
                    <AlertTriangle className="mr-3" size={24} />
                    <span>{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900">Payment History</h1>
                    <p className="text-slate-600 mt-2 text-lg">A record of all your transactions on the platform.</p>
                </header>

                <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        {payments.length > 0 ? (
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Transaction ID</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">For Election</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {payments.map(payment => (
                                        <tr key={payment.id} className="hover:bg-slate-50/75 transition-colors">
                                            <td className="px-6 py-4 font-mono text-sm text-slate-600">{payment.providerPaymentId}</td>
                                            <td className="px-6 py-4 text-slate-600">{new Date(payment.createdAt).toLocaleDateString('en-GB')}</td>
                                            <td className="px-6 py-4 font-semibold text-slate-900">{formatAmount(payment.amount, payment.currency)}</td>
                                            <td className="px-6 py-4 text-slate-800">{payment.election?.title || 'N/A'}</td>
                                            <td className="px-6 py-4"><StatusBadge status={payment.status} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center text-slate-500 p-12">
                                <Receipt className="mx-auto text-slate-400 mb-2" size={32} />
                                <p className="font-semibold">No payment history found.</p>
                                <p className="text-sm">Your transactions will appear here once you create an election.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentHistory;
