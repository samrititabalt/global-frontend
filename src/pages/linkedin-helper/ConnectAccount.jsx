import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Linkedin, AlertTriangle, Shield, LoaderIcon } from 'lucide-react';
import api from '../../utils/axios';
import Loader from '../../components/Loader';

const ConnectAccount = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    liAt: '',
    JSESSIONID: '',
    proxy: {
      host: '',
      port: '',
      username: '',
      password: '',
      type: 'http'
    }
  });
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!consentAccepted) {
      setError('You must accept the terms and risks to continue');
      return;
    }

    if (!formData.liAt || !formData.JSESSIONID) {
      setError('Both li_at and JSESSIONID cookies are required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        liAt: formData.liAt.trim(),
        JSESSIONID: formData.JSESSIONID.trim(),
        consentAccepted: true
      };

      if (formData.proxy.host && formData.proxy.port) {
        payload.proxy = {
          ...formData.proxy,
          port: parseInt(formData.proxy.port)
        };
      }

      const response = await api.post('/linkedin-helper/accounts', payload);
      
      if (response.data.success) {
        navigate('/solutions/linkedin-helper/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to connect account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
              <Linkedin className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Connect LinkedIn Account</h1>
              <p className="text-gray-600 mt-1">Add your LinkedIn account to start automation</p>
            </div>
          </div>

          {/* Warning Box */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-yellow-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">Important Disclaimer</h3>
                <p className="text-yellow-800 text-sm mb-4">
                  This tool automates LinkedIn actions and may violate LinkedIn's Terms of Service. 
                  Use at your own risk. Account restrictions or bans may occur. We are not responsible 
                  for any consequences.
                </p>
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={consentAccepted}
                    onChange={(e) => setConsentAccepted(e.target.checked)}
                    className="mt-1"
                  />
                  <label htmlFor="consent" className="text-sm text-yellow-900">
                    I understand the risks and accept full responsibility for using this tool
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* How to Get Cookies */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-3">How to Get Your LinkedIn Cookies</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
              <li>Open LinkedIn in your browser and log in</li>
              <li>Open Developer Tools (F12 or Right-click → Inspect)</li>
              <li>Go to the "Application" tab (Chrome) or "Storage" tab (Firefox)</li>
              <li>Find "Cookies" → "https://www.linkedin.com"</li>
              <li>Copy the value of <code className="bg-blue-100 px-1 rounded">li_at</code> cookie</li>
              <li>Copy the value of <code className="bg-blue-100 px-1 rounded">JSESSIONID</code> cookie</li>
              <li>Paste both values below</li>
            </ol>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                li_at Cookie *
              </label>
              <input
                type="text"
                value={formData.liAt}
                onChange={(e) => setFormData({ ...formData, liAt: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Paste your li_at cookie value here"
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
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Paste your JSESSIONID cookie value here"
                required
              />
            </div>

            {/* Proxy Settings (Optional) */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Proxy Settings (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Proxy Host</label>
                  <input
                    type="text"
                    value={formData.proxy.host}
                    onChange={(e) => setFormData({
                      ...formData,
                      proxy: { ...formData.proxy, host: e.target.value }
                    })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="proxy.example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Proxy Port</label>
                  <input
                    type="number"
                    value={formData.proxy.port}
                    onChange={(e) => setFormData({
                      ...formData,
                      proxy: { ...formData.proxy, port: e.target.value }
                    })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="8080"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username (if required)</label>
                  <input
                    type="text"
                    value={formData.proxy.username}
                    onChange={(e) => setFormData({
                      ...formData,
                      proxy: { ...formData.proxy, username: e.target.value }
                    })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password (if required)</label>
                  <input
                    type="password"
                    value={formData.proxy.password}
                    onChange={(e) => setFormData({
                      ...formData,
                      proxy: { ...formData.proxy, password: e.target.value }
                    })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button
                type="submit"
                disabled={loading || !consentAccepted}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <LoaderIcon className="h-5 w-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Shield className="h-5 w-5" />
                    Connect Account
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/solutions/linkedin-helper/dashboard')}
                className="px-6 py-3 rounded-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConnectAccount;

