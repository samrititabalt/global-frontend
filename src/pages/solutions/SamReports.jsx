import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Building2, PieChart, Briefcase } from 'lucide-react';
import Header from '../../components/public/Header';
import Footer from '../../components/public/Footer';

const SamReports = () => {
  const highlights = [
    {
      icon: Building2,
      title: 'Industry Reports',
      description: 'Syndicated coverage across global industries with executive-grade summaries.'
    },
    {
      icon: PieChart,
      title: 'Sector Insights',
      description: 'Deeper drill-downs on sub-sectors, growth dynamics, and competitive forces.'
    },
    {
      icon: Briefcase,
      title: 'Company Profiles',
      description: 'Structured profiles for benchmarking strategy, performance, and positioning.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="relative pt-28 pb-20 bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-12 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-sm font-semibold tracking-[0.2em] text-blue-600 uppercase mb-4">
                Sam Studios • Insights Suite
              </p>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Sam Reports
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                Syndicated insights across 50+ industries and 10,000+ sector-level reports.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/solutions/sam-reports-pro"
                  className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Access Pro Version
                </Link>
                <Link
                  to="/contact-us"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all"
                >
                  Talk to Us
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=1600&auto=format&fit=crop&q=80"
                alt="Sam Reports dashboard preview"
                className="rounded-2xl shadow-2xl border border-gray-200 w-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {highlights.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-lg transition-shadow"
              >
                <item.icon className="h-10 w-10 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SamReports;
