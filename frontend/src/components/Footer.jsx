import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin } from 'lucide-react'; // Import icons

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-indigo-900 text-white pt-12 pb-8"> {/* Darker indigo, more padding */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm"> {/* Changed to 4 columns */}

        {/* Brand & Tagline */}
        <div className="col-span-1 md:col-span-1"> {/* Explicit column span */}
          <h3 className="text-2xl font-extrabold text-indigo-200 mb-4">IBC Voting</h3> {/* Larger, bolder brand name */}
          <p className="text-indigo-200 leading-relaxed">
            Your secure and compliant e-voting partner for the Insolvency and Bankruptcy Code framework.
            Ensuring transparency, integrity, and efficiency in every decision.
          </p>
          <div className="flex space-x-4 mt-6">
            <a href="https://facebook.com/ibcvoting" target="_blank" rel="noopener noreferrer" className="text-indigo-300 hover:text-white transition-colors duration-200">
              <Facebook size={20} />
            </a>
            <a href="https://twitter.com/ibcvoting" target="_blank" rel="noopener noreferrer" className="text-indigo-300 hover:text-white transition-colors duration-200">
              <Twitter size={20} />
            </a>
            <a href="https://linkedin.com/company/ibcvoting" target="_blank" rel="noopener noreferrer" className="text-indigo-300 hover:text-white transition-colors duration-200">
              <Linkedin size={20} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-bold mb-4 text-indigo-300">Quick Links</h3> {/* Lighter color for heading */}
          <ul className="space-y-3"> {/* Increased space between links */}
            <li><Link to="/" className="text-indigo-200 hover:text-white hover:underline transition-colors duration-200">Home</Link></li>
            <li><Link to="/about" className="text-indigo-200 hover:text-white hover:underline transition-colors duration-200">About Us</Link></li> {/* Changed to "About Us" */}
            <li><Link to="/contact" className="text-indigo-200 hover:text-white hover:underline transition-colors duration-200">Contact</Link></li>
            <li><Link to="/features" className="text-indigo-200 hover:text-white hover:underline transition-colors duration-200">Features</Link></li> {/* New link */}
            <li><Link to="/privacy-policy" className="text-indigo-200 hover:text-white hover:underline transition-colors duration-200">Privacy Policy</Link></li> {/* New link */}
            <li><Link to="/terms-of-service" className="text-indigo-200 hover:text-white hover:underline transition-colors duration-200">Terms of Service</Link></li> {/* New link */}
          </ul>
        </div>

        {/* Solutions/Services (New Column) */}
        <div>
          <h3 className="text-lg font-bold mb-4 text-indigo-300">Solutions</h3>
          <ul className="space-y-3">
            <li><Link to="/solutions/irp" className="text-indigo-200 hover:text-white hover:underline transition-colors duration-200">For IRPs</Link></li>
            <li><Link to="/solutions/rp" className="text-indigo-200 hover:text-white hover:underline transition-colors duration-200">For RPs</Link></li>
            <li><Link to="/solutions/liquidators" className="text-indigo-200 hover:text-white hover:underline transition-colors duration-200">For Liquidators</Link></li>
            <li><Link to="/solutions/creditors" className="text-indigo-200 hover:text-white hover:underline transition-colors duration-200">For Creditors</Link></li>
          </ul>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-bold mb-4 text-indigo-300">Get in Touch</h3>
          <ul className="space-y-3">
            <li className="flex items-center space-x-2">
              <Mail size={16} className="text-indigo-300" />
              <a href="mailto:support@ibcvoting.in" className="text-indigo-200 hover:text-white hover:underline transition-colors duration-200">
                support@ibcvoting.in
              </a>
            </li>
            <li className="flex items-center space-x-2">
              <Phone size={16} className="text-indigo-300" />
              <a href="tel:+919876543210" className="text-indigo-200 hover:text-white hover:underline transition-colors duration-200">
                +91-9876543210
              </a>
            </li>
            <li className="flex items-start space-x-2"> {/* Use items-start for multiline address */}
              <MapPin size={16} className="text-indigo-300 mt-1" /> {/* Adjust margin-top for icon alignment */}
              <address className="not-italic text-indigo-200">
                123, IBC Tech Park,<br />
                Connaught Place,<br />
                New Delhi - 110001, India
              </address>
            </li>
          </ul>
        </div>
      </div>

      {/* Separator Line */}
      <hr className="border-t border-indigo-700 my-8 max-w-7xl mx-auto" />

      {/* Copyright & Credits */}
      <div className="text-center text-indigo-300 text-xs">
        &copy; {currentYear} IBC Voting Platform. All rights reserved.
        <br />
        Developed with <span role="img" aria-label="heart" className="text-red-400">❤️</span> by [Your Company/Team Name]
      </div>
    </footer>
  );
};

export default Footer;