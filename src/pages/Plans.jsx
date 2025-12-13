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
    if (isAuthenticated) {
      // If authenticated, go to payment
      navigate(`/customer/plans?plan=${plan.id}`);
    } else {
      // If not authenticated, go to signup
      navigate('/customer/signup', { state: { selectedPlan: plan.id } });
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

