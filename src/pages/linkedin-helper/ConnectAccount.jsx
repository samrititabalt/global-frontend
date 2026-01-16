import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Lock, Shield, CheckCircle2 } from 'lucide-react';
import Layout from '../../components/Layout';
import api from '../../utils/axios';

const ConnectAccount = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    linkedInEmail: '',
    li_at: '',
    JSESSIONID: '',
    proxyHost: '',
    proxyPort: '',
    proxyUsername: '',
    proxyPassword: '',
    proxyType: 'http'
  });
  const [consentGiven, setConsentGiven] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!consentGiven) {
      setError('You must accept the terms and risks to continue');
      return;
    }

    if (!formData.linkedInEmail || !formData.li_at || !formData.JSESSIONID) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const proxy = formData.proxyHost ? {
        host: formData.proxyHost,
        port: parseInt(formData.proxyPort) || 8080,
        username: formData.proxyUsername || undefined,
        password: formData.proxyPassword || undefined,
        type: formData.proxyType
      } : undefined;

      await api.post('/linkedin-helper/accounts/connect', {
        linkedInEmail: formData.linkedInEmail,
        li_at: formData.li_at,
        JSESSIONID: formData.JSESSIONID,
        proxy,
        consentGiven: true
      });

      navigate('/linkedin-helper');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to connect account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Connect LinkedIn Account</h1>
            <p className="text-sm text-gray-600 mt-1">
              Connect your LinkedIn account using session cookies
            </p>
          </div>

          {/* Risk Disclaimer */}
          <div className="px-6 py-4 bg-orange-50 border-b border-orange-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-900 mb-2">Important Disclaimer</h3>
                <p className="text-sm text-orange-800 mb-3">
                  This tool automates LinkedIn actions and may violate LinkedIn's Terms of Service. 
                  Use at your own risk. LinkedIn may restrict or ban accounts that use automation tools.
                </p>
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-1"
                  />
                  <label htmlFor="consent" className="text-sm text-orange-800">
                    I understand the risks and agree to use this tool at my own responsibility
                  </label>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* How to Get Cookies */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Lock className="h-5 w-5" />
                How to Get Your LinkedIn Cookies
              </h3>
              <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                <li>Log in to LinkedIn in your browser</li>
                <li>Open Developer Tools (F12)</li>
                <li>Go to Application/Storage tab → Cookies → https://www.linkedin.com</li>
                <li>Find and copy the values for <code className="bg-blue-100 px-1 rounded">li_at</code> and <code className="bg-blue-100 px-1 rounded">JSESSIONID</code></li>
                <li>Paste them below (cookies are encrypted before storage)</li>
              </ol>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn Email *
              </label>
              <input
                type="email"
                value={formData.linkedInEmail}
                onChange={(e) => setFormData({ ...formData, linkedInEmail: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="your.email@example.com"
                required
              />
            </div>

            {/* Cookies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  li_at Cookie *
                </label>
                <input
                  type="text"
                  value={formData.li_at}
                  onChange={(e) => setFormData({ ...formData, li_at: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  placeholder="AQEDAT..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  JSESSIONID Cookie *
                </label>
                <input
                  type="text"
                  value={formData.JSESSIONID}
                  onChange={(e) => setFormData({ ...formData, JSESSIONID: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  placeholder="ajax:..."
                  required
                />
              </div>
            </div>

            {/* Proxy (Optional) */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Proxy Settings (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proxy Host
                  </label>
                  <input
                    type="text"
                    value={formData.proxyHost}
                    onChange={(e) => setFormData({ ...formData, proxyHost: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="proxy.example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proxy Port
                  </label>
                  <input
                    type="number"
                    value={formData.proxyPort}
                    onChange={(e) => setFormData({ ...formData, proxyPort: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="8080"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proxy Type
                  </label>
                  <select
                    value={formData.proxyType}
                    onChange={(e) => setFormData({ ...formData, proxyType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="http">HTTP</option>
                    <option value="socks5">SOCKS5</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username (if required)
                  </label>
                  <input
                    type="text"
                    value={formData.proxyUsername}
                    onChange={(e) => setFormData({ ...formData, proxyUsername: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password (if required)
                  </label>
                  <input
                    type="password"
                    value={formData.proxyPassword}
                    onChange={(e) => setFormData({ ...formData, proxyPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Security Note */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-700">
                    <strong>Security:</strong> Your cookies are encrypted using AES-256-GCM before storage. 
                    We never store your LinkedIn password. You can disconnect your account and delete all 
                    data at any time.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={loading || !consentGiven}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Connecting...' : 'Connect Account'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/linkedin-helper')}
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </Layout>
  );
};

export default ConnectAccount;

