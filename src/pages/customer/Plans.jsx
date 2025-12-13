import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../utils/axios';

const CustomerPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await api.get('/customer/plans');
      console.log('Plans API response:', response.data); // Debug log
      
      // Handle different response formats
      let plansData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          plansData = response.data;
        } else if (response.data.plans && Array.isArray(response.data.plans)) {
          plansData = response.data.plans;
        } else if (response.data.success && response.data.plans) {
          plansData = response.data.plans;
        }
      }
      
      console.log('Plans data to display:', plansData); // Debug log
      setPlans(plansData);
      
      if (plansData.length === 0) {
        console.warn('No plans found in database. Run: node backend/scripts/createPlans.js');
      }
    } catch (error) {
      console.error('Error loading plans:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Show user-friendly error
      if (error.response?.status === 401) {
        alert('Please login to view plans');
      } else if (error.response?.status === 403) {
        alert('Access denied. Customer role required.');
      } else {
        console.error('Failed to load plans. Please check your connection and try again.');
      }
      
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (planId) => {
    try {
      const response = await api.post('/payment/create', { planId });
      if (response.data.approvalUrl) {
        window.location.href = response.data.approvalUrl;
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      alert(error.response?.data?.message || 'Payment creation failed');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-800"></div>
        </div>
      </Layout>
    );
  }

  // Show empty state if no plans
  if (!plans || plans.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-white">
          <div className="bg-gradient-to-b from-gray-50 to-white py-16 md:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                Choose Your Plan
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Scale your business with flexible plans designed to meet your needs
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-2xl mx-auto">
                <p className="text-yellow-800 font-medium">
                  No plans available at the moment. Please check back later or contact support.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-gray-50 to-white py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Scale your business with flexible plans designed to meet your needs
            </p>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {plans && plans.length > 0 ? plans.map((plan, index) => {
              const isFullTime = plan.name === 'Full Time' || plan.name === 'FULL TIME';
              const isLoadCash = plan.name === 'Load Cash Minimum' || plan.name === 'LOAD CASH MINIMUM';
              
              return (
                <div
                  key={plan._id}
                  className={`relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden ${
                    isFullTime 
                      ? 'border-2 border-primary-800 lg:scale-105' 
                      : 'border border-gray-200'
                  } ${isLoadCash ? 'font-bold' : ''}`}
                >
                  {isFullTime && (
                    <div className="absolute top-0 right-0 bg-primary-800 text-white px-4 py-1 text-xs font-semibold rounded-bl-lg">
                      POPULAR
                    </div>
                  )}
                  
                  <div className="p-8">
                    <div className="mb-6">
                      <h3 className={`text-2xl font-bold text-gray-900 mb-2 ${isLoadCash ? 'font-extrabold' : ''}`}>
                        {plan.name}
                      </h3>
                      {plan.hoursPerMonth ? (
                        <p className="text-gray-600 text-sm mb-4">
                          {plan.hoursPerMonth}hrs/month
                        </p>
                      ) : plan.description ? (
                        <p className="text-gray-500 text-sm mb-4">
                          {plan.description}
                        </p>
                      ) : null}
                    </div>

                    <div className="mb-6">
                      <div className="flex items-baseline">
                        <span className={`text-5xl font-bold text-gray-900 ${isLoadCash ? 'font-extrabold' : ''}`}>
                          {formatPrice(plan.price)}
                        </span>
                        <span className="text-gray-500 ml-2 text-lg">USD</span>
                      </div>
                    </div>

                    {plan.bonusFeatures && plan.bonusFeatures.length > 0 && (
                      <div className="mb-6 pb-6 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900 mb-2">Bonus Features:</p>
                        <ul className="space-y-2">
                          {plan.bonusFeatures.map((feature, idx) => (
                            <li key={idx} className="flex items-center text-sm text-gray-600">
                              <svg className="w-4 h-4 text-primary-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mb-6">
                      <p className="text-sm text-gray-600 mb-1">Includes</p>
                      <p className="text-gray-900 font-semibold">
                        {plan.tokens.toLocaleString()} tokens
                      </p>
                    </div>

                    <button
                      onClick={() => handlePurchase(plan._id)}
                      className={`w-full py-4 px-6 rounded-lg font-semibold text-base transition-all duration-200 ${
                        isFullTime
                          ? 'bg-primary-800 text-white hover:bg-primary-900 shadow-lg hover:shadow-xl'
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                    >
                      Purchase Plan
                    </button>
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No plans available</p>
              </div>
            )}
          </div>

          {/* Additional Info Section */}
          <div className="mt-16 text-center">
            <div className="bg-gray-50 rounded-2xl p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Ready to scale your business?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto mb-6">
                Choose an outsourcing solution that boosts your efficiency, fuels company growth with top-notch performance, and scales your business with high conversion rates. All at lower costs.
              </p>
              <p className="text-sm text-gray-500">
                Quality results at a better value — 80% ROI increase and save 50% compared to in-house teams.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CustomerPlans;
