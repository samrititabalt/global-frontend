import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Headphones, BarChart3, FileText } from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: Headphones,
      title: 'Data Collection & Fieldwork Support',
      description: 'Fieldwork execution with trained market researchers using surveys, interviews, and panels.',
      features: [
        'Qualitative and quantitative surveys',
        'Online panels and respondent recruitment',
        'Phone interviews and call programs',
        'Mystery shopping and retail audits',
        'Consumer interviews and intercepts',
      ],
    },
    {
      icon: FileText,
      title: 'Market Research Reporting & Insights',
      description: 'Decision-ready reports designed for leadership, category owners, and brand teams.',
      features: [
        'Market research reports',
        'Category insights and deep dives',
        'Competitor analysis and benchmarking',
        'Trend reports and quarterly updates',
        'SWOT analysis and opportunity scans',
      ],
    },
    {
      icon: BarChart3,
      title: 'Ad Hoc Research & Analyst Support',
      description: 'Rapid, flexible research support for urgent questions and one-off insight requests.',
      features: [
        'Custom research requests',
        'Rapid insight generation',
        'Desk research and synthesis',
        'Analyst support and briefings',
        'Researcher-assisted insights',
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
        <h3 className="text-3xl font-bold mb-4">Ready to Activate Market Research?</h3>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Tell us your research goals and we will map the right Ask Sam market research support.
        </p>
        <Link
          to="/contact-us"
          className="inline-flex items-center justify-center bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
        >
          Contact Us
        </Link>
      </motion.div>
    </div>
  );
};

export default Services;

