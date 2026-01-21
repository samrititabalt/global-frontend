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
  const [logoError, setLogoError] = useState(false);
  const [employeeAccess, setEmployeeAccess] = useState(false);
  const [chatbotRole, setChatbotRole] = useState(null);
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { content: commonContent } = usePageContent('common');
  const getCommon = (key, fallback) => getBlockContent(commonContent, key) || fallback;
  // Check if user is a customer/agent
  const isCustomer = isAuthenticated && user?.role === 'customer';
  const isAgent = isAuthenticated && user?.role === 'agent';
  const isAdministrator = isAuthenticated && user?.role === 'admin';
  const hasEmployeeDashboard = chatbotRole === 'employee' || employeeAccess;
  const dashboardLink = hasEmployeeDashboard
    ? '/hiring-pro/employee'
    : isAgent
      ? '/agent/dashboard'
      : isCustomer
        ? '/customer/dashboard'
        : null;
  const agentInitials = isAgent
    ? (user?.name || user?.email || 'A')
        .split(' ')
        .map(part => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '';
  const dropdownRef = useRef(null);
  

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

  // Check if we're on the home page
  const isHomePage = location.pathname === '/';

  // Always show navigation and header - no scroll-based hiding
  useEffect(() => {
    setShowNavigation(true);
    setIsScrolled(true);
  }, []);

  useEffect(() => {
    const syncEmployeeAccess = () => {
      const token = localStorage.getItem('hiringProEmployeeToken');
      const role = localStorage.getItem('chatbotAccessRole');
      setEmployeeAccess(!!token);
      setChatbotRole(token ? role : null);
    };
    syncEmployeeAccess();
    window.addEventListener('accessCodeLogin', syncEmployeeAccess);
    window.addEventListener('storage', syncEmployeeAccess);
    return () => {
      window.removeEventListener('accessCodeLogin', syncEmployeeAccess);
      window.removeEventListener('storage', syncEmployeeAccess);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsServicesDropdownOpen(false);
      }
    };

    if (isServicesDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isServicesDropdownOpen]);

  const navLinks = [
    { name: 'About Us', path: '/about-us', key: 'common-nav-about' },
    { name: 'Case Studies', path: '/case-studies', key: 'common-nav-case-studies' },
    { name: 'Contact Us', path: '/contact-us', key: 'common-nav-contact' },
  ];
  if (isAdministrator) {
    navLinks.splice(1, 0, { name: 'Industry', path: '/industry', key: 'common-nav-industry' });
  }

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Regular Header - Always visible, compact size */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 ${
          isHomePage
            ? 'bg-transparent shadow-none pointer-events-none'
            : 'bg-white shadow-md backdrop-blur-md bg-white/95'
        }`}
      >
        <nav className="w-full px-4 sm:px-6 lg:px-8 py-2">
          <div className={`flex items-center min-h-[60px] ${isHomePage ? 'justify-end' : 'justify-between'}`}>
            {!isHomePage && (
              <Link to="/" className="flex items-start gap-3 group pt-1">
              {!logoError ? (
                <div className="flex flex-col items-center">
                  <img
                    src="/assets/Tabalt%20SamStudios.png"
                    alt="Tabalt Logo"
                    className="h-14 w-auto object-contain"
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
            )}

          {/* Desktop Navigation */}
          {!isHomePage && (
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
            {isAdministrator && (
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
            )}

            <Link
              to="/solutions/hiring"
              className={`text-sm font-semibold transition-colors ${
                isActive('/solutions/hiring')
                  ? 'text-blue-600'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              <EditableContent
                blockId="common-nav-wfh-hrm"
                blockType="text"
                tag="span"
                page="common"
              >
                {getCommon('common-nav-wfh-hrm', 'WFH-HRM')}
              </EditableContent>
            </Link>
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
          )}
          {isHomePage && (
            <div className="hidden md:flex items-center pointer-events-auto">
              {dashboardLink ? (
                <Link
                  to={dashboardLink}
                  className="bg-gray-900 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl border-2 border-gray-900 hover:border-gray-800 whitespace-nowrap"
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
              )}
            </div>
          )}
          {isHomePage && (
            <div className="flex md:hidden items-center pointer-events-auto">
              {dashboardLink ? (
                <Link
                  to={dashboardLink}
                  className="bg-gray-900 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-all shadow-lg border-2 border-gray-900 hover:border-gray-800 whitespace-nowrap text-sm"
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
                <Link
                  to="/customer/signup"
                  className="bg-gray-900 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-all shadow-lg border-2 border-gray-900 hover:border-gray-800 whitespace-nowrap text-sm"
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
              )}
            </div>
          )}

          {/* Mobile Menu Button */}
          {!isHomePage && (
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
          )}
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
              {isAdministrator && (
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
              )}

              <Link
                to="/solutions/hiring"
                className={`block text-base font-semibold py-2 ${
                  isActive('/solutions/hiring')
                    ? 'text-blue-600'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <EditableContent
                  blockId="common-nav-wfh-hrm"
                  blockType="text"
                  tag="span"
                  page="common"
                >
                  {getCommon('common-nav-wfh-hrm', 'WFH-HRM')}
                </EditableContent>
              </Link>

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

