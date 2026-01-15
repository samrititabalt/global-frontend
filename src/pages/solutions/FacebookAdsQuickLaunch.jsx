import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/public/Header';
import Footer from '../../components/public/Footer';
import {
  fetchFacebookAdsStatus,
  fetchFacebookOAuthUrl,
  launchFacebookQuickCampaign,
} from '../../services/facebookAds';
import {
  Zap,
  ShieldCheck,
  Sparkles,
  CreditCard,
  ArrowRight,
  CheckCircle2,
  Link2,
} from 'lucide-react';

const Modal = ({ isOpen, onClose, children }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative w-full max-w-3xl mx-4 rounded-2xl bg-white shadow-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const goals = [
  {
    value: 'traffic',
    label: 'Traffic',
    helper: 'Drive high-intent visitors to your site or landing page.',
  },
  {
    value: 'leads',
    label: 'Leads',
    helper: 'Capture form fills or messenger leads.',
  },
  {
    value: 'sales',
    label: 'Sales',
    helper: 'Optimised for purchases or conversions.',
  },
];

const categories = [
  'agency',
  'consulting',
  'ecommerce',
  'education',
  'finance',
  'healthcare',
  'saas',
];

const BudgetBadge = ({ value }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
    <CreditCard className="h-4 w-4" />
    £{value}/day
  </span>
);

const FacebookAdsQuickLaunch = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState({ connected: false });
  const [isStatusLoading, setIsStatusLoading] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [toast, setToast] = useState(null);
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({
    goal: 'traffic',
    dailyBudget: '75',
    destinationUrl: '',
    businessCategory: 'agency',
  });

  const modalDisabled = useMemo(
    () => !isAuthenticated || !status.connected,
    [isAuthenticated, status.connected]
  );

  const handlePrimaryCta = () => {
    if (!isAuthenticated) {
      navigate('/customer/login?redirect=/solutions/facebook-ads');
      return;
    }
    setShowModal(true);
  };

  const loadStatus = async () => {
    if (!isAuthenticated) return;
    try {
      setIsStatusLoading(true);
      const { data } = await fetchFacebookAdsStatus();
      setStatus(data);
    } catch (error) {
      console.error('Status error', error);
      setStatus({ connected: false });
    } finally {
      setIsStatusLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    loadStatus();
  }, [isAuthenticated]);

  useEffect(() => {
    if (searchParams.get('fb_connected')) {
      const params = new URLSearchParams(searchParams);
      setToast({
        type: 'success',
        message: 'Facebook connected successfully. Launch your campaign now.',
      });
      params.delete('fb_connected');
      setSearchParams(params, { replace: true });
      loadStatus();
    }
    if (searchParams.get('fb_error')) {
      const params = new URLSearchParams(searchParams);
      setToast({
        type: 'error',
        message: 'We could not connect Facebook. Please try again.',
      });
      params.delete('fb_error');
      setSearchParams(params, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      const { data } = await fetchFacebookOAuthUrl();
      window.open(
        data.url,
        'facebook-auth',
        'width=600,height=700,menubar=0,toolbar=0,status=0'
      );
      setToast({
        type: 'info',
        message: 'Complete the Facebook popup and return to this tab.',
      });
    } catch (error) {
      console.error('OAuth url error', error);
      setToast({
        type: 'error',
        message: error.response?.data?.message || 'Unable to start Facebook OAuth.',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLaunch = async (event) => {
    event.preventDefault();
    if (modalDisabled) return;

    try {
      setIsLaunching(true);
      const { data } = await launchFacebookQuickCampaign(formData);
      setResult(data);
      setToast({
        type: 'success',
        message: 'Campaign launched! Check Ads Manager for performance.',
      });
      setShowModal(false);
    } catch (error) {
      console.error('Launch error', error);
      setToast({
        type: 'error',
        message: error.response?.data?.message || 'Unable to launch campaign.',
      });
    } finally {
      setIsLaunching(false);
    }
  };

  const heroButtonLabel = 'Access Pro Version';

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="relative overflow-hidden pt-32 pb-20 bg-gradient-to-br from-blue-50 via-white to-indigo-100">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 right-0 h-72 w-72 rounded-full bg-blue-200 blur-3xl opacity-40" />
          <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-purple-200 blur-3xl opacity-30" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-800 font-semibold text-sm mb-6">
                <Sparkles className="h-4 w-4" />
                Facebook Ads Quick Launch
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Launch Meta campaigns <span className="text-blue-600">in under 60 seconds</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Connect your Facebook account, pick a goal, set a budget, and Tabalt will deploy a
                compliant Advantage+ campaign for you—no Ads Manager maze required.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={handlePrimaryCta}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3 text-white font-semibold shadow-lg hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
                >
                  {heroButtonLabel}
                  <ArrowRight className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <ShieldCheck className="h-4 w-4" />
                  Meta Partner workflow
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase text-gray-500 font-semibold">Connection</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {status.connected ? 'Facebook linked' : 'Not connected'}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span
                    className={`inline-flex h-3 w-3 rounded-full ${
                      status.connected ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                  {status.connected ? 'Ready to launch' : 'Action required'}
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-2">Recent launch templates</p>
                  <div className="flex flex-wrap gap-3">
                    <BudgetBadge value={50} />
                    <BudgetBadge value={75} />
                    <BudgetBadge value={120} />
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-2">Automations</p>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Advantage+ placements pre-enabled</li>
                    <li>• Geo targeting locked to UK for compliance</li>
                    <li>• Creative template approved by Tabalt</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'Speed over complexity',
                description:
                  '4 inputs, 1 click. We handle campaign, ad set, creative, and publishing.',
              },
              {
                icon: ShieldCheck,
                title: 'Policy-safe templates',
                description:
                  'Creative copy & placements follow Meta best practices and Advantage+ defaults.',
              },
              {
                icon: Link2,
                title: 'Auto tracking',
                description:
                  'UTM templates baked in so Analytics, HubSpot, and CRM can attribute instantly.',
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition-shadow"
              >
                <item.icon className="h-10 w-10 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

  <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="p-8">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
              Quick launch
            </p>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Launch Facebook Ads</h2>
          <p className="text-gray-500 mb-6">
            Complete the four fields below and Tabalt will create the campaign, ad set, creative,
            and ad in your connected Business Manager.
          </p>

          <div
            className={`mb-6 rounded-xl border px-4 py-3 ${
              status.connected ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'
            }`}
          >
            <p className="text-sm font-semibold text-gray-800">
              {status.connected
                ? `Connected to ${status.adAccountId || 'your ad account'}`
                : 'Facebook account not connected'}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {status.connected
                ? 'We will deploy to this ad account with your saved permissions.'
                : 'Connect your Facebook Business Manager before launching.'}
            </p>
            {!status.connected && (
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
              >
                {isConnecting ? 'Opening Facebook…' : 'Connect Facebook'}
              </button>
            )}
          </div>

          <form onSubmit={handleLaunch} className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Campaign goal
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {goals.map((goalOption) => (
                  <button
                    key={goalOption.value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, goal: goalOption.value }))}
                    className={`rounded-xl border p-4 text-left transition-all ${
                      formData.goal === goalOption.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-200'
                    }`}
                  >
                    <p className="font-semibold text-gray-900">{goalOption.label}</p>
                    <p className="text-sm text-gray-600">{goalOption.helper}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Daily budget (GBP)
                </label>
                <input
                  type="number"
                  name="dailyBudget"
                  min="5"
                  step="5"
                  value={formData.dailyBudget}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, dailyBudget: event.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g. 75"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Business category
                </label>
                <select
                  value={formData.businessCategory}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, businessCategory: event.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Website / App URL
              </label>
              <input
                type="url"
                name="destinationUrl"
                placeholder="https://"
                value={formData.destinationUrl}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, destinationUrl: event.target.value }))
                }
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>

            <button
              type="submit"
              disabled={modalDisabled || isLaunching}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg hover:bg-blue-700 disabled:opacity-60"
            >
              {isLaunching ? 'Launching…' : 'Launch Campaign'}
              <Zap className="h-4 w-4" />
            </button>
          </form>
        </div>
      </Modal>

      {toast && (
        <div className="fixed bottom-6 right-6 z-40">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`rounded-2xl px-5 py-4 shadow-xl text-sm font-semibold text-white ${
              toast.type === 'success'
                ? 'bg-emerald-600'
                : toast.type === 'error'
                ? 'bg-rose-500'
                : 'bg-blue-600'
            }`}
          >
            {toast.message}
          </motion.div>
        </div>
      )}

      {result && (
        <div className="max-w-3xl mx-auto px-4 pb-16">
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 flex items-start gap-4">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            <div>
              <p className="font-semibold text-gray-900 mb-1">Campaign launched</p>
              <p className="text-sm text-gray-600 mb-3">
                Campaign ID {result.campaignId} with Ad Set {result.adSetId} is now live. Review
                performance inside Meta Ads Manager.
              </p>
              <div className="text-xs text-gray-400">
                Ad ID <span className="font-mono">{result.adId}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default FacebookAdsQuickLaunch;

