import React from 'react';
import { ShoppingCart } from 'lucide-react';

const PricingPlans = ({ plans = [], loading = false, onSelectPlan }) => {
  const formatPrice = (price = 0) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: price % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(price || 0);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="col-span-full flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      );
    }

    if (!plans.length) {
      return (
        <div className="col-span-full text-center py-16">
          <p className="text-gray-500 text-lg font-semibold">
            No plans available right now. Please check back soon.
          </p>
        </div>
      );
    }

    return plans.map((plan) => {
      const isPopular = plan.isPopular;
      const displayLabel = plan.marketingLabel || plan.name;
      const hoursLabel =
        plan.hoursPerMonth && Number(plan.hoursPerMonth) > 0
          ? `${plan.hoursPerMonth} hours / month`
          : plan.description || plan.marketingSummary;
      const featureList =
        (Array.isArray(plan.marketingFeatures) && plan.marketingFeatures.length > 0
          ? plan.marketingFeatures
          : plan.bonusFeatures) || [];

      return (
        <div
          key={plan.slug || plan._id || displayLabel}
          className={`relative group ${isPopular ? 'lg:scale-[1.05] lg:-mt-2 lg:mb-2 z-10' : ''}`}
        >
          {isPopular && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-lg">
                Popular
              </span>
            </div>
          )}

          <div
            className={`relative h-full rounded-3xl transition-all duration-500 ease-out ${
              isPopular
                ? 'bg-gradient-to-br from-indigo-50 via-white to-purple-50 border-2 border-indigo-300/50 shadow-2xl hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] hover:-translate-y-3'
                : 'bg-white border border-gray-200/80 shadow-lg hover:shadow-2xl hover:-translate-y-2'
            } overflow-hidden`}
          >
            {isPopular && (
              <>
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 rounded-3xl opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500 -z-10" />
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
              </>
            )}

            <div className="p-8">
              <div className="mb-6">
                <h3
                  className={`text-lg font-extrabold tracking-tight ${
                    isPopular ? 'text-gray-900' : 'text-gray-800'
                  }`}
                >
                  {displayLabel}
                </h3>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline">
                  <span
                    className={`font-black tracking-tight ${
                      isPopular ? 'text-5xl text-gray-900' : 'text-4xl text-gray-900'
                    }`}
                  >
                    {formatPrice(plan.price)}
                  </span>
                </div>
              </div>

              <div
                className={`h-[1px] mb-8 ${
                  isPopular ? 'bg-gradient-to-r from-transparent via-indigo-200 to-transparent' : 'bg-gray-200'
                }`}
              />

              <div className="mb-10 space-y-5">
                {hoursLabel && (
                  <div className="flex items-start">
                    <div className="mt-0.5 mr-3 flex-shrink-0">
                      <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span
                      className={`text-sm leading-relaxed ${
                        isPopular ? 'text-gray-700 font-semibold' : 'text-gray-600 font-medium'
                      }`}
                    >
                      {hoursLabel}
                    </span>
                  </div>
                )}

                {featureList.map((feature, idx) => (
                  <div key={idx} className="flex items-start">
                    <div className="mt-0.5 mr-3 flex-shrink-0">
                      <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span
                      className={`text-sm leading-relaxed ${
                        isPopular ? 'text-gray-700 font-semibold' : 'text-gray-600 font-medium'
                      }`}
                    >
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onSelectPlan && onSelectPlan(plan)}
                className={`w-full py-4 px-6 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center space-x-2 ${
                  isPopular
                    ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 shadow-lg hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-gray-900 text-white hover:bg-gray-800 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]'
                }`}
                disabled={!onSelectPlan}
              >
                <ShoppingCart className="w-4 h-4" strokeWidth={2.5} />
                <span>Order Now</span>
              </button>
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default PricingPlans;

