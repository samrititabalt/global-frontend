import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Sparkles, CheckCircle2, ArrowRight, User, Briefcase, Award, Zap } from 'lucide-react';
import Header from '../components/public/Header';
import Footer from '../components/public/Footer';
import { useAuth } from '../context/AuthContext';

const ResumeBuilder = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated && user?.role === 'customer') {
      navigate('/resume-builder/create');
    } else {
      navigate('/customer/login?redirect=/resume-builder/create');
    }
  };

  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Generation',
      description: 'GPT-4 Mini intelligently creates professional resumes tailored to your job description',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: FileText,
      title: '2-Page Professional Format',
      description: 'Clean, modern layout with career journey maps and STAR methodology projects',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: User,
      title: 'Customizable & Editable',
      description: 'Edit your resume in real-time before downloading as PDF',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Briefcase,
      title: 'Job-Specific Optimization',
      description: 'Tailored to match job requirements and highlight relevant experience',
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              Sam Studios Solution
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Resume Builder
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Create professional, ATS-friendly resumes tailored to any job description. 
              Powered by GPT-4 Mini, our Resume Builder transforms your experience into 
              compelling career documents.
            </p>
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition"
                >
                  <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>

          {/* How It Works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-3xl p-8 md:p-12 shadow-xl"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {[
                { step: '1', title: 'Enter Job Description', desc: 'Paste the job posting you\'re applying for' },
                { step: '2', title: 'Input Your Resume', desc: 'Upload your existing resume text' },
                { step: '3', title: 'Upload Photo', desc: 'Add your professional profile picture' },
                { step: '4', title: 'Customize (Optional)', desc: 'Add specific instructions or use default format' },
                { step: '5', title: 'Generate & Download', desc: 'Get your polished resume as PDF' }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ResumeBuilder;
