import React from 'react';
import { motion } from 'framer-motion';

const StatsStrip = () => {
  const stats = [
    { number: '80%', label: 'ROI Increase' },
    { number: '50%', label: 'Cost Savings' },
    { number: '2200+', label: 'Team Members' },
    { number: '100+', label: 'Clients Served' },
  ];

  return (
    <section className="py-16 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center relative"
            >
              {index < stats.length - 1 && (
                <div className="hidden md:block absolute right-0 top-1/2 transform -translate-y-1/2 w-px h-16 bg-gray-700"></div>
              )}
              <div className="text-5xl md:text-6xl font-bold mb-2">{stat.number}</div>
              <div className="text-lg text-gray-300">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsStrip;

