import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Header from '../components/public/Header';
import Footer from '../components/public/Footer';
import { MARKETING_PLANS, normalizePlanName } from '../constants/planOptions';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';

const PlanCheckout = () => {
  const { planSlug } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const isAuthenticated = !!user;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
  });
  const [formError, setFormError] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [customerPlans, setCustomerPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  const marketingPlan = useMemo(
    () => MARKETING_PLANS.find((plan) => plan.slug === planSlug),
    [planSlug]
  );

  useEffect(() => {
    if (isAuthenticated) {
      fetchCustomerPlans();
    }
  }, [isAuthenticated]);

  const fetchCustomerPlans = async () => {
    setLoadingPlans(true);
    try {
      const response = await api.get('/customer/plans');
      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.plans || [];
      setCustomerPlans(data);
    } catch (error) {
      console.error('Error fetching customer plans:', error);
      setPurchaseError(error.response?.data?.message || 'Unable to load plan details. Please try again after logging in.');
    } finally {
      setLoadingPlans(false);
    }
  };

  const resolveBackendPlan = () => {
    if (!marketingPlan) return null;
    const normalizedTarget = normalizePlanName(marketingPlan.name);
    return customerPlans.find(
      (plan) => normalizePlanName(plan.name) === normalizedTarget
    );
  };

  const startCheckout = async () => {
    setPurchaseError('');
    if (!marketingPlan) return;

    if (!isAuthenticated) {
      setPurchaseError('Please complete the signup form or log in to continue.');
      return;
    }

    try {
      setPurchaseLoading(true);
      if (!customerPlans.length && !loadingPlans) {
        await fetchCustomerPlans();
      }

      const backendPlan = resolveBackendPlan();
      if (!backendPlan?._id) {
        setPurchaseError('Selected plan is not currently available. Please contact support.');
        return;
      }

      const response = await api.post('/payment/create', { planId: backendPlan._id });
      if (response.data.approvalUrl) {
        window.location.href = response.data.approvalUrl;
      } else {
        setPurchaseError('Unable to start checkout. Please try again.');
      }
    } catch (error) {
      console.error('Payment creation error:', error);
      setPurchaseError(error.response?.data?.message || 'Payment creation failed. Please try again.');
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    setFormError('');

    try {
      setSignupLoading(true);
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('country', formData.country);

      const response = await api.post('/auth/register', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        await refreshUser();
        startCheckout();
      }
    } catch (error) {
      console.error('Signup error:', error);
      setFormError(error.response?.data?.message || 'Failed to create account. Please try again.');
    } finally {
      setSignupLoading(false);
    }
  };

  if (!marketingPlan) {
    return (
      <div className="min-h-screen bg-[#0b0b0f] text-white flex items-center justify-center">
        <div className="text-center px-6">
          <p className="text-2xl font-semibold mb-4">Plan not found</p>
          <button
            onClick={() => navigate('/plans')}
            className="px-4 py-2 rounded-full bg-white text-gray-900 font-semibold"
          >
            Back to Pricing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0f] text-white">
      <Header />
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-10">
          <section className="bg-[#111114] border border-white/10 rounded-3xl p-8 flex-1">
            <h2 className="text-2xl font-semibold mb-6">
              {isAuthenticated ? 'Ready to continue?' : 'Create your customer account'}
            </h2>
            {isAuthenticated ? (
              <div className="space-y-4">
                <p className="text-gray-300">
                  You are logged in as <span className="font-semibold">{user?.name || user?.email}</span>.
                </p>
                <button
                  disabled={purchaseLoading || loadingPlans}
                  onClick={startCheckout}
                  className="w-full py-3 rounded-full bg-white text-gray-900 font-semibold hover:bg-gray-100 disabled:opacity-60"
                >
                  {purchaseLoading ? 'Redirecting to PayPal...' : 'Continue to payment'}
                </button>
                {purchaseError && (
                  <p className="text-sm text-red-300">{purchaseError}</p>
                )}
              </div>
            ) : (
              <form onSubmit={handleSignup} className="space-y-5">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Full name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-2xl bg-[#1b1b1f] border border-white/10 focus:outline-none focus:border-white/40"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Email address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-2xl bg-[#1b1b1f] border border-white/10 focus:outline-none focus:border-white/40"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Phone number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-2xl bg-[#1b1b1f] border border-white/10 focus:outline-none focus:border-white/40"
                    placeholder="Include country code"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-2xl bg-[#1b1b1f] border border-white/10 focus:outline-none focus:border-white/40"
                    placeholder="Where will you operate from?"
                  />
                </div>
                {formError && (
                  <p className="text-sm text-red-300">{formError}</p>
                )}
                <button
                  type="submit"
                  disabled={signupLoading}
                  className="w-full py-3 rounded-full bg-white text-gray-900 font-semibold hover:bg-gray-100 disabled:opacity-60"
                >
                  {signupLoading ? 'Creating account...' : `Continue with ${marketingPlan.label}`}
                </button>
                <p className="text-sm text-gray-400 text-center">
                  Already a customer?{' '}
                  <Link to="/customer/login" className="text-white underline">
                    Log in
                  </Link>
                </p>
              </form>
            )}
          </section>

          <section className="flex-1 bg-gradient-to-br from-purple-600/10 to-blue-500/5 border border-white/10 rounded-3xl p-8">
            <p className="uppercase text-sm tracking-[0.3em] text-gray-400 mb-4">
              Horatio plans
            </p>
            <h1 className="text-4xl font-bold mb-2">{marketingPlan.label}</h1>
            <p className="text-gray-300 mb-6">{marketingPlan.description}</p>

            <div className="mb-8">
              <span className="text-5xl font-extrabold text-white">
                ${marketingPlan.price.toLocaleString()}
              </span>
              <span className="ml-2 text-gray-400 text-lg">/ month</span>
              <p className="text-gray-400 mt-2">{marketingPlan.hours}</p>
            </div>

            <div className="bg-white/5 rounded-2xl p-6 mb-8">
              <p className="text-sm text-gray-400 mb-2">What’s included</p>
              <ul className="space-y-3 text-gray-100">
                {marketingPlan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <span className="text-emerald-400 mr-3 mt-1">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#1b1b1f] rounded-2xl p-6 border border-white/10">
              <p className="text-sm text-gray-400 uppercase tracking-wide mb-2">
                Why teams choose {marketingPlan.label}
              </p>
              <p className="text-gray-100">{marketingPlan.highlight}</p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PlanCheckout;
