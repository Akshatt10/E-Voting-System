import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, CheckCircle, AlertCircle, Loader2, Receipt } from 'lucide-react';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({ totalAmount: 0, totalPayments: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPaymentHistory();
    fetchPaymentStats();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch('/api/elections/payments/history', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setPayments(data.payments);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to load payment history');
      console.error('Fetch payment history error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentStats = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch('/api/elections/payments/stats', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Fetch payment stats error:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'FAILED':
        return <AlertCircle className="text-red-500" size={20} />;
      case 'PENDING':
        return <Loader2 className="text-yellow-500 animate-spin" size={20} />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      SUCCESS: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      PENDING: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const getRefundBadge = (refundStatus) => {
    const styles = {
      NOT_REFUNDED: 'bg-gray-100 text-gray-800',
      REFUND_INITIATED: 'bg-yellow-100 text-yellow-800',
      REFUNDED: 'bg-green-100 text-green-800',
      REFUND_FAILED: 'bg-red-100 text-red-800'
    };

    const labels = {
      NOT_REFUNDED: 'No Refund',
      REFUND_INITIATED: 'Refund Initiated',
      REFUNDED: 'Refunded',
      REFUND_FAILED: 'Refund Failed'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[refundStatus]}`}>
        {labels[refundStatus]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <Receipt className="text-indigo-600" size={40} />
            Payment History
          </h1>
          <p className="text-gray-600">View all your election payment transactions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Payments</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalPayments}</p>
              </div>
              <div className="bg-indigo-100 p-4 rounded-full">
                <CreditCard className="text-indigo-600" size={28} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Amount Paid</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  ₹{stats.totalAmount.toFixed(2)}
                </p>
              </div>
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle className="text-green-600" size={28} />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
            <div className="flex items-center">
              <AlertCircle className="text-red-500 mr-2" size={20} />
              <span className="text-red-700 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Payment Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Election
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Refund Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      <Receipt className="mx-auto mb-4 text-gray-300" size={48} />
                      <p className="text-lg font-medium">No payment history found</p>
                      <p className="text-sm mt-1">Your payments will appear here once you create elections</p>
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {getStatusIcon(payment.status)}
                          <span className="ml-2 text-sm font-mono text-gray-700">
                            {payment.transactionId}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {payment.electionTitle}
                          </p>
                          <p className="text-xs text-gray-500">{payment.electionMatter}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-800">
                          {payment.currency} {payment.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 capitalize">
                          {payment.paymentMethod || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar size={14} className="mr-1" />
                          {formatDate(payment.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getRefundBadge(payment.refundStatus)}
                        {payment.refundedAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Refunded: {formatDate(payment.refundedAt)}
                          </p>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;