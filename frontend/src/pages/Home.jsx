import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { ShieldCheck, Users, Clock, FileText, BarChart2, Mail, Briefcase, CheckSquare, ArrowRight, LayoutDashboard } from 'lucide-react';
import logo from '../assets/Home.png';
import api from '../utils/interceptor';

// --- Animated number counting component ---
const CountUpNumber = ({ end, duration = 2000 }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    let start = 0;
                    const endValue = parseInt(String(end).replace(/,/g, '').replace('+', ''));
                    if (isNaN(endValue)) return;
                    const startTime = Date.now();
                    const frame = () => {
                        const now = Date.now();
                        const progress = (now - startTime) / duration;
                        if (progress < 1) {
                            setCount(Math.min(endValue, Math.ceil(endValue * progress)));
                            requestAnimationFrame(frame);
                        } else {
                            setCount(endValue);
                        }
                    };
                    requestAnimationFrame(frame);
                    observer.disconnect();
                }
            },
            { threshold: 0.5 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [end, duration]);

    return <span ref={ref}>{count.toLocaleString()}{String(end).endsWith('+') ? '+' : ''}</span>;
};

// --- Feature card component ---
const FeatureCard = ({ icon, title, children, color }) => {
    const colors = {
        indigo: 'bg-indigo-100 text-indigo-600',
        sky: 'bg-sky-100 text-sky-600',
        emerald: 'bg-emerald-100 text-emerald-600',
    };
    return (
        <div className="bg-white p-8 rounded-2xl shadow-sm ring-1 ring-slate-200/50 hover:-translate-y-1 transition-transform duration-300 flex flex-col items-center text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${colors[color]}`}>
                {icon}
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">{title}</h3>
            <p className="text-slate-600 leading-relaxed">
                {children}
            </p>
        </div>
    );
};

