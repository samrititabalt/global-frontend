import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const [isSolutionsDropdownOpen, setIsSolutionsDropdownOpen] = useState(false);
  const [isMobileSolutionsOpen, setIsMobileSolutionsOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const dropdownRef = useRef(null);
  const solutionsDropdownRef = useRef(null);
  
  // Check if user is a customer
  const isCustomer = isAuthenticated && user?.role === 'customer';

  const services = [
    { name: 'UK Accounting, Taxation & Reporting', path: '/services/uk-accounting-taxation-reporting' },
    { name: 'ESG', path: '/services/esg' },
    { name: 'Market Research', path: '/services/market-research' },
    { name: 'Contact Centre Support', path: '/services/contact-centre-support' },
    { name: 'Recruitment & Staffing', path: '/services/recruitment-staffing' },
    { name: 'Equity Research & Management', path: '/services/equity-research-management' },
    { name: 'Industry Reports', path: '/services/industry-reports' },
    { name: 'Software & Tech Support', path: '/services/software-tech-support' },
  ];

  const solutions = [
    { name: "Sam's Smart Reports", path: '/solutions/sams-smart-reports' },
    { name: 'Expense Monitor', path: '/solutions/expense-monitor' },
    { name: 'Merge Spreadsheets', path: '/solutions/merge-spreadsheets' },
    { name: 'Forecasts', path: '/solutions/forecasts' },
    { name: 'Risk & Fraud', path: '/solutions/risk-fraud' },
    { name: 'Hiring', path: '/solutions/hiring' },
    { name: 'Run Facebook Ads', path: '/solutions/facebook-ads', key: 'facebookAds' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsServicesDropdownOpen(false);
      }
      if (solutionsDropdownRef.current && !solutionsDropdownRef.current.contains(event.target)) {
        setIsSolutionsDropdownOpen(false);
      }
    };

    if (isServicesDropdownOpen || isSolutionsDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isServicesDropdownOpen, isSolutionsDropdownOpen]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about-us' },
    { name: 'Ask Sam', path: '/ask-sam' },
    { name: 'Industry', path: '/industry' },
    { name: 'Case Studies', path: '/case-studies' },
    { name: 'Contact Us', path: '/contact-us' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white shadow-md backdrop-blur-md bg-white/95'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            {!logoError ? (
              <div className="flex flex-col">
                <img
                  src="/assets/tabalt-logo.png.jpg"
                  alt="Tabalt Logo"
                  className="h-12 w-auto object-contain"
                  onError={() => setLogoError(true)}
                />
                <span className="text-xs text-gray-600 font-medium mt-1">UK Outsourcing Partners</span>
              </div>
            ) : (
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  Tabalt
                </span>
                <span className="text-xs text-gray-600 font-medium">UK Outsourcing Partners</span>
              </div>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-blue-600'
                    : isScrolled
                    ? 'text-gray-700 hover:text-gray-900'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            {/* Services Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsServicesDropdownOpen(!isServicesDropdownOpen)}
                className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                  services.some(s => isActive(s.path))
                    ? 'text-blue-600'
                    : isScrolled
                    ? 'text-gray-700 hover:text-gray-900'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Services
                <ChevronDown 
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isServicesDropdownOpen ? 'rotate-180' : ''
                  }`} 
                />
              </button>
              
              <AnimatePresence>
                {isServicesDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                  >
                    {services.map((service) => (
                      <Link
                        key={service.path}
                        to={service.path}
                        className={`block px-4 py-2.5 text-sm transition-colors ${
                          isActive(service.path)
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                        onClick={() => setIsServicesDropdownOpen(false)}
                      >
                        {service.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Solutions Dropdown */}
            <div className="relative" ref={solutionsDropdownRef}>
              <button
                onClick={() => setIsSolutionsDropdownOpen(!isSolutionsDropdownOpen)}
                className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                  solutions.some(s => isActive(s.path))
                    ? 'text-blue-600'
                    : isScrolled
                    ? 'text-gray-700 hover:text-gray-900'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Solutions
                <ChevronDown 
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isSolutionsDropdownOpen ? 'rotate-180' : ''
                  }`} 
                />
              </button>
              
              <AnimatePresence>
                {isSolutionsDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                  >
                    {solutions.map((solution) => {
                      const isFacebook = solution.key === 'facebookAds';
                      const linkPath =
                        isFacebook && !isAuthenticated
                          ? '/customer/login?redirect=/solutions/facebook-ads'
                          : solution.path;
                      const label =
                        isFacebook && !isAuthenticated ? 'Get Started' : solution.name;

                      return (
                        <Link
                          key={solution.path}
                          to={linkPath}
                          className={`block px-4 py-2.5 text-sm transition-colors ${
                            isActive(solution.path)
                              ? 'text-blue-600 bg-blue-50'
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                          onClick={() => setIsSolutionsDropdownOpen(false)}
                        >
                          <div className="flex items-center justify-between">
                            <span>{label}</span>
                            {isFacebook && (
                              <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                                New
                              </span>
                            )}
                          </div>
                          {isFacebook && (
                            <p className="text-xs text-gray-500 mt-1">
                              Facebook Ads Quick Launch
                            </p>
                          )}
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              to={isCustomer ? "/customer/dashboard" : "/customer/signup"}
              className="bg-gray-900 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
            >
              {isCustomer ? "Dashboard" : "Sign up"}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`block text-base font-medium py-2 ${
                    isActive(link.path)
                      ? 'text-blue-600'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              
              {/* Mobile Services Dropdown */}
              <div>
                <button
                  onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
                  className={`flex items-center justify-between w-full text-base font-medium py-2 ${
                    services.some(s => isActive(s.path))
                      ? 'text-blue-600'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Services
                  <ChevronDown 
                    className={`h-5 w-5 transition-transform duration-200 ${
                      isMobileServicesOpen ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                
                <AnimatePresence>
                  {isMobileServicesOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-4 pt-2 space-y-2">
                        {services.map((service) => (
                          <Link
                            key={service.path}
                            to={service.path}
                            className={`block text-sm py-2 ${
                              isActive(service.path)
                                ? 'text-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              setIsMobileServicesOpen(false);
                            }}
                          >
                            {service.name}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Solutions Dropdown */}
              <div>
                <button
                  onClick={() => setIsMobileSolutionsOpen(!isMobileSolutionsOpen)}
                  className={`flex items-center justify-between w-full text-base font-medium py-2 ${
                    solutions.some(s => isActive(s.path))
                      ? 'text-blue-600'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Solutions
                  <ChevronDown 
                    className={`h-5 w-5 transition-transform duration-200 ${
                      isMobileSolutionsOpen ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                
                <AnimatePresence>
                  {isMobileSolutionsOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-4 pt-2 space-y-2">
                        {solutions.map((solution) => {
                          const isFacebook = solution.key === 'facebookAds';
                          const linkPath =
                            isFacebook && !isAuthenticated
                              ? '/customer/login?redirect=/solutions/facebook-ads'
                              : solution.path;
                          const label =
                            isFacebook && !isAuthenticated ? 'Get Started' : solution.name;

                          return (
                            <Link
                              key={solution.path}
                              to={linkPath}
                              className={`block text-sm py-2 ${
                                isActive(solution.path)
                                  ? 'text-blue-600'
                                  : 'text-gray-600 hover:text-gray-900'
                              }`}
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                setIsMobileSolutionsOpen(false);
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <span>{label}</span>
                                {isFacebook && (
                                  <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                                    New
                                  </span>
                                )}
                              </div>
                              {isFacebook && (
                                <p className="text-xs text-gray-500">
                                  Facebook Ads Quick Launch
                                </p>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                to={isCustomer ? "/customer/dashboard" : "/customer/signup"}
                className="block w-full bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold text-center hover:bg-gray-800 transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {isCustomer ? "Dashboard" : "Sign up"}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;

