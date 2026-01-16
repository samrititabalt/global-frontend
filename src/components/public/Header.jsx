import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import EditableContent from '../admin/EditableContent';
import { usePageContent, getBlockContent } from '../../hooks/usePageContent';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const [isSolutionsDropdownOpen, setIsSolutionsDropdownOpen] = useState(false);
  const [isMobileSolutionsOpen, setIsMobileSolutionsOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { content: commonContent } = usePageContent('common');
  const getCommon = (key, fallback) => getBlockContent(commonContent, key) || fallback;
  // Check if user is a customer/agent
  const isCustomer = isAuthenticated && user?.role === 'customer';
  const isAgent = isAuthenticated && user?.role === 'agent';
  const agentInitials = isAgent
    ? (user?.name || user?.email || 'A')
        .split(' ')
        .map(part => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '';
  const dropdownRef = useRef(null);
  const solutionsDropdownRef = useRef(null);
  
  // Check if user can access Sam Studios solutions
  // Check if user can access Sam Studios solutions
  const isAdminOrCustomer = isAuthenticated && (
    user?.role === 'admin' ||
    user?.role === 'customer' ||
    user?.role === 'agent'
  );

  const services = [
    { name: 'UK Accounting, Taxation & Reporting', path: '/services/uk-accounting-taxation-reporting', key: 'common-services-uk-accounting' },
    { name: 'ESG', path: '/services/esg', key: 'common-services-esg' },
    { name: 'Market Research', path: '/services/market-research', key: 'common-services-market-research' },
    { name: 'Contact Centre Support', path: '/services/contact-centre-support', key: 'common-services-contact-centre' },
    { name: 'Recruitment & Staffing', path: '/services/recruitment-staffing', key: 'common-services-recruitment' },
    { name: 'Equity Research & Management', path: '/services/equity-research-management', key: 'common-services-equity-research' },
    { name: 'Industry Reports', path: '/services/industry-reports', key: 'common-services-industry-reports' },
    { name: 'Software & Tech Support', path: '/services/software-tech-support', key: 'common-services-software-tech' },
  ];

  const solutions = [
    { name: "Sam's Smart Reports", path: '/solutions/sams-smart-reports', key: 'common-solutions-smart-reports' },
    { name: 'Expense Monitor', path: '/solutions/expense-monitor', key: 'common-solutions-expense-monitor' },
    { name: 'Merge Spreadsheets', path: '/solutions/merge-spreadsheets', key: 'common-solutions-merge-spreadsheets' },
    { name: 'Forecasts', path: '/solutions/forecasts', key: 'common-solutions-forecasts' },
    { name: 'Risk & Fraud', path: '/solutions/risk-fraud', key: 'common-solutions-risk-fraud' },
    { name: 'Hiring', path: '/solutions/hiring', key: 'common-solutions-hiring' },
    { name: 'Run Facebook Ads', path: '/solutions/facebook-ads', key: 'common-solutions-facebook-ads', isFacebook: true },
    { name: 'Resume Builder', path: '/resume-builder', key: 'common-solutions-resume-builder' },
    { name: 'Industry Solutions', path: '/solutions/industry-solutions', key: 'common-solutions-industry' },
    { name: 'Document Converter & PDF Editor', path: '/solutions/document-converter', key: 'common-solutions-document-converter' },
  ];

  // Check if we're on the home page
  const isHomePage = location.pathname === '/';

  // Always show navigation and header - no scroll-based hiding
  useEffect(() => {
    setShowNavigation(true);
    setIsScrolled(true);
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
    { name: 'About Us', path: '/about-us', key: 'common-nav-about' },
    { name: 'Ask Sam', path: '/ask-sam', key: 'common-nav-ask-sam' },
    { name: 'Industry', path: '/industry', key: 'common-nav-industry' },
    { name: 'Case Studies', path: '/case-studies', key: 'common-nav-case-studies' },
    { name: 'Contact Us', path: '/contact-us', key: 'common-nav-contact' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Regular Header - Always visible, compact size */}
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md backdrop-blur-md bg-white/95"
      >
        <nav className="w-full px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between min-h-[60px]">
            {/* Logo */}
            <Link to="/" className="flex items-start gap-3 group pt-1">
            {!logoError ? (
              <div className="flex flex-col items-center">
                <img
                  src="/assets/tabalt-logo.png.jpg"
                  alt="Tabalt Logo"
                  className="h-10 w-auto object-contain"
                  onError={() => setLogoError(true)}
                />
                <EditableContent
                  blockId="common-logo-subtitle"
                  blockType="text"
                  tag="span"
                  page="common"
                  className="text-[10px] font-medium mt-0.5 text-center text-gray-600"
                >
                  {getCommon('common-logo-subtitle', 'Sam Studios')}
                </EditableContent>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <EditableContent
                  blockId="common-logo-title"
                  blockType="text"
                  tag="span"
                  page="common"
                  className="text-xl font-bold group-hover:text-blue-600 transition-colors text-gray-900"
                >
                  {getCommon('common-logo-title', 'Tabalt')}
                </EditableContent>
                <EditableContent
                  blockId="common-logo-subtitle"
                  blockType="text"
                  tag="span"
                  page="common"
                  className="text-[10px] font-medium mt-0.5 text-center text-gray-600"
                >
                  {getCommon('common-logo-subtitle', 'Sam Studios')}
                </EditableContent>
              </div>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Home - Moved to the left */}
            <Link
              to="/"
              className={`font-medium transition-colors text-sm px-4 py-2 rounded-lg ${
                isActive('/')
                  ? 'text-blue-600'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <EditableContent
                blockId="common-nav-home"
                blockType="text"
                tag="span"
                page="common"
              >
                {getCommon('common-nav-home', 'Home')}
              </EditableContent>
            </Link>
            
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-blue-600'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <EditableContent
                  blockId={link.key}
                  blockType="text"
                  tag="span"
                  page="common"
                >
                  {getCommon(link.key, link.name)}
                </EditableContent>
              </Link>
            ))}
            
            {/* Services Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsServicesDropdownOpen(!isServicesDropdownOpen)}
                className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                  services.some(s => isActive(s.path))
                    ? 'text-blue-600'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <EditableContent
                  blockId="common-nav-services"
                  blockType="text"
                  tag="span"
                  page="common"
                >
                  {getCommon('common-nav-services', 'Services')}
                </EditableContent>
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
                        <EditableContent
                          blockId={service.key}
                          blockType="text"
                          tag="span"
                          page="common"
                        >
                          {getCommon(service.key, service.name)}
                        </EditableContent>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Solutions Dropdown - Renamed to "Sam Studios" - Only visible to Admin and Customer */}
            {isAdminOrCustomer && (
            <div className="relative" ref={solutionsDropdownRef}>
              <button
                onClick={() => setIsSolutionsDropdownOpen(!isSolutionsDropdownOpen)}
                className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                  solutions.some(s => isActive(s.path))
                    ? 'text-blue-600'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <EditableContent
                  blockId="common-nav-sam-studios"
                  blockType="text"
                  tag="span"
                  page="common"
                >
                  {getCommon('common-nav-sam-studios', 'Sam Studios')}
                </EditableContent>
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
                      const isFacebook = solution.isFacebook;
                      const linkPath =
                        isFacebook && !isAuthenticated
                          ? '/customer/login?redirect=/solutions/facebook-ads'
                          : solution.path;
                      const label =
                        isFacebook && !isAuthenticated
                          ? getCommon('common-solutions-facebook-cta', 'Get Started')
                          : getCommon(solution.key, solution.name);

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
                            <EditableContent
                              blockId={isFacebook && !isAuthenticated ? 'common-solutions-facebook-cta' : solution.key}
                              blockType="text"
                              tag="span"
                              page="common"
                            >
                              {label}
                            </EditableContent>
                            {isFacebook && (
                              <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                                <EditableContent
                                  blockId="common-solutions-facebook-new"
                                  blockType="text"
                                  tag="span"
                                  page="common"
                                >
                                  {getCommon('common-solutions-facebook-new', 'New')}
                                </EditableContent>
                              </span>
                            )}
                          </div>
                          {isFacebook && (
                            <p className="text-xs text-gray-500 mt-1">
                              <EditableContent
                                blockId="common-solutions-facebook-note"
                                blockType="text"
                                tag="span"
                                page="common"
                              >
                                {getCommon('common-solutions-facebook-note', 'Facebook Ads Quick Launch')}
                              </EditableContent>
                            </p>
                          )}
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            )}
            {/* Buttons - Always visible */}
            {isCustomer || isAgent ? (
              <div className="flex items-center gap-3">
                {isAgent && (
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                    {agentInitials}
                  </div>
                )}
                <Link
                  to={isAgent ? '/agent/dashboard' : '/customer/dashboard'}
                  className="bg-gray-900 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl border-2 border-gray-900 hover:border-gray-800"
                >
                  <EditableContent
                    blockId="common-nav-dashboard"
                    blockType="text"
                    tag="span"
                    page="common"
                  >
                    {getCommon('common-nav-dashboard', 'Dashboard')}
                  </EditableContent>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/customer/signup"
                  className="bg-gray-900 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl border-2 border-gray-900 hover:border-gray-800 whitespace-nowrap"
                >
                  <EditableContent
                    blockId="common-nav-signup"
                    blockType="text"
                    tag="span"
                    page="common"
                  >
                    {getCommon('common-nav-signup', 'Sign up')}
                  </EditableContent>
                </Link>
                <Link
                  to="/customer/login"
                  className="bg-gray-900 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl border-2 border-gray-900 hover:border-gray-800 whitespace-nowrap"
                >
                  <EditableContent
                    blockId="common-nav-customer-login"
                    blockType="text"
                    tag="span"
                    page="common"
                  >
                    {getCommon('common-nav-customer-login', 'Customer Login')}
                  </EditableContent>
                </Link>
              </div>
            )}
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
                  <EditableContent
                    blockId={link.key}
                    blockType="text"
                    tag="span"
                    page="common"
                  >
                    {getCommon(link.key, link.name)}
                  </EditableContent>
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
                  <EditableContent
                    blockId="common-nav-services"
                    blockType="text"
                    tag="span"
                    page="common"
                  >
                    {getCommon('common-nav-services', 'Services')}
                  </EditableContent>
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
                            <EditableContent
                              blockId={service.key}
                              blockType="text"
                              tag="span"
                              page="common"
                            >
                              {getCommon(service.key, service.name)}
                            </EditableContent>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Solutions Dropdown - Renamed to "Sam Studios" - Only visible to Admin and Customer */}
              {isAdminOrCustomer && (
              <div>
                <button
                  onClick={() => setIsMobileSolutionsOpen(!isMobileSolutionsOpen)}
                  className={`flex items-center justify-between w-full text-base font-medium py-2 ${
                    solutions.some(s => isActive(s.path))
                      ? 'text-blue-600'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  <EditableContent
                    blockId="common-nav-sam-studios"
                    blockType="text"
                    tag="span"
                    page="common"
                  >
                    {getCommon('common-nav-sam-studios', 'Sam Studios')}
                  </EditableContent>
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
                          const isFacebook = solution.isFacebook;
                          const linkPath =
                            isFacebook && !isAuthenticated
                              ? '/customer/login?redirect=/solutions/facebook-ads'
                              : solution.path;
                          const label =
                            isFacebook && !isAuthenticated
                              ? getCommon('common-solutions-facebook-cta', 'Get Started')
                              : getCommon(solution.key, solution.name);

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
                                <EditableContent
                                  blockId={isFacebook && !isAuthenticated ? 'common-solutions-facebook-cta' : solution.key}
                                  blockType="text"
                                  tag="span"
                                  page="common"
                                >
                                  {label}
                                </EditableContent>
                                {isFacebook && (
                                  <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                                    <EditableContent
                                      blockId="common-solutions-facebook-new"
                                      blockType="text"
                                      tag="span"
                                      page="common"
                                    >
                                      {getCommon('common-solutions-facebook-new', 'New')}
                                    </EditableContent>
                                  </span>
                                )}
                              </div>
                              {isFacebook && (
                                <p className="text-xs text-gray-500">
                                  <EditableContent
                                    blockId="common-solutions-facebook-note"
                                    blockType="text"
                                    tag="span"
                                    page="common"
                                  >
                                    {getCommon('common-solutions-facebook-note', 'Facebook Ads Quick Launch')}
                                  </EditableContent>
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
              )}

              <Link
                to="/"
                className="block w-full text-gray-700 hover:text-gray-900 font-medium text-center py-3 px-6 rounded-lg hover:bg-gray-100 transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <EditableContent
                  blockId="common-nav-home"
                  blockType="text"
                  tag="span"
                  page="common"
                >
                  {getCommon('common-nav-home', 'Home')}
                </EditableContent>
              </Link>
              {isCustomer || isAgent ? (
                <Link
                  to={isAgent ? '/agent/dashboard' : '/customer/dashboard'}
                  className="block w-full bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold text-center hover:bg-gray-800 transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <EditableContent
                    blockId="common-nav-dashboard"
                    blockType="text"
                    tag="span"
                    page="common"
                  >
                    {getCommon('common-nav-dashboard', 'Dashboard')}
                  </EditableContent>
                </Link>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/customer/signup"
                    className="block w-full bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold text-center hover:bg-gray-800 transition-all border-2 border-gray-900 hover:border-gray-800"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <EditableContent
                      blockId="common-nav-signup"
                      blockType="text"
                      tag="span"
                      page="common"
                    >
                      {getCommon('common-nav-signup', 'Sign up')}
                    </EditableContent>
                  </Link>
                  <Link
                    to="/customer/login"
                    className="block w-full bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold text-center hover:bg-gray-800 transition-all border-2 border-gray-900 hover:border-gray-800"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <EditableContent
                      blockId="common-nav-customer-login"
                      blockType="text"
                      tag="span"
                      page="common"
                    >
                      {getCommon('common-nav-customer-login', 'Customer Login')}
                    </EditableContent>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
    </>
  );
};

export default Header;

