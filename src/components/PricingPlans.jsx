import React from 'react';
import { ShoppingCart } from 'lucide-react';

const PricingPlans = ({ onSelectPlan }) => {
  const plans = [
    {
      id: 'trial',
      name: 'BASIC TRIAL PACK',
      price: 49.99,
      hours: '5 hours / month',
      features: [],
      isPopular: false,
    },
    {
      id: 'starter',
      name: 'STARTER PACK',
      price: 99.99,
      hours: '20 hours / month',
      features: [],
      isPopular: false,
    },
    {
      id: 'fulltime',
      name: 'FULL TIME',
      price: 3000,
      hours: '160 hours / month',
      features: ['Weekend Support'],
      isPopular: true,
    },
    {
      id: 'loadcash',
      name: 'LOAD CASH MINIMUM',
      price: 50.0,
      hours: 'Minimum load (2 hours)',
      features: [],
      isPopular: false,
    },
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: price % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  return (
    <div className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-6">
          {plans.map((plan, index) => {
            const isPopular = plan.isPopular;

            return (
              <div
                key={plan.id}
                className={`relative group ${
                  isPopular
                    ? 'lg:scale-[1.05] lg:-mt-2 lg:mb-2 z-10'
                    : ''
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                    <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-lg">
                      Popular
                    </span>
                  </div>
                )}

                {/* Card */}
                <div
                  className={`relative h-full rounded-3xl transition-all duration-500 ease-out ${
                    isPopular
                      ? 'bg-gradient-to-br from-indigo-50 via-white to-purple-50 border-2 border-indigo-300/50 shadow-2xl hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] hover:-translate-y-3'
                      : 'bg-white border border-gray-200/80 shadow-lg hover:shadow-2xl hover:-translate-y-2'
                  } overflow-hidden`}
                >
                  {/* Glow effect for popular card */}
                  {isPopular && (
                    <>
                      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 rounded-3xl opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500 -z-10"></div>
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                    </>
                  )}

                  <div className="p-8">
                    {/* Plan Name */}
                    <div className="mb-6">
                      <h3
                        className={`text-lg font-extrabold tracking-tight ${
                          isPopular
                            ? 'text-gray-900'
                            : 'text-gray-800'
                        }`}
                      >
                        {plan.name}
                      </h3>
                    </div>

                    {/* Price */}
                    <div className="mb-8">
                      <div className="flex items-baseline">
                        <span
                          className={`font-black tracking-tight ${
                            isPopular
                              ? 'text-5xl text-gray-900'
                              : 'text-4xl text-gray-900'
                          }`}
                        >
                          {formatPrice(plan.price)}
                        </span>
                      </div>
                    </div>

                    {/* Divider */}
                    <div
                      className={`h-[1px] mb-8 ${
                        isPopular
                          ? 'bg-gradient-to-r from-transparent via-indigo-200 to-transparent'
                          : 'bg-gray-200'
                      }`}
                    ></div>

                    {/* Features */}
                    <div className="mb-10 space-y-5">
                      {/* Hours */}
                      <div className="flex items-start">
                        <div className="mt-0.5 mr-3 flex-shrink-0">
                          <svg
                            className="w-5 h-5 text-emerald-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <span
                          className={`text-sm leading-relaxed ${
                            isPopular
                              ? 'text-gray-700 font-semibold'
                              : 'text-gray-600 font-medium'
                          }`}
                        >
                          {plan.hours}
                        </span>
                      </div>

                      {/* Bonus Features */}
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start">
                          <div className="mt-0.5 mr-3 flex-shrink-0">
                            <svg
                              className="w-5 h-5 text-emerald-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                          <span
                            className={`text-sm leading-relaxed ${
                              isPopular
                                ? 'text-gray-700 font-semibold'
                                : 'text-gray-600 font-medium'
                            }`}
                          >
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => onSelectPlan && onSelectPlan(plan)}
                      className={`w-full py-4 px-6 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center space-x-2 ${
                        isPopular
                          ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 shadow-lg hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98]'
                          : 'bg-gray-900 text-white hover:bg-gray-800 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]'
                      }`}
                    >
                      <ShoppingCart className="w-4 h-4" strokeWidth={2.5} />
                      <span>Order Now</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PricingPlans;

