import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import EditableContent from '../admin/EditableContent';
import { usePageContent, getBlockContent } from '../../hooks/usePageContent';

const Footer = () => {
  const [logoError, setLogoError] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const { content: commonContent } = usePageContent('common');
  const getCommon = (key, fallback) => getBlockContent(commonContent, key) || fallback;
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
            <EditableContent
              blockId="common-footer-kicker"
              blockType="text"
              tag="span"
              page="common"
              className="text-xs text-gray-400 font-medium mb-4 block"
            >
              {getCommon('common-footer-kicker', 'UK Outsourcing Partners')}
            </EditableContent>
            <EditableContent
              blockId="common-footer-description"
              blockType="paragraph"
              tag="p"
              page="common"
              className="text-gray-400 mb-6"
            >
              {getCommon('common-footer-description', 'Premium outsourcing services that help businesses scale without losing their identity.')}
            </EditableContent>
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

          <div className="flex flex-col items-center">
            {services.map((service) => (
              <React.Fragment key={service}>
                <Link
                  to="/ask-sam"
                  className="text-white font-semibold mb-4 block hover:text-white transition-colors text-center"
                >
                  <EditableContent
                    blockId="common-footer-service-primary"
                    blockType="text"
                    tag="span"
                    page="common"
                  >
                    {getCommon('common-footer-service-primary', service)}
                  </EditableContent>
                </Link>
                <Link to="/" className="block mb-4 flex justify-center">
                  {!logoError ? (
                    <div className="h-48 w-48 rounded-full overflow-hidden bg-white shadow-lg flex items-center justify-center">
                      <img
                        src="/assets/Tabalt%20SamStudios.png"
                        alt="Tabalt Logo"
                        className="h-full w-full object-contain"
                        onError={() => setLogoError(true)}
                      />
                    </div>
                  ) : (
                    <EditableContent
                      blockId="common-footer-logo-text"
                      blockType="text"
                      tag="span"
                      page="common"
                      className="text-2xl font-bold text-white block"
                    >
                      {getCommon('common-footer-logo-text', 'Tabalt')}
                    </EditableContent>
                  )}
                </Link>
                {!isHomePage && (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
                    <Link
                      to="/agent/login"
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    >
                      <EditableContent
                        blockId="common-footer-agent-login"
                        blockType="text"
                        tag="span"
                        page="common"
                      >
                        {getCommon('common-footer-agent-login', 'Agent Login')}
                      </EditableContent>
                    </Link>
                    <Link
                      to="/hiring-pro/employee-login"
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    >
                      <EditableContent
                        blockId="common-footer-employee-login"
                        blockType="text"
                        tag="span"
                        page="common"
                      >
                        {getCommon('common-footer-employee-login', 'Employee Login')}
                      </EditableContent>
                    </Link>
                    <Link
                      to="/admin/login"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <EditableContent
                        blockId="common-footer-admin-login"
                        blockType="text"
                        tag="span"
                        page="common"
                      >
                        {getCommon('common-footer-admin-login', 'Admin Login')}
                      </EditableContent>
                    </Link>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          <div>
            <EditableContent
              blockId="common-footer-contact-title"
              blockType="heading"
              tag="h3"
              page="common"
              className="text-white font-semibold mb-4"
            >
              {getCommon('common-footer-contact-title', 'Contact Us')}
            </EditableContent>
            <div className="space-y-3 text-sm">
              <p className="text-gray-400">
                <a href="mailto:info@tabalt.co.uk" className="text-white hover:text-blue-400 transition-colors">
                  <EditableContent
                    blockId="common-footer-email"
                    blockType="text"
                    tag="span"
                    page="common"
                  >
                    {getCommon('common-footer-email', 'info@tabalt.co.uk')}
                  </EditableContent>
                </a>
              </p>
              <p className="text-gray-400">
                <a href="tel:+447448614160" className="text-white hover:text-blue-400 transition-colors">
                  <EditableContent
                    blockId="common-footer-phone"
                    blockType="text"
                    tag="span"
                    page="common"
                  >
                    {getCommon('common-footer-phone', '+44 7448614160')}
                  </EditableContent>
                </a>
              </p>
              <p className="text-gray-400">
                <EditableContent
                  blockId="common-footer-address"
                  blockType="text"
                  tag="span"
                  page="common"
                  className="whitespace-pre-line"
                >
                  {getCommon('common-footer-address', '3 Herron Court, Bromley,\nLondon, United Kingdom')}
                </EditableContent>
              </p>
            </div>
            <div className="mt-6">
              <EditableContent
                blockId="common-footer-stay-connected"
                blockType="text"
                tag="h4"
                page="common"
                className="text-white font-semibold mb-3 text-sm"
              >
                {getCommon('common-footer-stay-connected', 'Stay Connected')}
              </EditableContent>
              <form className="space-y-3">
                <input
                  type="email"
                  placeholder={getCommon('common-footer-email-placeholder', 'Your email')}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Email address"
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <EditableContent
                    blockId="common-footer-subscribe"
                    blockType="text"
                    tag="span"
                    page="common"
                  >
                    {getCommon('common-footer-subscribe', 'Subscribe')}
                  </EditableContent>
                </button>
              </form>
            {isHomePage && (
              <div className="mt-4 flex flex-row flex-nowrap items-center justify-center gap-2">
                <Link
                  to="/agent/login"
                  className="px-3 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 text-xs whitespace-nowrap"
                >
                  <EditableContent
                    blockId="common-footer-agent-login"
                    blockType="text"
                    tag="span"
                    page="common"
                  >
                    {getCommon('common-footer-agent-login', 'Agent Login')}
                  </EditableContent>
                </Link>
                <Link
                  to="/hiring-pro/employee-login"
                  className="px-3 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs whitespace-nowrap"
                >
                  <EditableContent
                    blockId="common-footer-employee-login"
                    blockType="text"
                    tag="span"
                    page="common"
                  >
                    {getCommon('common-footer-employee-login', 'Employee Login')}
                  </EditableContent>
                </Link>
                <Link
                  to="/admin/login"
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs whitespace-nowrap"
                >
                  <EditableContent
                    blockId="common-footer-admin-login"
                    blockType="text"
                    tag="span"
                    page="common"
                  >
                    {getCommon('common-footer-admin-login', 'Administrator')}
                  </EditableContent>
                </Link>
              </div>
            )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              <EditableContent
                blockId="common-footer-copyright"
                blockType="text"
                tag="span"
                page="common"
              >
                {getCommon('common-footer-copyright', `© ${new Date().getFullYear()} Tabalt Ltd. All rights reserved.`)}
              </EditableContent>
            </div>
            <div className="flex flex-wrap justify-center md:justify-end space-x-6 text-sm">
              <Link to="/terms-of-service" className="hover:text-white transition-colors">
                <EditableContent
                  blockId="common-footer-terms"
                  blockType="text"
                  tag="span"
                  page="common"
                >
                  {getCommon('common-footer-terms', 'Terms of Service')}
                </EditableContent>
              </Link>
              <Link to="/privacy-policy" className="hover:text-white transition-colors">
                <EditableContent
                  blockId="common-footer-privacy"
                  blockType="text"
                  tag="span"
                  page="common"
                >
                  {getCommon('common-footer-privacy', 'Privacy Policy')}
                </EditableContent>
              </Link>
              <Link to="/data-deletion" className="hover:text-white transition-colors">
                <EditableContent
                  blockId="common-footer-data-deletion"
                  blockType="text"
                  tag="span"
                  page="common"
                >
                  {getCommon('common-footer-data-deletion', 'Data Deletion')}
                </EditableContent>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

