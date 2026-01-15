import React from 'react';
import { 
  Stethoscope, 
  ShoppingBag, 
  DollarSign, 
  GraduationCap, 
  Building2, 
  Code, 
  Building,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '../../components/public/Header';
import Footer from '../../components/public/Footer';
import { useAuth } from '../../context/AuthContext';

const IndustrySolutionsPro = () => {
  const { user, isAuthenticated } = useAuth();

  const industries = [
    { icon: Stethoscope, name: 'Healthcare', color: 'from-red-500 to-pink-500' },
    { icon: ShoppingBag, name: 'Retail', color: 'from-blue-500 to-cyan-500' },
    { icon: DollarSign, name: 'Finance', color: 'from-green-500 to-emerald-500' },
    { icon: GraduationCap, name: 'Education', color: 'from-purple-500 to-indigo-500' },
    { icon: Building2, name: 'Real Estate', color: 'from-teal-500 to-cyan-500' },
    { icon: Code, name: 'IT & Technology', color: 'from-indigo-500 to-blue-500' },
    { icon: Building, name: 'Public Sector', color: 'from-gray-600 to-slate-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-xl p-8 mb-8 text-white">
            <h1 className="text-4xl font-bold mb-2">Industry Solutions Pro</h1>
            <p className="text-xl text-blue-100">Tailored digital solutions for every sector</p>
          </div>

          {/* Coming Soon Section */}
          <div className="bg-white rounded-lg shadow-lg p-12 mb-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <TrendingUp className="h-20 w-20 text-blue-600 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Coming Soon</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                We're developing comprehensive industry-specific solutions that will provide tailored digital 
                tools for each sector. Each industry will have its own specialized features and analytics.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contact-us"
                  className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Get Notified
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
                <a
                  href="/solutions/industry-solutions"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-all"
                >
                  Explore Industries
                </a>
              </div>
            </motion.div>
          </div>

          {/* Industry Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {industries.map((industry, index) => {
              const IconComponent = industry.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow text-center"
                >
                  <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${industry.color} rounded-lg mb-4 shadow-md mx-auto`}>
                    <IconComponent className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{industry.name}</h3>
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-xs text-gray-400">Coming Soon</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Placeholder Modules */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Future Industry Modules</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center text-gray-400">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">Industry Analytics</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center text-gray-400">
                  <Building className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">Custom Solutions</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center text-gray-400">
                  <Code className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">Integration Tools</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default IndustrySolutionsPro;
