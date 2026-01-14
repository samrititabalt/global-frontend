import React from 'react';
import { motion } from 'framer-motion';
import { FileText, FileType, Edit3, ArrowRight, Upload, Download, PenTool } from 'lucide-react';
import Header from '../../components/public/Header';
import Footer from '../../components/public/Footer';
import AccessProButton from '../../components/solutions/AccessProButton';

const DocumentConverter = () => {
  const features = [
    {
      icon: FileType,
      title: 'Word to PDF',
      description: 'Convert Word documents (.doc, .docx) to PDF format instantly',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: FileText,
      title: 'PDF to Word',
      description: 'Transform PDF files into editable Word documents',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Edit3,
      title: 'PDF Editor',
      description: 'Edit, annotate, and customize PDFs directly in your browser',
      color: 'from-green-500 to-emerald-500',
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                <span className="text-blue-600">Document Converter</span>
                <br />
                <span className="text-indigo-600">& PDF Editor</span>
              </h1>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                Convert, edit, and manage your documents effortlessly
              </p>
              <p className="text-lg text-gray-500 mb-8">
                Transform your documents between formats and edit PDFs directly in your browser. 
                No software installation required—everything works online.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <AccessProButton proPath="/customer/document-converter-pro" />
                <a
                  href="/contact-us"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-all"
                >
                  Learn More
                </a>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="bg-blue-100 p-4 rounded-lg">
                    <FileType className="h-12 w-12 text-blue-600" />
                  </div>
                  <ArrowRight className="h-8 w-8 text-gray-400" />
                  <div className="bg-red-100 p-4 rounded-lg">
                    <FileText className="h-12 w-12 text-red-600" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Conversion</h3>
                  <p className="text-gray-600 text-sm">Convert documents in seconds</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Document Tools
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to convert and edit documents in one place
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition-shadow border border-gray-200"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.color} rounded-lg mb-6 shadow-md`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Upload', description: 'Select your document from your device', icon: Upload },
              { step: '2', title: 'Process', description: 'Our tool converts or prepares your file', icon: FileText },
              { step: '3', title: 'Download', description: 'Get your converted or edited document', icon: Download },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full text-2xl font-bold mb-4">
                  {item.step}
                </div>
                <item.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
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
              Ready to Transform Your Documents?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Start converting and editing documents today. No installation, no hassle—just powerful tools at your fingertips.
            </p>
            <AccessProButton proPath="/customer/document-converter-pro" className="bg-white text-blue-600 hover:bg-gray-100" />
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default DocumentConverter;
