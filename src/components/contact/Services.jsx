import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Headphones, Shield, BarChart3, Users, FileText, Settings } from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: Headphones,
      title: 'Customer Service',
      description: '24/7 customer support across multiple channels including phone, email, chat, and social media. Our trained agents deliver exceptional service that represents your brand.',
      features: [
        'Multi-channel support',
        '24/7 availability',
        'Brand voice training',
        'Quality assurance',
      ],
    },
    {
      icon: Shield,
      title: 'Trust & Safety',
      description: 'Protect your platform and users with comprehensive trust and safety services. Our team handles content moderation, fraud detection, and compliance monitoring.',
      features: [
        'Content moderation',
        'Fraud detection',
        'Compliance monitoring',
        'Risk assessment',
      ],
    },
    {
      icon: BarChart3,
      title: 'Back Office Support',
      description: 'Streamline your operations with our comprehensive back office support services. From data entry to financial processing, we handle it all.',
      features: [
        'Data processing',
        'Financial operations',
        'Document management',
        'Administrative tasks',
      ],
    },
    {
      icon: Users,
      title: 'Dedicated Teams',
      description: 'Get a complete operations organization dedicated to your business. Every team includes trainers, QA analysts, and managers.',
      features: [
        'Complete team structure',
        'Scalable operations',
        'Dedicated resources',
        'Custom training',
      ],
    },
    {
      icon: FileText,
      title: 'Quality Assurance',
      description: 'Ensure consistent quality across all customer interactions with our comprehensive QA programs. We monitor, measure, and improve performance continuously.',
      features: [
        'Performance monitoring',
        'Quality metrics',
        'Continuous improvement',
        'Detailed reporting',
      ],
    },
    {
      icon: Settings,
      title: 'Tech Support',
      description: 'Provide technical assistance to your customers with our skilled tech support teams. From troubleshooting to product guidance, we cover it all.',
      features: [
        'Technical troubleshooting',
        'Product support',
        'Issue resolution',
        'Knowledge base management',
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Our Services
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Comprehensive professional services designed to help your business scale efficiently 
          while maintaining the highest quality standards.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, index) => {
          const Icon = service.icon;
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
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <Icon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
              <ul className="space-y-2">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start text-gray-700">
                    <span className="text-blue-600 mr-2 mt-1">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mt-20 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-12 text-center text-white"
      >
        <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Let's discuss how our services can help transform your business operations.
        </p>
        <Link
          to="/contact"
          className="inline-flex items-center justify-center bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
        >
          Contact Us
        </Link>
      </motion.div>
    </div>
  );
};

export default Services;

