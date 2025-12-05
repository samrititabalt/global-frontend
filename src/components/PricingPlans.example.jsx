/**
 * PricingPlans Component - Usage Example
 * 
 * This component displays 4 pricing plans with the FULL TIME plan highlighted as premium.
 * 
 * Usage:
 * 
 * import PricingPlans from './components/PricingPlans';
 * 
 * function MyPage() {
 *   const handleSelectPlan = (plan) => {
 *     console.log('Selected plan:', plan);
 *     // Handle plan selection (e.g., navigate to checkout, open modal, etc.)
 *   };
 * 
 *   return (
 *     <div>
 *       <PricingPlans onSelectPlan={handleSelectPlan} />
 *     </div>
 *   );
 * }
 * 
 * Props:
 * - onSelectPlan: (function, optional) Callback fired when a plan is selected
 *   Receives the plan object: { id, name, price, hours, features, isPopular }
 * 
 * Features:
 * - 4 pricing cards in responsive grid
 * - FULL TIME plan highlighted with gradient and glow effects
 * - Smooth hover animations on all cards
 * - Premium styling with shadows and rounded corners
 * - "Order Now" button with shopping cart icon
 * - Fully responsive (mobile, tablet, desktop)
 */

import React from 'react';
import PricingPlans from './PricingPlans';

const ExamplePage = () => {
  const handleSelectPlan = (plan) => {
    // Example: Handle plan selection
    console.log('Plan selected:', plan);
    
    // You can:
    // - Navigate to checkout: navigate(`/checkout/${plan.id}`)
    // - Open a modal: setShowModal(true); setSelectedPlan(plan)
    // - Add to cart: addToCart(plan)
    // - Call API: api.post('/purchase', { planId: plan.id })
  };

  return (
    <div className="min-h-screen bg-white">
      <PricingPlans onSelectPlan={handleSelectPlan} />
    </div>
  );
};

export default ExamplePage;

