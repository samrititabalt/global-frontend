import React from 'react';
import { motion } from 'framer-motion';
import { Linkedin, MessageSquare, Users, Send, CheckCircle, Zap } from 'lucide-react';
import Header from '../../components/public/Header';
import Footer from '../../components/public/Footer';
import AccessProButton from '../../components/solutions/AccessProButton';

const LinkedInHelper = () => {
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
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <Linkedin className="w-16 h-16 text-blue-600" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="text-blue-600">LinkedIn Helper</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Streamline your LinkedIn inbox management with intelligent message extraction and personalized bulk replies.
            </p>
            <AccessProButton
              customerProPath="/customer/linkedin-helper-pro"
              agentProPath="/agent/linkedin-helper-pro"
            />
          </motion.div>
        </div>
      </section>

      {/* Background Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">About LinkedIn Helper</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              LinkedIn Helper is a personal productivity tool designed to help you efficiently manage your LinkedIn inbox. 
              Instead of spending hours manually replying to messages, our tool allows you to extract inbox messages, 
              select which conversations to respond to, and send personalized bulk replies that don't sound generic.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Functionality Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              LinkedIn Helper simplifies your inbox management with these key features:
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                icon: MessageSquare, 
                title: 'Read Inbox Messages', 
                description: 'Extract and view all your LinkedIn inbox messages in one place' 
              },
              { 
                icon: Users, 
                title: 'Select Conversations', 
                description: 'Choose which people you want to reply to from your inbox' 
              },
              { 
                icon: Send, 
                title: 'Bulk Replies', 
                description: 'Send personalized replies to multiple conversations efficiently' 
              },
              { 
                icon: CheckCircle, 
                title: 'Customized Messages', 
                description: 'Use templates with placeholders to make each reply feel personal' 
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                className="p-6 bg-white rounded-lg hover:shadow-lg transition-shadow border border-gray-100"
              >
                <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: 'Smart Personalization', description: 'Use {first_name} and {full_name} placeholders to personalize each message automatically' },
              { icon: CheckCircle, title: 'Human-in-the-Loop', description: 'Review and approve all messages before sending - you maintain full control' },
              { icon: Linkedin, title: 'LinkedIn Native', description: 'Works with your existing LinkedIn session - no password handling required' },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                className="p-6 bg-gray-50 rounded-lg hover:shadow-lg transition-shadow"
              >
                <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Streamline Your LinkedIn Inbox?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Start managing your LinkedIn messages more efficiently today.
            </p>
            <AccessProButton
              customerProPath="/customer/linkedin-helper-pro"
              agentProPath="/agent/linkedin-helper-pro"
              className="bg-white text-blue-600 hover:bg-gray-100"
            />
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LinkedInHelper;
