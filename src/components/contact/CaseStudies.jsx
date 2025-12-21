import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Clock, Award } from 'lucide-react';

const CaseStudies = () => {
  const caseStudies = [
    {
      company: 'TechFlow Solutions',
      industry: 'Technology',
      challenge: 'TechFlow Solutions, a fast-growing SaaS company, was struggling to scale their customer support team while maintaining quality. They needed 24/7 support coverage but lacked the resources to hire and train a large in-house team.',
      solution: 'We deployed a dedicated team of 25 customer support specialists trained specifically on TechFlow\'s products and brand voice. The team included QA analysts, team leads, and specialized technical support agents.',
      results: [
        { metric: '85%', label: 'Reduction in response time' },
        { metric: '92%', label: 'Customer satisfaction score' },
        { metric: '60%', label: 'Cost savings vs in-house' },
        { metric: '3x', label: 'Support capacity increase' },
      ],
      icon: TrendingUp,
    },
    {
      company: 'RetailMax E-commerce',
      industry: 'Retail',
      challenge: 'RetailMax, an online retail platform, experienced seasonal spikes that overwhelmed their customer service team. During peak shopping periods, wait times increased dramatically, leading to customer complaints and lost sales.',
      solution: 'We implemented a scalable support model with flexible staffing that adapts to seasonal demands. Our team handles order inquiries, returns, and customer issues across multiple channels including chat, email, and phone.',
      results: [
        { metric: '70%', label: 'Faster resolution time' },
        { metric: '45%', label: 'Increase in order completion' },
        { metric: '88%', label: 'Customer satisfaction' },
        { metric: '24/7', label: 'Support coverage' },
      ],
      icon: Users,
    },
    {
      company: 'FinanceHub',
      industry: 'Fintech',
      challenge: 'FinanceHub, a financial services platform, needed to ensure compliance with financial regulations while providing excellent customer service. They required agents trained in financial services who could handle sensitive account inquiries.',
      solution: 'We assembled a specialized team with financial services expertise, including compliance training and security protocols. The team handles account management, transaction inquiries, and regulatory compliance support.',
      results: [
        { metric: '100%', label: 'Compliance rate' },
        { metric: '50%', label: 'Faster issue resolution' },
        { metric: '95%', label: 'Customer satisfaction' },
        { metric: 'Zero', label: 'Security incidents' },
      ],
      icon: Award,
    },
    {
      company: 'HealthCare Connect',
      industry: 'Healthcare',
      challenge: 'HealthCare Connect needed to improve patient communication and appointment scheduling while maintaining HIPAA compliance. Their existing system was inefficient and led to missed appointments and patient dissatisfaction.',
      solution: 'We deployed a HIPAA-compliant patient support team trained in healthcare communication protocols. The team handles appointment scheduling, patient inquiries, and coordination with healthcare providers.',
      results: [
        { metric: '40%', label: 'Reduction in no-shows' },
        { metric: '90%', label: 'Patient satisfaction' },
        { metric: '100%', label: 'HIPAA compliance' },
        { metric: '2x', label: 'Appointment capacity' },
      ],
      icon: Clock,
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
          Success Stories
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Discover how we've helped businesses across industries achieve remarkable results 
          through our professional services solutions.
        </p>
      </motion.div>

      <div className="space-y-12">
        {caseStudies.map((study, index) => {
          const Icon = study.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 md:p-12 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
            >
              <div className="flex items-start gap-6 mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-2xl font-bold text-gray-900">{study.company}</h3>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                      {study.industry}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-3">The Challenge</h4>
                  <p className="text-gray-600 leading-relaxed mb-6">{study.challenge}</p>
                  
                  <h4 className="text-lg font-bold text-gray-900 mb-3">Our Solution</h4>
                  <p className="text-gray-600 leading-relaxed">{study.solution}</p>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-6">Results</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {study.results.map((result, idx) => (
                      <div
                        key={idx}
                        className="bg-gradient-to-br from-blue-50 to-gray-50 rounded-xl p-6 text-center"
                      >
                        <div className="text-3xl font-bold text-blue-600 mb-2">{result.metric}</div>
                        <div className="text-sm text-gray-600">{result.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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
        <h3 className="text-3xl font-bold mb-4">Ready to Write Your Success Story?</h3>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Let's discuss how we can help your business achieve similar results.
        </p>
        <Link
          to="/contact"
          className="inline-flex items-center justify-center bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
        >
          Get Started
        </Link>
      </motion.div>
    </div>
  );
};

export default CaseStudies;

