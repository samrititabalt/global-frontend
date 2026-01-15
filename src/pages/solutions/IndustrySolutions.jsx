import React from 'react';
import { motion } from 'framer-motion';
import { 
  Stethoscope, 
  ShoppingBag, 
  DollarSign, 
  GraduationCap, 
  UtensilsCrossed, 
  Building2, 
  Code, 
  Building,
  ArrowRight,
  TrendingUp,
  Users,
  Target
} from 'lucide-react';
import Header from '../../components/public/Header';
import Footer from '../../components/public/Footer';
import AccessProButton from '../../components/solutions/AccessProButton';

const IndustrySolutions = () => {
  const industries = [
    {
      icon: Stethoscope,
      name: 'Healthcare',
      description: 'Streamline patient management, medical records, and healthcare analytics with tailored digital solutions.',
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
    },
    {
      icon: ShoppingBag,
      name: 'Retail',
      description: 'Enhance customer experience, inventory management, and sales analytics for retail businesses of all sizes.',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      icon: DollarSign,
      name: 'Finance',
      description: 'Secure financial management, transaction processing, and compliance solutions for financial institutions.',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      icon: GraduationCap,
      name: 'Education',
      description: 'Transform learning management, student tracking, and educational analytics for institutions.',
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      icon: UtensilsCrossed,
      name: 'Hospitality',
      description: 'Optimize guest services, booking systems, and operational efficiency for hotels and restaurants.',
      color: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
    {
      icon: Building2,
      name: 'Real Estate',
      description: 'Manage properties, listings, and client relationships with comprehensive real estate solutions.',
      color: 'from-teal-500 to-cyan-500',
      bgColor: 'bg-teal-50',
      iconColor: 'text-teal-600',
    },
    {
      icon: Code,
      name: 'IT & Technology',
      description: 'Accelerate development, streamline operations, and enhance technical infrastructure for tech companies.',
      color: 'from-indigo-500 to-blue-500',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
    },
    {
      icon: Building,
      name: 'Public Sector',
      description: 'Modernize government services, citizen engagement, and public administration with secure solutions.',
      color: 'from-gray-600 to-slate-600',
      bgColor: 'bg-gray-50',
      iconColor: 'text-gray-600',
    },
  ];

  const features = [
    {
      icon: Target,
      title: 'Industry-Specific',
      description: 'Solutions tailored to your sector\'s unique challenges and requirements',
    },
    {
      icon: TrendingUp,
      title: 'Scalable Growth',
      description: 'Built to grow with your business, from startup to enterprise',
    },
    {
      icon: Users,
      title: 'Expert Support',
      description: 'Dedicated teams with deep industry knowledge and experience',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              <span className="text-blue-600">Industry Solutions</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Tailored digital solutions for every sector
            </p>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Discover how our industry-specific solutions can transform your business operations, 
              enhance efficiency, and drive growth across multiple sectors.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Solutions for Every Industry
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore our comprehensive range of industry-specific solutions designed to address 
              your unique business challenges.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {industries.map((industry, index) => {
              const IconComponent = industry.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`${industry.bgColor} rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-200`}
                >
                  <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${industry.color} rounded-lg mb-4 shadow-md`}>
                    <IconComponent className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{industry.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {industry.description}
                  </p>
                  <div className="mt-4">
                    <AccessProButton 
                      customerProPath="/customer/industry-solutions-pro"
                      agentProPath="/agent/industry-solutions-pro"
                      className="w-full text-sm py-2"
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Transform Your Industry?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Get in touch with our experts to discover how our industry solutions can 
              revolutionize your business operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact-us"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Contact Us
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
              <a
                href="/solutions/sams-smart-reports"
                className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white font-semibold rounded-lg border-2 border-white hover:bg-white/10 transition-all"
              >
                Explore Solutions
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default IndustrySolutions;
