import React from 'react';
import { motion } from 'framer-motion';

const FeatureCard = ({ icon, title, description, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
    >
      <div className="flex flex-col items-center text-center">
        {/* Icon Circle */}
        <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-6">
          {icon ? (
            <img src={icon} alt="" className="w-10 h-10" />
          ) : (
            <div className="w-10 h-10 bg-primary-600 rounded-full"></div>
          )}
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
};

export default FeatureCard;

