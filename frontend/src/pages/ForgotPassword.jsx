import React, { useState } from 'react';
import { Mail, Loader2, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const res = await fetch('http://localhost:3000/api/auth/request-password-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            // We always show the success message for security reasons
            setMessage(data.message);
        } catch (err) {
            setMessage('A network error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg ring-1 ring-slate-200">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">Forgot Password</h1>
                    <p className="text-slate-500 mt-2">Enter your email to receive a password reset link.</p>
                </div>

                {message ? (
                    <div className="p-4 bg-green-50 text-green-800 rounded-lg flex items-center gap-3">
                        <CheckCircle />
                        <span>{message}</span>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com" required
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-lg"
                                />
                            </div>
                        </div>
                        <button
                            type="submit" disabled={loading}
                            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Send Reset Link'}
                        </button>
                    </form>
                )}
                <div className="text-center mt-6">
                    <Link to="/login" className="text-sm font-semibold text-indigo-600 hover:underline">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;

