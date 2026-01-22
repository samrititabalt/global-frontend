import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Headphones, Shield, BarChart3, Users, FileText, Settings } from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: Headphones,
      title: 'Hard-to-Fill Role Closure',
      description: 'Targeted hiring support to fill critical roles faster with high-quality shortlists and aligned hiring plans.',
      features: [
        'Tech, non-tech, and specialist roles',
        'Role intake and success profiles',
        'Shortlist delivery in days',
        'Offer negotiation support',
      ],
    },
    {
      icon: Shield,
      title: 'Niche Talent Sourcing',
      description: 'Global reach with pre-vetted recruiters and operators to find scarce or specialized talent.',
      features: [
        'Industry-specific pipelines',
        'Pre-vetted talent networks',
        'Onshore and offshore options',
        'Diversity and quality screening',
      ],
    },
    {
      icon: BarChart3,
      title: 'Staff Augmentation',
      description: 'Flexible staffing models for fast scale with dedicated or shared resources across regions.',
      features: [
        'UK, Europe, US onshore teams',
        'India, APAC, LATAM offshore teams',
        'Dedicated or shared pods',
        '40 to 70 percent cost savings',
      ],
    },
    {
      icon: Users,
      title: 'Recruitment Automation & Screening',
      description: 'WFH-HRM automation plus Ask Sam agents keep your pipeline moving with speed and accuracy.',
      features: [
        'ATS-ready candidate screening',
        'Structured interview coordination',
        'Assessment and scorecards',
        'Weekly hiring reporting',
      ],
    },
    {
      icon: FileText,
      title: 'HR Advisory & Documentation',
      description: 'Compliant HR documentation and advisory support that scales with your growth.',
      features: [
        'Policies and handbooks',
        'Contracts and offer letters',
        'Onboarding and exit support',
        'Compliance-ready workflows',
      ],
    },
    {
      icon: Settings,
      title: 'WFH-HRM Integration',
      description: 'Ask Sam connects to WFH-HRM for end-to-end HR coverage and measurable outcomes.',
      features: [
        '12 HR service categories',
        '110 HR subservices',
        'Unified HR analytics',
        'Global hiring governance',
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
        <h3 className="text-3xl font-bold mb-4">Ready to Hire Faster?</h3>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Tell us your hiring goals and we will map the right Ask Sam support and WFH-HRM services.
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

