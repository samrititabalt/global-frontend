import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, CreditCard, Users, Laptop, Building, Heart } from 'lucide-react';

const Industry = () => {
  const industries = [
    {
      icon: ShoppingBag,
      title: 'Retail',
      description: 'Supporting retail businesses with customer service, order management, and e-commerce operations. We help retailers deliver exceptional shopping experiences.',
      stats: '500+ retail clients',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: CreditCard,
      title: 'Fintech',
      description: 'Specialized support for financial technology companies including payment processing, account management, and compliance monitoring.',
      stats: '200+ fintech partners',
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: Users,
      title: 'Consumer',
      description: 'Comprehensive consumer services including product support, customer care, and brand management for consumer-facing businesses.',
      stats: '1000+ consumer brands',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      icon: Laptop,
      title: 'Technology',
      description: 'Tech support and customer service for SaaS companies, software providers, and technology platforms. We understand the tech landscape.',
      stats: '300+ tech companies',
      color: 'bg-orange-100 text-orange-600',
    },
    {
      icon: Building,
      title: 'Public Sector',
      description: 'Supporting government agencies and public sector organizations with citizen services, administrative support, and compliance management.',
      stats: '50+ public sector clients',
      color: 'bg-indigo-100 text-indigo-600',
    },
    {
      icon: Heart,
      title: 'Healthcare',
      description: 'Healthcare support services including patient care coordination, appointment scheduling, and medical administrative support.',
      stats: '150+ healthcare organizations',
      color: 'bg-red-100 text-red-600',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {industries.map((industry, index) => {
          const Icon = industry.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
            >
              <div className={`w-16 h-16 ${industry.color} rounded-full flex items-center justify-center mb-6`}>
                <Icon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{industry.title}</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">{industry.description}</p>
              <div className="text-sm font-semibold text-gray-500">{industry.stats}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Industry Expertise Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-12"
      >
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Why Industry Expertise Matters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">Specialized Knowledge</h4>
              <p className="text-gray-600">
                Our teams are trained in industry-specific terminology, regulations, and best practices 
                to deliver accurate and relevant support.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">Compliance & Security</h4>
              <p className="text-gray-600">
                We understand the compliance requirements and security standards unique to each industry, 
                ensuring your operations meet all regulatory needs.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">Scalable Solutions</h4>
              <p className="text-gray-600">
                Our industry-specific solutions are designed to scale with your business, whether you're 
                a startup or an enterprise.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">Proven Track Record</h4>
              <p className="text-gray-600">
                With hundreds of successful implementations across each industry, we bring proven 
                methodologies and best practices to every engagement.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Industry;

