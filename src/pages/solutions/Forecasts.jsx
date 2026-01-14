import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TrendingUp, BarChart3, Target, Lightbulb, ArrowRight } from 'lucide-react';
import Header from '../../components/public/Header';
import Footer from '../../components/public/Footer';
import AccessProButton from '../../components/solutions/AccessProButton';

const Forecasts = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-purple-50 via-white to-pink-50 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="text-purple-600">Forecasts</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Predict future trends and make data-driven decisions with advanced forecasting models.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <AccessProButton proPath="/customer/forecasts-pro" />
              <Link
                to="/contact-us"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-all"
              >
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: TrendingUp, title: 'Accurate Predictions', description: 'AI-powered forecasting algorithms' },
              { icon: BarChart3, title: 'Visual Analytics', description: 'Interactive charts and graphs' },
              { icon: Target, title: 'Scenario Planning', description: 'Model different outcomes' },
              { icon: Lightbulb, title: 'Insights', description: 'Actionable recommendations' },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-6 bg-gray-50 rounded-lg hover:shadow-lg transition-shadow"
              >
                <feature.icon className="h-12 w-12 text-purple-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Forecasts;

