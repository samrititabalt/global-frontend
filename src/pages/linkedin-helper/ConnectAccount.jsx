import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Linkedin, AlertTriangle, Shield, LoaderIcon, CheckCircle2, Monitor, RefreshCw } from 'lucide-react';
import api from '../../utils/axios';
import Loader from '../../components/Loader';

const ConnectAccount = () => {
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState(null);
  const [loginStatus, setLoginStatus] = useState('idle'); // idle, waiting, checking, logged_in, error
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
  const [profileInfo, setProfileInfo] = useState(null);

  // Poll for login status
  useEffect(() => {
    if (!sessionId || loginStatus === 'logged_in' || loginStatus === 'error') return;

    const checkStatus = async () => {
      try {
        const response = await api.get(`/linkedin-helper/accounts/login-session/${sessionId}/status`);
        const status = response.data;

        if (status.status === 'logged_in' && status.cookies === 'captured') {
          setLoginStatus('logged_in');
          setProfileInfo(status.profileInfo);
        } else if (status.status === 'error') {
          setLoginStatus('error');
          setError(status.error || 'Login failed');
        } else {
          setLoginStatus('waiting');
        }
      } catch (err) {
        console.error('Error checking status:', err);
      }
    };

    const interval = setInterval(checkStatus, 2000); // Check every 2 seconds
    return () => clearInterval(interval);
  }, [sessionId, loginStatus]);

  const handleStartLogin = async () => {
    setError('');

    if (!consentAccepted) {
      setError('You must accept the terms and risks to continue');
      return;
    }

    setLoading(true);
    setLoginStatus('waiting');
    try {
      const response = await api.post('/linkedin-helper/accounts/login-session', {
        consentAccepted: true
      });
      
      if (response.data.success) {
        setSessionId(response.data.sessionId);
        setLoginStatus('waiting');
        // Browser window should open automatically
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start login session');
      setLoginStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!sessionId) return;

    setLoading(true);
    try {
      const payload = {
        sessionId
      };

      if (formData.proxy.host && formData.proxy.port) {
        payload.proxy = {
          ...formData.proxy,
          port: parseInt(formData.proxy.port)
        };
      }

      const response = await api.post('/linkedin-helper/accounts/connect', payload);
      
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

          {/* Browser Session Login */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4 mb-4">
              <Monitor className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">Secure Browser Login</h3>
                <p className="text-sm text-blue-800 mb-4">
                  We'll open a secure browser window where you can log in to LinkedIn normally. 
                  Your session will be captured securely - no passwords or cookies shared!
                </p>
                
                {loginStatus === 'idle' && (
                  <button
                    onClick={handleStartLogin}
                    disabled={loading || !consentAccepted}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Monitor className="h-5 w-5" />
                    {loading ? 'Opening browser...' : 'Open Login Browser'}
                  </button>
                )}

                {loginStatus === 'waiting' && (
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-3 mb-3">
                      <LoaderIcon className="h-5 w-5 text-blue-600 animate-spin" />
                      <span className="font-medium text-blue-900">Waiting for login...</span>
                    </div>
                    <p className="text-sm text-blue-800">
                      A browser window has opened. Please log in to LinkedIn in that window. 
                      We'll detect when you're logged in automatically.
                    </p>
                    <button
                      onClick={() => {
                        setLoginStatus('checking');
                        // Force status check
                      }}
                      className="mt-3 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Check Status
                    </button>
                  </div>
                )}

                {loginStatus === 'logged_in' && profileInfo && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-700 mb-2">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-medium">Login Successful!</span>
                    </div>
                    <p className="text-sm text-green-800">
                      Logged in as: <strong>{profileInfo.name}</strong>
                    </p>
                  </div>
                )}

                {loginStatus === 'error' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-800">{error || 'Login failed. Please try again.'}</p>
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

          <form onSubmit={(e) => { e.preventDefault(); handleConnect(); }} className="space-y-6">

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
                disabled={loading || !consentAccepted || loginStatus !== 'logged_in'}
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
                    Complete Connection
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

