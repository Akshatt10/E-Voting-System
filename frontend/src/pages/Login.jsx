// import React, { useState } from 'react';
// import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield, AlertCircle } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

// const Login = () => {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: ''
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//     setError('');
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       const response = await fetch('http://localhost:3000/api/auth/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(formData),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         if (data.data && data.data.accessToken) {
//           localStorage.setItem('accessToken', data.data.accessToken);
//           navigate('/dashboard');
//         } else {
//           setError('Login successful, but no access token received.');
//         }
//       } else {
//         setError(data.message || 'Login failed. Please check your credentials.');
//       }
//     } catch (err) {
//       setError('Network error. Could not connect to the server.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-800 flex items-center justify-center px-4 relative overflow-hidden">
//       <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10"></div>
//       <div className="absolute top-0 left-0 w-full h-full">
//         <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
//         <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
//       </div>

//       <div className="relative z-10 w-full max-w-md">
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4">
//             <Shield className="w-8 h-8 text-white" />
//           </div>
//           <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
//           <p className="text-indigo-200">Sign in to your account to continue</p>
//         </div>

//         <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
//           {error && (
//             <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-xl">
//               <div className="flex items-center text-red-200">
//                 <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
//                 <span className="text-sm">{error}</span>
//               </div>
//             </div>
//           )}

//           <div className="space-y-6">
//             <div className="group">
//               <label className="block text-sm font-medium text-white/80 mb-2">
//                 Email Address
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                   <Mail className="w-5 h-5 text-white/40" />
//                 </div>
//                 <input
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   placeholder="Enter your email"
//                   required
//                   className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-200"
//                 />
//               </div>
//             </div>

//             <div className="group">
//               <label className="block text-sm font-medium text-white/80 mb-2">
//                 Password
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                   <Lock className="w-5 h-5 text-white/40" />
//                 </div>
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   name="password"
//                   value={formData.password}
//                   onChange={handleChange}
//                   placeholder="Enter your password"
//                   required
//                   className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-200"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/40 hover:text-white/70 transition-colors"
//                 >
//                   {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                 </button>
//               </div>
//             </div>

//             <button
//               type="submit"
//               onClick={handleSubmit}
//               disabled={loading}
//               className="w-full bg-gradient-to-r from-white to-white/90 text-indigo-900 py-4 rounded-xl font-semibold hover:from-white/90 hover:to-white/80 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
//             >
//               {loading ? (
//                 <>
//                   <div className="w-5 h-5 border-2 border-indigo-900/30 border-t-indigo-900 rounded-full animate-spin"></div>
//                   <span>Signing In...</span>
//                 </>
//               ) : (
//                 <>
//                   <span>Sign In</span>
//                   <ArrowRight className="w-5 h-5" />
//                 </>
//               )}
//             </button>
//           </div>

//           <div className="mt-8 space-y-4 text-center">
//             <a
//               href="/forgot-password"
//               className="inline-block text-white/70 hover:text-white transition-colors text-sm font-medium"
//             >
//               Forgot your password?
//             </a>

//             <div className="flex items-center justify-center">
//               <div className="h-px bg-white/20 flex-1"></div>
//               <span className="px-4 text-white/50 text-sm">or</span>
//               <div className="h-px bg-white/20 flex-1"></div>
//             </div>

//             <p className="text-white/70 text-sm">
//               Don't have an account?{' '}
//               <a
//                 href="/signup"
//                 className="text-white font-semibold hover:text-white/80 transition-colors"
//               >
//                 Create Account
//               </a>
//             </p>
//           </div>
//         </div>

//         <div className="mt-6 text-center">
//           <p className="text-indigo-200/60 text-xs">
//             Protected by end-to-end encryption
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;




import React, { useState, useEffect  } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield, AlertCircle, LogIn, CheckCircle  } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const navigate = useNavigate();
    const location = useLocation();

    // Display the success message from registration if it exists
    useEffect(() => {
        if (location.state?.message) {
            setSuccess(location.state.message);
            // Clear the message from location state so it doesn't reappear on refresh
            window.history.replaceState({}, document.title)
        }
    }, [location.state]);

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                if (data.data && data.data.accessToken) {
                    localStorage.setItem('accessToken', data.data.accessToken);
                    navigate('/dashboard');
                } else {
                    setError('Login successful, but no access token received.');
                }
            } else {
                setError(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            setError('Network error. Could not connect to the server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="w-full max-w-6xl m-4 bg-white shadow-2xl rounded-2xl flex overflow-hidden">
                {/* Left Panel: Branding & Welcome Message */}
                <div className="hidden lg:flex w-1/2 bg-indigo-700 p-12 flex-col justify-between relative">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-4">Welcome Back to the E-Voting Platform</h1>
                        <p className="text-indigo-200 text-lg">
                            Sign in to access your dashboard, manage elections, and view secure results.
                        </p>
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

                {/* Right Panel: Login Form */}
                <div className="w-full lg:w-1/2 p-8 sm:p-12">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Sign In</h2>
                    <p className="text-gray-600 mb-8">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-indigo-600 font-semibold hover:underline">
                            Create one now
                        </Link>
                    </p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center text-red-700">
                                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                                <span className="text-sm font-medium">{error}</span>
                            </div>
                        </div>
                    )}
                    
                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center text-green-700">
                                <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                                <span className="text-sm font-medium">{success}</span>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="email" name="email" value={formData.email} onChange={handleChange}
                                    placeholder="you@example.com" required
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-semibold text-gray-700">Password</label>
                                <a href="/forgot-password" className="text-sm text-indigo-600 hover:underline font-semibold">
                                    Forgot password?
                                </a>
                            </div>
                            <div className="relative">
                                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange}
                                    placeholder="Enter your password" required
                                    className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700">
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition-all duration-200 flex items-center justify-center space-x-2 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Signing In...</span>
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    <span>Sign In</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
