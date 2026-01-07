import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [logoError, setLogoError] = useState(false);
  const services = [
    'Trust & Safety',
  ];


  const socialLinks = [
    { name: 'Twitter', href: '#' },
    { name: 'Facebook', href: '#' },
    { name: 'LinkedIn', href: '#' },
    { name: 'Instagram', href: '#' },
    { name: 'TikTok', href: '#' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
          <div>
            <span className="text-xs text-gray-400 font-medium mb-4 block">UK Outsourcing Partners</span>
            <p className="text-gray-400 mb-6">
              Premium outsourcing services that help businesses scale without losing their identity.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label={social.name}
                >
                  <span className="text-xs font-semibold">{social.name[0]}</span>
                </a>
              ))}
            </div>
          </div>

          <div>
            {services.map((service) => (
              <React.Fragment key={service}>
                <Link
                  to="/ask-sam"
                  className="text-white font-semibold mb-4 block hover:text-white transition-colors"
                >
                  {service}
                </Link>
                <Link to="/" className="block mb-4">
                  {!logoError ? (
                    <img
                      src="/assets/tabalt-logo.png.jpg"
                      alt="Tabalt Logo"
                      className="w-auto max-w-full object-contain"
                      style={{ height: '2in', width: 'auto' }}
                      onError={() => setLogoError(true)}
                    />
                  ) : (
                    <span className="text-2xl font-bold text-white block">
                      Tabalt
                    </span>
                  )}
                </Link>
              </React.Fragment>
            ))}
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3 text-sm">
              <p className="text-gray-400">
                <a href="mailto:info@tabalt.co.uk" className="text-white hover:text-blue-400 transition-colors">
                  info@tabalt.co.uk
                </a>
              </p>
              <p className="text-gray-400">
                <a href="tel:+447448614160" className="text-white hover:text-blue-400 transition-colors">
                  +44 7448614160
                </a>
              </p>
              <p className="text-gray-400">
                3 Herron Court, Bromley,<br />
                London, United Kingdom
              </p>
            </div>
            <div className="mt-6">
              <h4 className="text-white font-semibold mb-3 text-sm">Stay Connected</h4>
              <form className="space-y-3">
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Email address"
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              © {new Date().getFullYear()} Tabalt Ltd. All rights reserved.
            </div>
            <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4">
              <Link
                to="/agent/login"
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              >
                Agent Login
              </Link>
              <Link
                to="/admin/login"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                Admin Login
              </Link>
              <div className="flex space-x-6 text-sm">
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

