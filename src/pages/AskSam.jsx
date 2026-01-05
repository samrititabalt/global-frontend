import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/public/Header';
import Footer from '../components/public/Footer';
import ServicesContent from '../components/contact/Services';
import WhyUsContent from '../components/ask-sam/WhyUs';
import ReviewsTicker from '../components/ask-sam/ReviewsTicker';
import PricingPlans from '../components/PricingPlans';
import api from '../utils/axios';
import { enhancePlanWithSlug } from '../utils/planHelpers';

const AskSam = () => {
  const [activeTab, setActiveTab] = useState('why-us');
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await api.get('/public/plans');
        const apiPlans = response.data?.plans || [];
        const enhancedPlans = apiPlans.map(enhancePlanWithSlug);
        
        // Update plans
        const updatedPlans = enhancedPlans.map(plan => {
          // Check if this is the Basic Trial Pack (by slug, name, or marketingLabel)
          const isBasicTrial = 
            plan.slug === 'trial' || 
            plan.slug === 'free-trial' ||
            plan.name?.toLowerCase().includes('trial') ||
            plan.marketingLabel?.toLowerCase().includes('trial') ||
            plan.marketingLabel?.toLowerCase().includes('free trial');
          
          // Check if this is Starter Pack
          const isStarter = 
            plan.slug === 'starter' ||
            plan.name?.toLowerCase().includes('starter') ||
            plan.marketingLabel?.toLowerCase().includes('starter');
          
          // Check if this is Load Cash Minimum
          const isLoadCash = 
            plan.slug === 'loadcash' ||
            plan.slug === 'load-cash' ||
            plan.name?.toLowerCase().includes('load cash') ||
            plan.marketingLabel?.toLowerCase().includes('load cash');
          
          if (isBasicTrial) {
            return {
              ...plan,
              minutesPerMonth: 300,
              marketingFeatures: [
                'Perfect for users to test the service',
                'No obligation',
                'Free Consultation on user problem',
                'Include Standard Support'
              ]
            };
          }
          
          if (isStarter) {
            // Get existing features and add "No Obligation" if not already present
            const existingFeatures = Array.isArray(plan.marketingFeatures) && plan.marketingFeatures.length > 0
              ? plan.marketingFeatures
              : (Array.isArray(plan.bonusFeatures) ? plan.bonusFeatures : []);
            
            // Add "No Obligation" if not already in the list
            const updatedFeatures = existingFeatures.includes('No Obligation')
              ? existingFeatures
              : [...existingFeatures, 'No Obligation'];
            
            return {
              ...plan,
              marketingFeatures: updatedFeatures
            };
          }
          
          if (isLoadCash) {
            // Get existing features and add "No Obligation" if not already present
            const existingFeatures = Array.isArray(plan.marketingFeatures) && plan.marketingFeatures.length > 0
              ? plan.marketingFeatures
              : (Array.isArray(plan.bonusFeatures) ? plan.bonusFeatures : []);
            
            // Replace "No expiration for unused minutes" with "Carry forward minutes"
            const updatedFeatures = existingFeatures.map(feature => 
              feature === 'No expiration for unused minutes' 
                ? 'Carry forward minutes' 
                : feature
            );
            
            // Add "No Obligation" if not already in the list
            const finalFeatures = updatedFeatures.includes('No Obligation')
              ? updatedFeatures
              : [...updatedFeatures, 'No Obligation'];
            
            return {
              ...plan,
              name: plan.name?.replace('LOAD CASH MINIMUM', 'LOAD CASH').replace('Load Cash Minimum', 'Load Cash') || plan.name,
              marketingLabel: plan.marketingLabel?.replace('LOAD CASH MINIMUM', 'LOAD CASH') || plan.marketingLabel,
              price: 49.99,
              marketingFeatures: finalFeatures
            };
          }
          
          return plan;
        });
        
        setPlans(updatedPlans);
        setError('');
      } catch (err) {
        console.error('Failed to load public plans:', err);
        setError('Unable to load plans right now. Please try again later.');
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleSelectPlan = (plan) => {
    if (!plan?.slug) return;
    navigate(`/plans/${plan.slug}`);
  };

  const tabs = [
    { id: 'why-us', label: 'Why Us' },
    { id: 'services', label: 'Services' },
    { id: 'plans', label: 'Plans' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'why-us':
        return <WhyUsContent />;
      case 'services':
        return <ServicesContent />;
      case 'plans':
        return (
          <div>
            {error && (
              <div className="max-w-3xl mx-auto mb-6 px-4">
                <div className="rounded-2xl bg-red-50 border border-red-200 px-6 py-4 text-red-700 text-sm font-medium">
                  {error}
                </div>
              </div>
            )}
            <PricingPlans plans={plans} loading={loading} onSelectPlan={handleSelectPlan} />
          </div>
        );
      default:
        return <WhyUsContent />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 left-0 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row items-center justify-center gap-8"
          >
            {/* Ask Sam Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex-shrink-0"
            >
              <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 p-2 shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&q=80"
                    alt="Ask Sam Logo - Professional Assistant"
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=400&fit=crop&q=80';
                    }}
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-blue-600 rounded-full p-2 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </motion.div>

            {/* Header Text */}
            <div className="text-center md:text-left">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-2 flex items-center justify-center md:justify-start gap-4">
                <span className="text-blue-600">Ask Sam</span>
              </h1>
              <p className="text-lg text-gray-500 mb-4 font-medium">
                Delegate task. Save time
              </p>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto md:mx-0 mb-4">
                Everyone deserves a helping hand—at work or at home.
              </p>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto md:mx-0">
                Ask Sam is a first-of-its-kind personal assistant service offering flexible, hourly support for every task and every individual. From business to personal to-dos, we step in exactly when you need us.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="sticky top-20 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2 md:gap-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-8 py-4 font-semibold text-sm md:text-base transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-16 bg-white">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </section>

      {/* Reviews Ticker */}
      <ReviewsTicker />

      <Footer />
    </div>
  );
};

export default AskSam;

