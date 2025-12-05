import React from 'react';
import FeatureCard from './FeatureCard';

const FeatureCardsRow = () => {
  const features = [
    {
      icon: '/assets/feature-1.svg',
      title: 'Dedicated Team',
      description: 'Get a robust team behind them, baked into your investment. From trainers to QA analysts.',
    },
    {
      icon: '/assets/feature-2.svg',
      title: 'Professional Growth',
      description: 'We heavily invest in professional growth and personal wellbeing of every team member.',
    },
    {
      icon: '/assets/feature-3.svg',
      title: 'Scalable Operations',
      description: 'Scale your business with ease. Operations org that helps you grow without losing quality.',
    },
    {
      icon: '/assets/feature-4.svg',
      title: 'Brand Voice',
      description: 'Maintain your brand identity while scaling. Personalized solutions that fit your needs.',
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            The Horatio Advantage
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The secret to our success is our people. Our dedicated team of professionals is at the heart of everything we do.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCardsRow;

