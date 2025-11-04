import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle, XCircle, AlertCircle, Clock, 
  Shield, Ban, RefreshCw, Loader2, ArrowLeft 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/interceptor';

const AdminDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'ADMIN') {
      navigate('/');
    }
  }, [navigate]);

  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rejectModal, setRejectModal] = useState({ show: false, userId: null });
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const url = filter === 'ALL' 
        ? '/admin/users'
        : `/admin/users?status=${filter}`;
      
      const response = await api.get(url); // ← Changed from fetch
      
      if (response.data.success) {
        setUsers(response.data.users);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Failed to load users');
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      const response = await api.post(`/admin/users/${userId}/approve`); // ← Changed
      
      if (response.data.success) {
        setSuccess('User approved successfully');
        fetchUsers();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Failed to approve user');
      console.error('Approve user error:', err);
    }
  };

  const handleReject = async () => {
    try {
      const response = await api.post(
        `/admin/users/${rejectModal.userId}/reject`,
        { reason: rejectReason } // ← axios automatically handles JSON
      );
      
      if (response.data.success) {
        setSuccess('User rejected successfully');
        setRejectModal({ show: false, userId: null });
        setRejectReason('');
        fetchUsers();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Failed to reject user');
      console.error('Reject user error:', err);
    }
  };

  const handleSuspend = async (userId) => {
    if (!window.confirm('Are you sure you want to suspend this user?')) return;

    try {
      const response = await api.post(`/admin/users/${userId}/suspend`); // ← Changed
      
      if (response.data.success) {
        setSuccess('User suspended successfully');
        fetchUsers();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Failed to suspend user');
      console.error('Suspend user error:', err);
    }
  };

  const handleReactivate = async (userId) => {
    try {
      const response = await api.post(`/admin/users/${userId}/reactivate`); // ← Changed
      
      if (response.data.success) {
        setSuccess('User reactivated successfully');
        fetchUsers();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Failed to reactivate user');
      console.error('Reactivate user error:', err);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      APPROVED: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
      SUSPENDED: { bg: 'bg-gray-100', text: 'text-gray-800', icon: Ban }
    };

    const style = styles[status];
    const Icon = style.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
        <Icon size={14} />
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="mb-4 flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <Shield className="text-indigo-600" size={40} />
            Admin Dashboard - User Management
          </h1>
          <p className="text-gray-600">Manage user registrations and account status</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
            <div className="flex items-center">
              <AlertCircle className="text-red-500 mr-2" size={20} />
              <span className="text-red-700 font-medium">{error}</span>
            </div>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
            <div className="flex items-center">
              <CheckCircle className="text-green-500 mr-2" size={20} />
              <span className="text-green-700 font-medium">{success}</span>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-6 overflow-x-auto">
          {['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED', 'ALL'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                filter === status
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Phone</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">IBBI</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Registered</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      <Users className="mx-auto mb-4 text-gray-300" size={48} />
                      <p className="text-lg font-medium">No users found</p>
                    </td>
                  </tr>
                ) : (
                  users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">
                          {user.firstname} {user.lastname}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.phone || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.IBBI || 'N/A'}</td>
                      <td className="px-6 py-4">{getStatusBadge(user.accountStatus)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {user.accountStatus === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApprove(user.id)}
                                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => setRejectModal({ show: true, userId: user.id })}
                                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {user.accountStatus === 'APPROVED' && (
                            <button
                              onClick={() => handleSuspend(user.id)}
                              className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-semibold"
                            >
                              Suspend
                            </button>
                          )}
                          {user.accountStatus === 'SUSPENDED' && (
                            <button
                              onClick={() => handleReactivate(user.id)}
                              className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-semibold"
                            >
                              Reactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModal.show && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reject User Registration</h3>
            <p className="text-gray-600 mb-4">Please provide a reason for rejection:</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none mb-4"
              rows="4"
              placeholder="Enter rejection reason..."
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setRejectModal({ show: false, userId: null });
                  setRejectReason('');
                }}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
              >
                Reject User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;