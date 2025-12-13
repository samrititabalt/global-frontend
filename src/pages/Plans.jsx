import React from 'react';
import Header from '../components/public/Header';
import Footer from '../components/public/Footer';
import PricingPlans from '../components/PricingPlans';
import { useNavigate } from 'react-router-dom';

const Plans = () => {
  const navigate = useNavigate();

  const handleSelectPlan = (plan) => {
    // Redirect to customer signup or login if not authenticated
    const isAuthenticated = localStorage.getItem('token');
    const selectedSlug = plan?.slug || plan?.id;

    if (selectedSlug) {
      localStorage.setItem(
        'pendingPlanSelection',
        JSON.stringify({
          slug: selectedSlug,
          name: plan?.name,
          savedAt: Date.now(),
        })
      );
    }

    if (isAuthenticated) {
      // If authenticated, go to payment
      navigate(`/customer/plans?planSlug=${selectedSlug}&autoPurchase=true`);
    } else {
      // If not authenticated, go to signup
      navigate('/customer/signup');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-20">
        <PricingPlans onSelectPlan={handleSelectPlan} />
      </div>
      <Footer />
    </div>
  );
};

export default Plans;

