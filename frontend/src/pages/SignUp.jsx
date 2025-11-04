import React, { useState } from 'react';
import { User, Mail, Phone, Lock, Eye, EyeOff, UserPlus, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import HomeImg from '../assets/Home.png'; // Import the image for the left panel

const Signup = () => {
    const [formData, setFormData] = useState({
        IBBI: '',
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [passwordStrength, setPasswordStrength] = useState(0);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setFormErrors({});
        if (e.target.name === 'password') {
            const password = e.target.value;
            let strength = 0;
            if (password.length >= 8) strength++;
            if (/[A-Z]/.test(password)) strength++;
            if (/[a-z]/.test(password)) strength++;
            if (/[0-9]/.test(password)) strength++;
            if (/[^A-Za-z0-9]/.test(password)) strength++;
            setPasswordStrength(strength);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFormErrors({});

        try {
            const res = await fetch('https://a118d7ee0dab.ngrok-free.app/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) {
                if (data.errors && Array.isArray(data.errors)) {
                    const newErrors = {};
                    data.errors.forEach(err => {
                        newErrors[err.path] = err.msg;
                    });
                    setFormErrors(newErrors);
                } else {
                    setFormErrors({ general: data.message || 'Registration failed' });
                }
                return;
            }
            navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
        } catch (err) {
            setFormErrors({ general: 'Registration failed. Please check your connection and try again.' });
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrengthColor = () => {
        if (passwordStrength <= 1) return 'bg-red-500';
        if (passwordStrength <= 3) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getPasswordStrengthText = () => {
        if (passwordStrength <= 1) return 'Weak';
        if (passwordStrength <= 3) return 'Medium';
        return 'Strong';
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="w-full max-w-6xl m-4 bg-white shadow-2xl rounded-2xl flex overflow-hidden">
                {/* Left Panel: Branding & Welcome Message */}
                <div className="hidden lg:flex w-1/2 bg-indigo-700 p-12 flex-col justify-between relative">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-4">Welcome to Our Secure E-Voting Platform</h1>
                        <p className="text-indigo-200 text-lg">
                            Create your professional account to manage and participate in secure, transparent, and efficient voting events.
                        </p>
                        {/* <img
                          src={HomeImg}
                          alt="E-Voting Illustration"
                          className="w-full max-w-xs mx-auto my-8 rounded-xl shadow-lg"
                        /> */}
                    </div>
                    <div className="mt-8">
                        <div className="flex items-center text-indigo-100 space-x-3">
                            <Shield size={24} />
                            <span>Enterprise-Grade Security</span>
                        </div>
                         <div className="flex items-center text-indigo-100 space-x-3 mt-3">
                            <CheckCircle size={24} />
                            <span>Auditable & Transparent Results</span>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Signup Form */}
                <div className="w-full lg:w-1/2 p-8 sm:p-12">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Create an Account</h2>
                    <p className="text-gray-600 mb-8">
                        Already have an account?{' '}
                        <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
                            Sign In
                        </Link>
                    </p>

                    {formErrors.general && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center text-red-700">
                                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                                <span className="text-sm font-medium">{formErrors.general}</span>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Registration Number Field */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Registration Number</label>
                            <div className="relative">
                                <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text" name="IBBI" value={formData.IBBI} onChange={handleChange}
                                    placeholder="e.g., 123456789012" required
                                    className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 ${formErrors.IBBI ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-indigo-400'}`}
                                />
                            </div>
                            {formErrors.IBBI && <p className="text-red-600 text-xs mt-1">{formErrors.IBBI}</p>}
                        </div>

                        {/* Name Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                                <input
                                    type="text" name="firstname" value={formData.firstname} onChange={handleChange}
                                    placeholder="John" required
                                    className={`w-full px-4 py-3 bg-gray-50 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 ${formErrors.firstname ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-indigo-400'}`}
                                />
                                {formErrors.firstname && <p className="text-red-600 text-xs mt-1">{formErrors.firstname}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                                <input
                                    type="text" name="lastname" value={formData.lastname} onChange={handleChange}
                                    placeholder="Doe" required
                                    className={`w-full px-4 py-3 bg-gray-50 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 ${formErrors.lastname ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-indigo-400'}`}
                                />
                                {formErrors.lastname && <p className="text-red-600 text-xs mt-1">{formErrors.lastname}</p>}
                            </div>
                        </div>

                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="email" name="email" value={formData.email} onChange={handleChange}
                                    placeholder="you@example.com" required
                                    className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 ${formErrors.email ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-indigo-400'}`}
                                />
                            </div>
                            {formErrors.email && <p className="text-red-600 text-xs mt-1">{formErrors.email}</p>}
                        </div>

                        {/* Phone Field */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                            <div className="relative">
                                <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="tel" name="phone" value={formData.phone} onChange={handleChange}
                                    placeholder="+91 12345 67890" required
                                    className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 ${formErrors.phone ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-indigo-400'}`}
                                />
                            </div>
                            {formErrors.phone && <p className="text-red-600 text-xs mt-1">{formErrors.phone}</p>}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange}
                                    placeholder="Enter your password" required
                                    className={`w-full pl-10 pr-10 py-3 bg-gray-50 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 ${formErrors.password ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-indigo-400'}`}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700">
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {formErrors.password && <p className="text-red-600 text-xs mt-1">{formErrors.password}</p>}
                            {formData.password && (
                                <div className="mt-2">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`} style={{ width: `${(passwordStrength / 5) * 100}%` }}></div>
                                    </div>
                                    <p className={`text-xs mt-1 font-medium ${passwordStrength <= 1 ? 'text-red-500' : passwordStrength <= 3 ? 'text-yellow-600' : 'text-green-600'}`}>
                                        Password strength: {getPasswordStrengthText()}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Terms & Conditions */}
                        <div className="flex items-center space-x-3 pt-2">
                            <input type="checkbox" id="terms" required className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500" />
                            <label htmlFor="terms" className="text-sm text-gray-600">
                                I agree to the{' '}
                                <a href="/terms" className="text-indigo-600 font-medium hover:underline">Terms</a> & <a href="/privacy" className="text-indigo-600 font-medium hover:underline">Privacy Policy</a>
                            </label>
                        </div>

                        {/* Signup Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition-all duration-200 flex items-center justify-center space-x-2 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Creating Account...</span>
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-5 h-5" />
                                    <span>Create Account</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Signup;
