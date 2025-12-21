import React from 'react';
import { motion } from 'framer-motion';
import { Users, Target, Award, TrendingUp } from 'lucide-react';

const AboutUs = () => {
  const milestones = [
    {
      year: '2021',
      title: 'Our Journey Begins',
      description: 'Ask Sam was founded with a vision to revolutionize professional services through innovative outsourcing solutions.',
    },
    {
      year: '2022',
      title: 'Rapid Growth',
      description: 'Expanded operations and established partnerships with leading companies across multiple industries.',
    },
    {
      year: '2023',
      title: 'Industry Recognition',
      description: 'Received multiple awards for excellence in customer service and business process outsourcing.',
    },
    {
      year: '2024',
      title: 'Global Expansion',
      description: 'Opened offices in strategic locations worldwide, serving clients across 50+ countries.',
    },
  ];

  const values = [
    {
      icon: Users,
      title: 'People First',
      description: 'Our team is our greatest asset. We invest in professional growth and personal wellbeing.',
    },
    {
      icon: Target,
      title: 'Excellence',
      description: 'We strive for excellence in every interaction, delivering results that exceed expectations.',
    },
    {
      icon: Award,
      title: 'Innovation',
      description: 'We continuously innovate to provide cutting-edge solutions that drive business success.',
    },
    {
      icon: TrendingUp,
      title: 'Growth',
      description: 'We grow together with our clients, building long-term partnerships based on trust.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Main Story */}
      <div className="mb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Our Story
          </h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-xl text-gray-700 leading-relaxed mb-6">
              We started our journey in 2021 and we are one of the leading professional services company. 
              From humble beginnings, we've grown into a trusted partner for businesses worldwide, helping 
              them scale operations while maintaining their unique brand identity.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Our mission is to empower businesses to focus on what they do best by handling their 
              operational needs with precision, care, and innovation. We believe that every business 
              deserves access to world-class professional services, regardless of size or industry.
            </p>
          </div>
        </motion.div>

        {/* Image Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl overflow-hidden shadow-2xl mb-16"
        >
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=600&fit=crop"
            alt="Our team"
            className="w-full h-auto object-cover"
          />
        </motion.div>
      </div>

      {/* Timeline */}
      <div className="mb-20">
        <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Our Journey
        </h3>
        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gray-200 hidden md:block"></div>
          <div className="space-y-12">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`flex flex-col md:flex-row items-center gap-8 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                <div className="flex-1 md:text-right md:pr-8">
                  {index % 2 === 0 && (
                    <>
                      <div className="text-2xl font-bold text-blue-600 mb-2">{milestone.year}</div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{milestone.title}</h4>
                      <p className="text-gray-600">{milestone.description}</p>
                    </>
                  )}
                </div>
                <div className="w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-lg z-10 hidden md:block"></div>
                <div className="flex-1 md:text-left md:pl-8">
                  {index % 2 !== 0 && (
                    <>
                      <div className="text-2xl font-bold text-blue-600 mb-2">{milestone.year}</div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{milestone.title}</h4>
                      <p className="text-gray-600">{milestone.description}</p>
                    </>
                  )}
                </div>
                <div className="md:hidden w-full">
                  <div className="text-2xl font-bold text-blue-600 mb-2">{milestone.year}</div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{milestone.title}</h4>
                  <p className="text-gray-600">{milestone.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Values */}
      <div>
        <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Our Values
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 text-center"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h4>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AboutUs;

