import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Linkedin, AlertTriangle, Shield, LoaderIcon, Download, CheckCircle2 } from 'lucide-react';
import api from '../../utils/axios';
import Loader from '../../components/Loader';

const ConnectAccount = () => {
  const navigate = useNavigate();
  const [hasExtension, setHasExtension] = useState(false);
  const [extensionInstalled, setExtensionInstalled] = useState(false);
  const [formData, setFormData] = useState({
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

  // Check if extension is installed
  useEffect(() => {
    // Check if we're in a browser that supports extensions
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      setHasExtension(true);
      
      // Try to detect extension by attempting to send a message
      // Extension ID will be set after installation
      const checkExtension = () => {
        // Try common extension detection methods
        const extensionId = localStorage.getItem('linkedinHelperExtensionId');
        if (extensionId) {
          try {
            chrome.runtime.sendMessage(extensionId, { action: 'ping' }, (response) => {
              if (chrome.runtime.lastError) {
                // Extension not found, but chrome.runtime exists
                setExtensionInstalled(false);
              } else if (response) {
                setExtensionInstalled(true);
              }
            });
          } catch (e) {
            setExtensionInstalled(false);
          }
        } else {
          // No extension ID stored, show installation instructions
          setExtensionInstalled(false);
        }
      };
      
      checkExtension();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!consentAccepted) {
      setError('You must accept the terms and risks to continue');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        consentAccepted: true,
        connectionMethod: 'extension'
      };

      if (formData.proxy.host && formData.proxy.port) {
        payload.proxy = {
          ...formData.proxy,
          port: parseInt(formData.proxy.port)
        };
      }

      const response = await api.post('/linkedin-helper/accounts', payload);
      
      if (response.data.success) {
        // Store auth token in extension if available
        if (extensionInstalled && window.chrome?.runtime) {
          const token = localStorage.getItem('token');
          if (token) {
            chrome.runtime.sendMessage('linkedin-helper-extension-id', {
              action: 'setAuthToken',
              token
            });
          }
        }
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

          {/* Extension Installation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4 mb-4">
              <Download className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">Install Browser Extension</h3>
                <p className="text-sm text-blue-800 mb-4">
                  Connect your LinkedIn account securely using our browser extension. No need to share cookies!
                </p>
                
                {extensionInstalled ? (
                  <div className="flex items-center gap-2 text-green-700 bg-green-100 px-4 py-2 rounded-lg">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Extension is installed and ready!</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2">Installation Steps:</h4>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                        <li>Download the extension from the link below</li>
                        <li>Open Chrome/Edge and go to <code className="bg-blue-100 px-1 rounded">chrome://extensions</code></li>
                        <li>Enable "Developer mode" (top right)</li>
                        <li>Click "Load unpacked" and select the extension folder</li>
                        <li>Return here and click "Connect Account"</li>
                      </ol>
                    </div>
                    <a
                      href="/linkedin-helper-extension.zip"
                      download
                      className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      <Download className="h-5 w-5" />
                      Download Extension
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!extensionInstalled && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Please install the browser extension first to connect your account securely.
                </p>
              </div>
            )}

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

