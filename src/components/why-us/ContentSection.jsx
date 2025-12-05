import React from 'react';
import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';

const ContentSection = ({
  eyebrow,
  title,
  description,
  features,
  image,
  imageAlt,
  reverse = false,
  delay = 0,
}) => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center ${
            reverse ? 'lg:flex-row-reverse' : ''
          }`}
        >
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: reverse ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay }}
            className={`${reverse ? 'lg:order-2' : 'lg:order-1'}`}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={image}
                alt={imageAlt}
                className="w-full h-auto object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: reverse ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: delay + 0.2 }}
            className={`${reverse ? 'lg:order-1' : 'lg:order-2'}`}
          >
            {eyebrow && (
              <div className="text-sm font-semibold text-primary-600 uppercase tracking-wide mb-4">
                {eyebrow}
              </div>
            )}
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {title}
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl">
              {description}
            </p>

            {features && features.length > 0 && (
              <ul className="space-y-4 mb-8">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <FiCheck className="w-6 h-6 text-primary-600 mr-3 flex-shrink-0 mt-0.5 stroke-[3]" />
                    <span className="text-gray-700 text-lg">{feature}</span>
                  </li>
                ))}
              </ul>
            )}

            <a
              href="#contact"
              className="inline-flex items-center text-primary-600 font-semibold hover:text-primary-700 transition-colors group"
            >
              Learn More
              <svg
                className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContentSection;