const Home = () => {
    const [stats, setStats] = useState({ totalElections: 0, totalUsers: 0 });
    const [loadingStats, setLoadingStats] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // --- THIS IS THE ROBUST FIX ---
        const checkLoginStatus = () => {
            const token = localStorage.getItem('accessToken');
            setIsLoggedIn(!!token);
        };

        const checkAdminStatus = () => {
            const role = localStorage.getItem('userRole');
            setIsAdmin(role === 'ADMIN');
        };

        // 1. Check status on initial component mount
        checkLoginStatus();
        checkAdminStatus();

        // 2. Listen for storage changes (e.g., logout in another tab)
        window.addEventListener('storage', checkLoginStatus);
        window.addEventListener('storage', checkAdminStatus);
        
        // 3. Listen for when the user focuses on this tab again
        window.addEventListener('focus', checkLoginStatus);
        window.addEventListener('focus', checkAdminStatus);
        
        // --- End of fix ---

        const fetchStats = async () => {
            try {
            const res = await api.get('/public/stats'); // interceptor handles baseURL
            const data = res.data;
            if (data && data.success) {
                setStats(data.stats);
            }
            } catch (error) {
            console.error("Could not fetch stats:", error);
            setStats({ totalElections: '1250+', totalUsers: '500+' });
            } finally {
            setLoadingStats(false);
            }
        };
        fetchStats();

        // 4. Cleanup: Remove event listeners when the component unmounts
        return () => {
            window.removeEventListener('storage', checkLoginStatus);
            window.removeEventListener('storage', checkAdminStatus);
            window.removeEventListener('focus', checkLoginStatus);
            window.removeEventListener('focus', checkAdminStatus);
        };
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-white text-slate-800">
            {/* Header */}
            <header className="flex justify-between items-center max-w-7xl mx-auto w-full px-6 py-6">
                <div className="text-2xl font-bold text-slate-900">IBC Voting</div>
                <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600">
                    <Link to="/" className="text-indigo-600">Home</Link>
                    <Link to="/about" className="hover:text-indigo-600 transition">About</Link>
                    <Link to="/contact" className="hover:text-indigo-600 transition">Contact</Link>
                    {isLoggedIn && isAdmin && (
                        <Link
                            to="/admin"
                            className="bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-700 transition shadow-sm flex items-center gap-2"
                        >
                            <LayoutDashboard size={16} />
                            Admin Dashboard
                        </Link>
                    )}
                    {/* This will now update reliably */}
                    {isLoggedIn ? (
                        <Link
                            to="/dashboard"
                            className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition shadow-sm flex items-center gap-2"
                        >
                            <LayoutDashboard size={16} />
                            Go to Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link to="/login" className="hover:text-indigo-600 transition">Login</Link>
                            <Link
                                to="/signup"
                                className="bg-slate-800 text-white px-5 py-2.5 rounded-lg hover:bg-slate-900 transition shadow-sm"
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </nav>
            </header>

            {/* Hero Section */}
            <main className="flex-grow flex flex-col-reverse lg:flex-row items-center justify-between max-w-7xl mx-auto w-full px-6 pt-16 pb-24 md:pt-24 md:pb-32">
                 <div className="lg:w-1/2 space-y-8 text-center lg:text-left mt-12 lg:mt-0 animate-fade-in-up">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight">
                        Secure, Transparent <span className="text-indigo-600">E-Voting</span> for IBC Professionals
                    </h1>
                    <p className="text-slate-600 text-xl leading-relaxed max-w-xl mx-auto lg:mx-0">
                        Revolutionize how Insolvency Professionals conduct voting. Our platform ensures integrity, efficiency, and compliance for all critical IBC decisions.
                    </p>
                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 justify-center lg:justify-start pt-4">
                        <Link to="/signup">
                            <button className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:bg-indigo-700 transform hover:scale-105 transition-all duration-300">
                                Get Started Free
                            </button>
                        </Link>
                        <Link to="/about">
                            <button className="w-full sm:w-auto border-2 border-slate-300 text-slate-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-slate-100 transform hover:scale-105 transition-all duration-300">
                                Learn More
                            </button>
                        </Link>
                    </div>
                </div>
                <div className="lg:w-1/2 md:pl-16">
                    <img src={logo} alt="Digital Voting Illustration" className="w-full max-w-lg mx-auto" />
                </div>
            </main>

            {/* Platform Statistics Section */}
            <section className="bg-slate-50 py-20">
                 <div className="max-w-5xl mx-auto px-6">
                     <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900">Trusted by Professionals Across the Nation</h2>
                        <p className="text-slate-600 mt-3 text-lg">Our platform is built to handle voting at scale with proven reliability.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
                        <div className="bg-white p-8 rounded-xl ring-1 ring-slate-200">
                            <Briefcase className="mx-auto text-indigo-600 mb-4" size={40} strokeWidth={1.5}/>
                            <p className="text-5xl font-extrabold text-slate-900">
                                {loadingStats ? '...' : <CountUpNumber end={stats.totalElections} />}
                            </p>
                            <h3 className="text-lg font-semibold text-slate-600 mt-2">Total Meetings Conducted</h3>
                        </div>
                        <div className="bg-white p-8 rounded-xl ring-1 ring-slate-200">
                            <Users className="mx-auto text-indigo-600 mb-4" size={40} strokeWidth={1.5}/>
                            <p className="text-5xl font-extrabold text-slate-900">
                                {loadingStats ? '...' : <CountUpNumber end={stats.totalUsers} />}
                            </p>
                            <h3 className="text-lg font-semibold text-slate-600 mt-2">Verified Professionals</h3>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features/Benefits Section */}
            <section className="bg-white py-20 md:py-28 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-4xl font-bold text-slate-900 mb-16">Why IBC Voting is Your Best Choice</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard icon={<ShieldCheck size={40} strokeWidth={1.5} />} title="Unmatched Security" color="indigo">
                            Leverage state-of-the-art encryption and secure tokens to ensure every vote is private and tamper-proof.
                        </FeatureCard>
                        <FeatureCard icon={<BarChart2 size={40} strokeWidth={1.5} />} title="Real-time Transparency" color="sky">
                            Gain instant access to voting progress and generate compliant, auditable results reports with unparalleled clarity.
                        </FeatureCard>
                        <FeatureCard icon={<Users size={40} strokeWidth={1.5} />} title="Simplified Engagement" color="emerald">
                            Facilitate easy participation for all stakeholders with an intuitive interface and unique, secure voting links.
                        </FeatureCard>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 md:py-28 px-6 bg-slate-50">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-4xl font-bold text-slate-900 mb-16">A Simple, Compliant Process</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {/* Connecting lines */}
                        <div className="hidden md:block absolute top-1/2 -translate-y-1/2 left-0 w-full h-px bg-slate-300"></div>
                        <div className="hidden md:block absolute top-1/2 -translate-y-1/2 left-1/3 w-2/3 h-px bg-slate-300"></div>
                        
                        <div className="relative flex flex-col items-center p-6">
                            <div className="w-16 h-16 bg-white ring-8 ring-slate-50 text-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold mb-4 z-10">1</div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">Create Election</h3>
                            <p className="text-slate-600 text-center">Set up your matter, dates, and add resolutions and COC members in minutes.</p>
                        </div>
                        <div className="relative flex flex-col items-center p-6">
                            <div className="w-16 h-16 bg-white ring-8 ring-slate-50 text-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold mb-4 z-10">2</div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">Notify Stakeholders</h3>
                            <p className="text-slate-600 text-center">Automated email invitations are sent with secure, unique voting links.</p>
                        </div>
                        <div className="relative flex flex-col items-center p-6">
                            <div className="w-16 h-16 bg-white ring-8 ring-slate-50 text-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold mb-4 z-10">3</div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">Monitor & Conclude</h3>
                            <p className="text-slate-600 text-center">Track live voting status and generate compliant results reports instantly.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="text-center py-20 md:py-28 bg-white">
                <h2 className="text-4xl font-bold text-slate-900 mb-6">Ready to Streamline Your IBC Voting Process?</h2>
                <p className="text-xl text-slate-600 mb-10 max-w-3xl mx-auto">
                    Join leading Insolvency Professionals who trust our platform for secure, efficient, and compliant e-voting solutions.
                </p>
                <Link
                    to="/signup"
                    className="inline-flex items-center px-10 py-5 bg-indigo-600 text-white text-xl font-semibold rounded-full shadow-lg hover:bg-indigo-700 transform hover:scale-105 transition-all duration-300"
                >
                    Sign Up Now
                    <ArrowRight className="ml-3 w-6 h-6" />
                </Link>
            </section>

            <Footer />

            <style jsx>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.8s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default Home;
