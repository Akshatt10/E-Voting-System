// import React from 'react';
// import { Link } from 'react-router-dom';
// import Footer from '../components/Footer';
// import { ShieldCheck, TrendingUp, Users, Lock, BarChart2, Mail, Lightbulb, Handshake, Code } from 'lucide-react'; // Import new icons

// const About = () => {
//   return (
//     <div className="flex flex-col min-h-screen bg-gradient-to-br from-white via-indigo-50 to-indigo-100 text-gray-800">
//       {/* Header */}
//       <header className="flex justify-between items-center max-w-7xl mx-auto w-full px-6 py-6">
//         <div className="text-2xl font-bold text-indigo-700">IBC Voting</div>
//         <nav className="space-x-6 text-sm font-medium">
//           <Link to="/" className="hover:text-indigo-700 transition">Home</Link>
//           <Link to="/about" className="text-indigo-600 font-semibold underline">About</Link>
//           <Link to="/contact" className="hover:text-indigo-700 transition">Contact</Link>
//           <Link to="/login" className="hover:text-indigo-700 transition">Login</Link>
//           <Link
//             to="/signup"
//             className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
//           >
//             Sign Up
//           </Link>
//         </nav>
//       </header>

//       {/* Main About Content */}
//       <main className="flex-grow max-w-5xl mx-auto w-full px-6 py-12 space-y-12"> {/* Increased space-y */}
//         <h1 className="text-5xl font-extrabold text-center text-indigo-800 mb-8 leading-tight"> {/* Larger, bolder title */}
//           Empowering Transparent & Secure E-Voting <br /> for the IBC Ecosystem
//         </h1>

//         <section className="space-y-6 text-center"> {/* Centered introduction */}
//           <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
//             At **IBC Voting**, we are dedicated to revolutionizing the electronic voting landscape within India's
//             Insolvency and Bankruptcy Code framework. We provide a **cutting-edge, secure, and intuitive platform**
//             designed to simplify and safeguard critical voting processes for Insolvency Professionals and stakeholders.
//           </p>
//         </section>

//         ---

//         <section className="space-y-8">
//           <h2 className="text-3xl font-bold text-indigo-700 text-center">Our Vision & Mission</h2>
//           <div className="grid md:grid-cols-2 gap-8 items-start"> {/* Two columns for vision/mission */}
//             <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center text-center">
//               <Lightbulb className="text-purple-600 mb-4" size={40} />
//               <h3 className="text-xl font-semibold text-gray-800 mb-2">Our Vision</h3>
//               <p className="text-gray-700 leading-relaxed">
//                 To be the most trusted and indispensable e-voting platform for the IBC ecosystem,
//                 setting new benchmarks for efficiency, transparency, and regulatory compliance in India.
//               </p>
//             </div>
//             <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center text-center">
//               <Handshake className="text-green-600 mb-4" size={40} />
//               <h3 className="text-xl font-semibold text-gray-800 mb-2">Our Mission</h3>
//               <p className="text-gray-700 leading-relaxed">
//                 To deliver a robust, user-friendly, and secure electronic voting solution that empowers
//                 IRPs, RPs, and Liquidators to conduct seamless, compliant, and efficient voting rounds,
//                 fostering greater stakeholder participation and confidence.
//               </p>
//             </div>
//           </div>
//         </section>

//         ---

