import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { ShieldCheck, Users, Clock, FileText, BarChart2, Mail } from 'lucide-react'; // Importing icons
import logo from '../assets/Home.png'; // Assuming you have a logo image

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white via-yellow-50 to-indigo-100 text-gray-800">
      {/* Header */}
      <header className="flex justify-between items-center max-w-7xl mx-auto w-full px-6 py-6">
        <div className="text-2xl font-bold text-indigo-700">IBC Voting</div>
        <nav className="space-x-6 text-sm font-medium">
          <Link to="/" className="text-indigo-600 font-semibold underline">Home</Link>
          <Link to="/about" className="hover:text-indigo-700 transition">About</Link>
          <Link to="/contact" className="hover:text-indigo-700 transition">Contact</Link>
          <Link to="/login" className="hover:text-indigo-700 transition">Login</Link>
          <Link
            to="/signup"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Sign Up
          </Link>
        </nav>
      </header>

      {/* Hero Section - Main content */}
      <main className="flex-grow flex flex-col-reverse md:flex-row items-center justify-between max-w-7xl mx-auto w-full px-6 py-16 md:py-24">
        <div className="md:w-1/2 space-y-8 text-center md:text-left"> {/* Added text-center for mobile */}
          <h1 className="text-4xl md:text-6xl font-extrabold text-indigo-800 leading-tight">
            Secure, Transparent <span className="text-yellow-600">E-Voting</span> for IBC Professionals
          </h1>
          <p className="text-gray-700 text-xl leading-relaxed">
            Revolutionize how Insolvency Professionals (IRPs, RPs, Liquidators) conduct voting.
            Our platform ensures **integrity, efficiency, and compliance** for all critical IBC decisions.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 justify-center md:justify-start pt-4"> {/* Adjusted buttons for mobile */}
            <Link to="/signup">
              <button className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:bg-indigo-700 transform hover:scale-105 transition-all duration-300">
                Get Started Free
              </button>
            </Link>
            <Link to="/about">
              <button className="w-full sm:w-auto border-2 border-indigo-600 text-indigo-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-indigo-50 transform hover:scale-105 transition-all duration-300">
                Learn More
              </button>
            </Link>
          </div>
        </div>

        <div className="md:w-1/2 mb-12 md:mb-0 md:pl-16"> {/* Added padding-left for spacing */}
          <img
            src={logo}
            alt="Digital Voting Illustration"
            className="w-full max-w-lg mx-auto animate-fade-in-up"
          />
        </div>
      </main>

      {/* Features/Benefits Section */}
      <section className="bg-white py-16 md:py-24 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-indigo-800 mb-12">Why IBC Voting is Your Best Choice</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10"> {/* Increased gap */}
            {/* Feature Card 1 */}
            <div className="bg-indigo-50 p-8 rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300 flex flex-col items-center">
              <ShieldCheck className="text-indigo-600 mb-6" size={50} strokeWidth={1.5} />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Unmatched Security</h3>
              <p className="text-gray-700 leading-relaxed text-center">
                Leverage state-of-the-art encryption and multi-factor authentication to ensure every vote is secure, private, and tamper-proof.
              </p>
            </div>
            {/* Feature Card 2 */}
            <div className="bg-yellow-50 p-8 rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300 flex flex-col items-center">
              <BarChart2 className="text-yellow-600 mb-6" size={50} strokeWidth={1.5} />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Real-time Transparency</h3>
              <p className="text-gray-700 leading-relaxed text-center">
                Gain instant access to voting progress and results, providing unparalleled clarity and trust throughout the process.
              </p>
            </div>
            {/* Feature Card 3 */}
            <div className="bg-purple-50 p-8 rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300 flex flex-col items-center">
              <Users className="text-purple-600 mb-6" size={50} strokeWidth={1.5} />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Simplified Stakeholder Engagement</h3>
              <p className="text-gray-700 leading-relaxed text-center">
                Facilitate easy participation for all stakeholders with an intuitive interface and verified credential access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 px-6 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-indigo-800 mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-md">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mb-4">1</div>
              <FileText className="text-indigo-500 mb-4" size={40} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Election</h3>
              <p className="text-gray-700 text-center">Set up your voting matter, dates, and add candidates/resolutions effortlessly.</p>
            </div>
            {/* Step 2 */}
            <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-md">
              <div className="w-16 h-16 bg-yellow-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mb-4">2</div>
              <Mail className="text-yellow-500 mb-4" size={40} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Notify Stakeholders</h3>
              <p className="text-gray-700 text-center">Automated email and SMS invitations with secure, unique voting links.</p>
            </div>
            {/* Step 3 */}
            <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-md">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mb-4">3</div>
              <Clock className="text-green-500 mb-4" size={40} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Monitor & Conclude</h3>
              <p className="text-gray-700 text-center">Track live voting status and generate compliant results reports instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section (Repeated for emphasis, but slightly different) */}
      <section className="text-center py-16 md:py-24 bg-white">
        <h2 className="text-4xl font-bold text-indigo-800 mb-6">Ready to Streamline Your IBC Voting Process?</h2>
        <p className="text-xl text-gray-700 mb-10 max-w-3xl mx-auto">
          Join leading Insolvency Professionals who trust IBC Voting for secure, efficient, and compliant e-voting solutions.
        </p>
        <Link
          to="/signup"
          className="inline-flex items-center px-10 py-5 bg-indigo-600 text-white text-xl font-semibold rounded-full shadow-lg hover:bg-indigo-700 transform hover:scale-105 transition-all duration-300"
        >
          Sign Up Now
          <svg className="ml-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </section>

      {/* Footer stays at bottom */}
      <Footer />

      {/* Tailwind CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Home;