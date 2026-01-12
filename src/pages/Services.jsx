import React from 'react';
import { motion } from 'framer-motion';
import Header from '../components/public/Header';
import Footer from '../components/public/Footer';
import ServicesContent from '../components/contact/Services';
import EditableContent from '../components/admin/EditableContent';
import { usePageContent, getBlockContent } from '../hooks/usePageContent';

const Services = () => {
  const { content: pageContent } = usePageContent();
  
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 left-0 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <EditableContent
              blockId="services-hero-title"
              blockType="heading"
              tag="h1"
              className="text-5xl md:text-6xl font-bold text-gray-900 mb-4"
            >
              {getBlockContent(pageContent, 'services-hero-title') || 'Our Services'}
            </EditableContent>
            <EditableContent
              blockId="services-hero-description"
              blockType="paragraph"
              tag="p"
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              {getBlockContent(pageContent, 'services-hero-description') || 'Comprehensive professional services designed to help your business scale efficiently.'}
            </EditableContent>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-white">
        <ServicesContent />
      </section>

      <Footer />
    </div>
  );
};

export default Services;