//         <section className="space-y-8">
//           <h2 className="text-3xl font-bold text-indigo-700 text-center">Why Choose IBC Voting?</h2>
//           <div className="grid md:grid-cols-3 gap-8"> {/* Grid for key features */}
//             <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center text-center">
//               <ShieldCheck className="text-blue-600 mb-4" size={32} />
//               <h3 className="text-xl font-semibold text-gray-800 mb-2">Unwavering Security</h3>
//               <p className="text-gray-700 text-base">
//                 Our platform employs state-of-the-art encryption and robust security protocols
//                 to ensure the integrity and confidentiality of every vote cast.
//               </p>
//             </div>
//             <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center text-center">
//               <BarChart2 className="text-orange-600 mb-4" size={32} />
//               <h3 className="text-xl font-semibold text-gray-800 mb-2">Instant Insights</h3>
//               <p className="text-gray-700 text-base">
//                 Access real-time voting progress and results, providing immediate transparency
//                 and enabling swift decision-making.
//               </p>
//             </div>
//             <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center text-center">
//               <Lock className="text-red-600 mb-4" size={32} />
//               <h3 className="text-xl font-semibold text-gray-800 mb-2">Authentic Participation</h3>
//               <p className="text-gray-700 text-base">
//                 Verify voter identities securely through OTP and pre-verified credentials,
//                 preventing fraudulent votes and ensuring legitimate participation.
//               </p>
//             </div>
//             <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center text-center">
//               <Users className="text-purple-600 mb-4" size={32} />
//               <h3 className="text-xl font-semibold text-gray-800 mb-2">Seamless Compliance</h3>
//               <p className="text-gray-700 text-base">
//                 Built from the ground up to strictly adhere to IBBI regulations, making
//                 your e-voting process fully compliant and audit-ready.
//               </p>
//             </div>
//             <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center text-center">
//               <TrendingUp className="text-teal-600 mb-4" size={32} />
//               <h3 className="text-xl font-semibold text-gray-800 mb-2">Efficient Management</h3>
//               <p className="text-gray-700 text-base">
//                 Utilize our intuitive admin dashboard to effortlessly set up, manage,
//                 and monitor multiple voting rounds from a single interface.
//               </p>
//             </div>
//             <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center text-center">
//               <Mail className="text-pink-600 mb-4" size={32} />
//               <h3 className="text-xl font-semibold text-gray-800 mb-2">Automated Notifications</h3>
//               <p className="text-gray-700 text-base">
//                 Keep all stakeholders informed with automated email and SMS notifications
//                 for voting invites, reminders, and results.
//               </p>
//             </div>
//           </div>
//         </section>

//         ---

//         <section className="space-y-6">
//           <h2 className="text-3xl font-bold text-indigo-700 text-center">Our Expertise</h2>
//           <div className="flex flex-col md:flex-row items-center md:space-x-8">
//             <div className="md:w-1/3 flex justify-center mb-6 md:mb-0">
//               <Code className="text-indigo-600" size={100} /> {/* Larger, prominent icon */}
//             </div>
//             <div className="md:w-2/3 space-y-4 text-lg text-gray-700 leading-relaxed">
//               <p>
//                 We are a **dynamic team of technologists, legal experts, and design thinkers**
//                 passionate about bringing efficiency and integrity to crucial decision-making processes.
//                 Our deep understanding of both cutting-edge e-voting technology and the intricate
//                 legal framework of the Insolvency and Bankruptcy Code allows us to build a solution that is not
//                 just functional, but truly transformative.
//               </p>
//               <p>
//                 From meticulous **user-first design** to robust **backend engineering** and stringent
//                 **security measures**, every aspect of IBC Voting is crafted with precision to meet
//                 the unique demands of insolvency proceedings.
//               </p>
//             </div>
//           </div>
//         </section>

//         ---

//         <section className="text-center bg-indigo-50 p-8 rounded-xl shadow-inner">
//           <h2 className="text-3xl font-bold text-indigo-700 mb-4">Ready to Modernize Your Voting Process?</h2>
//           <p className="text-xl text-gray-700 mb-8">
//             Experience the future of secure and compliant e-voting with IBC Voting.
//           </p>
//           <Link
//             to="/signup"
//             className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-full shadow-lg hover:bg-indigo-700 transform hover:scale-105 transition-all duration-300"
//           >
//             Get Started Today
//             <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
//             </svg>
//           </Link>
//         </section>

//       </main>

//       <Footer />
//     </div>
//   );
// };

// export default About;


import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { ShieldCheck, TrendingUp, Users, Lock, BarChart2, Mail, Lightbulb, Handshake, Code, ArrowRight } from 'lucide-react';

// --- A reusable component for feature cards ---
const FeatureCard = ({ icon, title, children }) => {
    return (
        <div className="bg-white p-8 rounded-xl ring-1 ring-slate-200 text-center">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
            <p className="text-slate-600 leading-relaxed">
                {children}
            </p>
        </div>
    );
};

