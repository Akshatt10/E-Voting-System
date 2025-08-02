import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [formStatus, setFormStatus] = useState({ type: '', message: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setFormStatus({ type: '', message: '' });

        // This is where you would typically send the form data to your backend.
        // For now, we'll simulate a successful submission.
        console.log("Form data submitted:", formData);
        
        setTimeout(() => {
            setLoading(false);
            setFormStatus({ type: 'success', message: 'Thank you! Your message has been sent successfully.' });
            setFormData({ name: '', email: '', subject: '', message: '' });
        }, 1500);
    };

    return (
        <div className="flex flex-col min-h-screen bg-white text-slate-800">
            {/* Header */}
            <header className="flex justify-between items-center max-w-7xl mx-auto w-full px-6 py-6">
                <div className="text-2xl font-bold text-slate-900">IBC Voting</div>
                <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600">
                    <Link to="/" className="hover:text-indigo-600 transition">Home</Link>
                    <Link to="/about" className="hover:text-indigo-600 transition">About</Link>
                    <Link to="/contact" className="text-indigo-600">Contact</Link>
                    <Link to="/login" className="hover:text-indigo-600 transition">Login</Link>
                    <Link
                        to="/signup"
                        className="bg-slate-800 text-white px-5 py-2.5 rounded-lg hover:bg-slate-900 transition shadow-sm"
                    >
                        Sign Up
                    </Link>
                </nav>
            </header>

            {/* Main Contact Content */}
            <main className="flex-grow">
                {/* Hero Section */}
                <section className="text-center bg-slate-50 py-20 md:py-28 px-6">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
                        Get In Touch
                    </h1>
                    <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
                        We're here to help. Whether you have a question about our features, pricing, or anything else, our team is ready to answer all your questions.
                    </p>
                </section>

                {/* Contact Form & Info Section */}
                <section className="py-20 md:py-28 px-6">
                    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12">
                        {/* Contact Info Panel */}
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-3xl font-bold text-slate-900 mb-4">Contact Information</h2>
                                <p className="text-slate-600 text-lg">
                                    Fill up the form and our team will get back to you within 24 hours.
                                </p>
                            </div>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800">Phone</h3>
                                        <a href="tel:+911234567890" className="text-slate-600 hover:text-indigo-600">+91 12345 67890</a>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800">Email</h3>
                                        <a href="mailto:support@ibcvoting.com" className="text-slate-600 hover:text-indigo-600">support@ibcvoting.com</a>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800">Address</h3>
                                        <p className="text-slate-600">123 Business Avenue, Suite 456<br/>New Delhi, 110001, India</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form Panel */}
                        <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-lg ring-1 ring-slate-200">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                                        <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
                                    <input type="text" name="subject" id="subject" value={formData.subject} onChange={handleChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-2">Message</label>
                                    <textarea name="message" id="message" rows="5" value={formData.message} onChange={handleChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
                                </div>
                                <div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-slate-800 text-white py-3 rounded-lg font-semibold text-lg hover:bg-slate-900 transition-colors disabled:bg-slate-400 flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : <Send />}
                                        {loading ? 'Sending...' : 'Send Message'}
                                    </button>
                                </div>
                            </form>
                            {formStatus.message && (
                                <div className={`mt-6 p-4 rounded-lg flex items-center text-sm ${formStatus.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                    {formStatus.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
                                    {formStatus.message}
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default Contact;
