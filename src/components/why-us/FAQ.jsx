import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';

const FAQItem = ({ question, answer, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="border-b border-gray-200 last:border-b-0"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg px-2 -mx-2"
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${index}`}
      >
        <span className="text-lg font-semibold text-gray-900 pr-8">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-shrink-0"
        >
          <FiChevronDown className="w-6 h-6 text-gray-600" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={`faq-answer-${index}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pb-6 text-gray-600 leading-relaxed">{answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FAQ = () => {
  const faqs = [
    {
      question: 'What makes Horatio different from other outsourcing companies?',
      answer:
        'Our dedicated team approach ensures you get a complete operations organization, not just individual agents. We invest heavily in professional growth and personal wellbeing, creating a sustainable and scalable solution.',
    },
    {
      question: 'How quickly can we get started?',
      answer:
        'We work with you to launch your team quickly while ensuring quality. The timeline depends on your specific needs and requirements.',
    },
    {
      question: 'What industries do you serve?',
      answer:
        'We serve a wide range of industries including retail, e-commerce, financial services, healthcare, SaaS, technology, travel, and more.',
    },
    {
      question: 'How do you ensure quality and brand voice consistency?',
      answer:
        'Every team comes with dedicated trainers, QA analysts, and managers who work together to maintain your brand voice and quality standards.',
    },
    {
      question: 'What kind of support do you provide?',
      answer:
        'We offer comprehensive support including customer service, back office operations, trust & safety, compliance, quality assurance, and tech support.',
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about working with Horatio
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;