const About = () => {
    return (
        <div className="flex flex-col min-h-screen bg-white text-slate-800">
            {/* Header */}
            <header className="flex justify-between items-center max-w-7xl mx-auto w-full px-6 py-6">
                <div className="text-2xl font-bold text-slate-900">IBC Voting</div>
                <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600">
                    <Link to="/" className="hover:text-indigo-600 transition">Home</Link>
                    <Link to="/about" className="text-indigo-600">About</Link>
                    <Link to="/contact" className="hover:text-indigo-600 transition">Contact</Link>
                    <Link to="/login" className="hover:text-indigo-600 transition">Login</Link>
                    <Link
                        to="/signup"
                        className="bg-slate-700 text-white px-5 py-2.5 rounded-lg hover:bg-slate-900 transition shadow-sm"
                    >
                        Sign Up
                    </Link>
                </nav>
            </header>

            {/* Main About Content */}
            <main className="flex-grow">
                {/* Hero Section */}
                <section className="text-center bg-slate-50 py-20 md:py-28 px-6">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
                        Empowering Secure & Compliant E-Voting
                    </h1>
                    <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
                        At IBC Voting, we are dedicated to revolutionizing the electronic voting landscape within India's Insolvency and Bankruptcy Code framework.
                    </p>
                </section>
                
                {/* Vision & Mission Section */}
                <section className="py-20 md:py-28 px-6">
                    <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                        <div className="text-center md:text-left">
                            <span className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Our Purpose</span>
                            <h2 className="text-3xl font-bold text-slate-900 mt-3 mb-4">Our Vision & Mission</h2>
                            <p className="text-slate-600 leading-relaxed">
                                To be the most trusted e-voting platform for the IBC ecosystem, setting new benchmarks for efficiency, transparency, and compliance. Our mission is to deliver a robust, user-friendly, and secure solution that empowers professionals and fosters stakeholder confidence.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-8">
                            <div className="bg-white p-6 rounded-xl ring-1 ring-slate-200 flex items-start gap-4">
                                <Lightbulb className="w-12 h-12 text-indigo-500 flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-800">Our Vision</h3>
                                    <p className="text-slate-600 text-sm">To be the most trusted and indispensable e-voting platform for the IBC ecosystem.</p>
                                </div>
                            </div>
                             <div className="bg-white p-6 rounded-xl ring-1 ring-slate-200 flex items-start gap-4">
                                <Handshake className="w-12 h-12 text-emerald-500 flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-800">Our Mission</h3>
                                    <p className="text-slate-600 text-sm">To deliver a robust, user-friendly, and secure solution that empowers IRPs, RPs, and Liquidators.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Why Choose Us Section */}
                <section className="bg-slate-50 py-20 md:py-28 px-6">
                    <div className="max-w-7xl mx-auto text-center">
                        <h2 className="text-3xl font-bold text-slate-900 mb-16">Why Choose IBC Voting?</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <FeatureCard icon={<ShieldCheck size={32} />} title="Unwavering Security">
                                Our platform employs state-of-the-art encryption and robust security protocols to ensure the integrity and confidentiality of every vote.
                            </FeatureCard>
                            <FeatureCard icon={<BarChart2 size={32} />} title="Instant Insights">
                                Access real-time voting progress and results, providing immediate transparency and enabling swift decision-making.
                            </FeatureCard>
                            <FeatureCard icon={<Users size={32} />} title="Seamless Compliance">
                                Built from the ground up to strictly adhere to IBBI regulations, making your e-voting process fully compliant and audit-ready.
                            </FeatureCard>
                        </div>
                    </div>
                </section>
                
                {/* Our Expertise Section */}
                <section className="py-20 md:py-28 px-6">
                    <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
                        <div className="md:w-1/2">
                            <img src="https://placehold.co/600x400/e2e8f0/334155?text=Our+Team" alt="Team discussing plans" className="rounded-xl shadow-lg w-full"/>
                        </div>
                        <div className="md:w-1/2 text-center md:text-left">
                             <span className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Our Expertise</span>
                            <h2 className="text-3xl font-bold text-slate-900 mt-3 mb-4">Built by Experts, for Experts</h2>
                            <p className="text-slate-600 leading-relaxed">
                                We are a dynamic team of technologists, legal experts, and design thinkers passionate about bringing efficiency to crucial decision-making processes. Our deep understanding of both cutting-edge technology and the intricate legal framework of the IBC allows us to build a solution that is not just functional, but truly transformative.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Call to Action Section */}
                <section className="bg-indigo-700 text-center py-20 md:py-24 px-6">
                    <h2 className="text-4xl font-bold text-white mb-6">Ready to Modernize Your Voting Process?</h2>
                    <p className="text-xl text-indigo-200 mb-10 max-w-3xl mx-auto">
                        Experience the future of secure and compliant e-voting with IBC Voting.
                    </p>
                    <Link
                        to="/signup"
                        className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 text-lg font-semibold rounded-full shadow-lg hover:bg-slate-100 transform hover:scale-105 transition-all duration-300"
                    >
                        Get Started Today
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default About;
