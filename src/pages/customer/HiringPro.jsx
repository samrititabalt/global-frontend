import React from 'react';
import { Users, Briefcase, CheckCircle, TrendingUp, Target, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '../../components/public/Header';
import Footer from '../../components/public/Footer';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

const HiringPro = () => {
  const { user, isAuthenticated } = useAuth();

  const features = [
    {
      icon: Users,
      title: 'Candidate Matching',
      description: 'AI-powered talent matching system',
      color: 'from-indigo-500 to-blue-500',
    },
    {
      icon: Briefcase,
      title: 'Job Posting',
      description: 'Multi-platform job distribution',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: CheckCircle,
      title: 'Screening & Verification',
      description: 'Automated candidate assessment',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: TrendingUp,
      title: 'Analytics Dashboard',
      description: 'Track hiring metrics and performance',
      color: 'from-orange-500 to-red-500',
    },
  ];

  if (!isAuthenticated || user?.role !== 'customer') {
    return (
      <ProtectedRoute role="customer">
        <div>Loading...</div>
      </ProtectedRoute>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl shadow-xl p-8 mb-8 text-white">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Users className="h-8 w-8" />
              Hiring Pro
            </h1>
            <p className="text-xl text-indigo-100">Streamline your recruitment process with intelligent candidate matching</p>
          </div>

          {/* Coming Soon Section */}
          <div className="bg-white rounded-lg shadow-lg p-12 mb-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Target className="h-20 w-20 text-indigo-600 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Coming Soon</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                We're building an advanced hiring solution that will revolutionize your recruitment process. 
                This will include AI-powered candidate matching, automated screening, and comprehensive analytics.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contact-us"
                  className="inline-flex items-center justify-center px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Get Notified
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
                <a
                  href="/solutions/hiring"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-all"
                >
                  Learn More
                </a>
              </div>
            </motion.div>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${feature.color} rounded-lg mb-4 shadow-md`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Placeholder Modules */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Future Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center text-gray-400">
                  <Briefcase className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">Job Posting Manager</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center text-gray-400">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">Candidate Database</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center text-gray-400">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">Analytics Dashboard</p>
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

export default HiringPro;
