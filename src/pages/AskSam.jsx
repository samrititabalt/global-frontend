import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/public/Header';
import Footer from '../components/public/Footer';
import ServicesContent from '../components/contact/Services';
import PricingPlans from '../components/PricingPlans';
import api from '../utils/axios';
import { enhancePlanWithSlug } from '../utils/planHelpers';

const AskSam = () => {
  const [activeTab, setActiveTab] = useState('services');
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
        setPlans(apiPlans.map(enhancePlanWithSlug));
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
    { id: 'services', label: 'Services' },
    { id: 'plans', label: 'Plans' },
  ];

  const renderContent = () => {
    switch (activeTab) {
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
        return <ServicesContent />;
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
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-2">
              <span className="text-blue-600">Ask Sam</span>
            </h1>
            <p className="text-lg text-gray-500 mb-4 font-medium">
              Delegate task. Save time
            </p>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our comprehensive services and flexible plans designed to help your business scale efficiently.
            </p>
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

      <Footer />
    </div>
  );
};

export default AskSam;

