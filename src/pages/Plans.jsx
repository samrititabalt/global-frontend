import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/public/Header';
import Footer from '../components/public/Footer';
import PricingPlans from '../components/PricingPlans';
import api from '../utils/axios';
import { enhancePlanWithSlug } from '../utils/planHelpers';

const Plans = () => {
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

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-20">
        {error && (
          <div className="max-w-3xl mx-auto mb-6 px-4">
            <div className="rounded-2xl bg-red-50 border border-red-200 px-6 py-4 text-red-700 text-sm font-medium">
              {error}
            </div>
          </div>
        )}
        <PricingPlans plans={plans} loading={loading} onSelectPlan={handleSelectPlan} />
      </div>
      <Footer />
    </div>
  );
};

export default Plans;

