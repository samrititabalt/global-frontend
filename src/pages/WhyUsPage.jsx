import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Shield, 
  Zap, 
  Award, 
  Globe, 
  Target,
  ArrowRight,
  BarChart3,
  Clock,
  Heart
} from 'lucide-react';
import Header from '../components/public/Header';
import Footer from '../components/public/Footer';
import EditableContent from '../components/admin/EditableContent';
import { usePageContent, getBlockContent } from '../hooks/usePageContent';

const WhyUsPage = () => {
  const { content: pageContent } = usePageContent();
  const differentiators = [
    {
      icon: Users,
      title: 'Dedicated Teams, Not Just Agents',
      description: 'Every engagement includes a complete operations organization with trainers, QA analysts, and managers—not just individual agents.',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: Shield,
      title: 'Brand Protection Guaranteed',
      description: 'We train our teams to represent your brand authentically, maintaining your voice and values in every customer interaction.',
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: Zap,
      title: 'Rapid Deployment',
      description: 'Launch new teams in weeks, not months. Our proven onboarding process gets you operational faster than building in-house.',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      icon: Award,
      title: 'Proven Track Record',
      description: 'Trusted by 100+ fast-growing companies. We\'ve helped businesses achieve 80% ROI increases and 50% cost savings.',
      color: 'bg-orange-100 text-orange-600',
    },
  ];

  const benefits = [
    {
      icon: TrendingUp,
      title: 'Scale Without Limits',
      description: 'Grow your operations as fast as your business demands, without the overhead of hiring and training.',
    },
    {
      icon: BarChart3,
      title: 'Data-Driven Insights',
      description: 'Real-time analytics and reporting help you make informed decisions and optimize performance.',
    },
    {
      icon: Clock,
      title: '24/7 Global Coverage',
      description: 'Round-the-clock support across multiple time zones ensures you never miss a customer interaction.',
    },
    {
      icon: Heart,
      title: 'People-First Culture',
      description: 'We invest heavily in our team\'s growth and wellbeing, resulting in better service and lower turnover.',
    },
  ];

  const stats = [
    { number: '80%', label: 'Average ROI Increase', description: 'Our clients see significant returns on their investment' },
    { number: '50%', label: 'Cost Savings', description: 'Compared to building in-house teams' },
    { number: '100+', label: 'Companies Trust Us', description: 'From startups to enterprises' },
    { number: '2200+', label: 'Team Members', description: 'Dedicated professionals across the globe' },
  ];

  const process = [
    {
      step: '01',
      title: 'Discovery & Planning',
      description: 'We understand your business, goals, and requirements to design the perfect solution.',
    },
    {
      step: '02',
      title: 'Team Assembly',
      description: 'We handpick and train a dedicated team tailored to your brand and industry needs.',
    },
    {
      step: '03',
      title: 'Rapid Launch',
      description: 'Get operational in weeks with our streamlined onboarding and integration process.',
    },
    {
      step: '04',
      title: 'Continuous Optimization',
      description: 'Ongoing monitoring, feedback, and improvement to ensure peak performance.',
    },
  ];

  const testimonials = [
    {
      quote: 'Ask Sam transformed our customer service operations. We scaled from 5 to 50 agents in 3 months without compromising quality.',
      author: 'Sarah Chen',
      role: 'VP of Operations',
      company: 'TechFlow Solutions',
    },
    {
      quote: 'The dedicated team model is a game-changer. We have a complete operations organization, not just agents.',
      author: 'Michael Rodriguez',
      role: 'CEO',
      company: 'RetailMax',
    },
    {
      quote: 'Best decision we made. 50% cost savings and our customers love the service quality.',
      author: 'Emily Johnson',
      role: 'Founder',
      company: 'FinanceHub',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-b from-gray-50 via-white to-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 left-0 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold mb-6"
              >
                <EditableContent
                  blockId="why-us-badge"
                  blockType="text"
                  tag="span"
                >
                  {getBlockContent(pageContent, 'why-us-badge') || 'Why Choose Ask Sam'}
                </EditableContent>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <EditableContent
                  blockId="why-us-hero-title"
                  blockType="heading"
                  tag="h1"
                  className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight"
                >
                  {getBlockContent(pageContent, 'why-us-hero-title') || 'One Assistant. Every Task. Any Industry'}
                </EditableContent>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <EditableContent
                  blockId="why-us-hero-description"
                  blockType="paragraph"
                  tag="p"
                  className="text-xl text-gray-600 mb-8 leading-relaxed"
                >
                  {getBlockContent(pageContent, 'why-us-hero-description') || 'From spreadsheets to suitcases, invoices to itineraries — Ask Sam handles it all. We provide executive assistant services across business functions like sales, finance, customer support, and administration, while also managing personal tasks such as shopping, travel, and holiday planning. Just ask.'}
                </EditableContent>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link
                  to="/contact-us"
                  className="inline-flex items-center justify-center bg-gray-900 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/services"
                  className="inline-flex items-center justify-center bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg border-2 border-gray-300 hover:border-gray-400 transition-all"
                >
                  View Services
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop"
                  alt="Professional team collaboration"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-5xl md:text-6xl font-bold mb-2 text-blue-400">{stat.number}</div>
                <div className="text-lg font-semibold mb-1">{stat.label}</div>
                <div className="text-sm text-gray-400">{stat.description}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <EditableContent
              blockId="why-us-different-title"
              blockType="heading"
              tag="h2"
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            >
              {getBlockContent(pageContent, 'why-us-different-title') || 'What Makes Us Different'}
            </EditableContent>
            <EditableContent
              blockId="why-us-different-description"
              blockType="paragraph"
              tag="p"
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              {getBlockContent(pageContent, 'why-us-different-description') || 'We don\'t just provide agents—we deliver complete operations organizations designed to scale with your business.'}
            </EditableContent>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {differentiators.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
                >
                  <div className={`w-16 h-16 ${item.color} rounded-full flex items-center justify-center mb-6`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <EditableContent
              blockId="why-us-benefits-title"
              blockType="heading"
              tag="h2"
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            >
              {getBlockContent(pageContent, 'why-us-benefits-title') || 'Why Companies Choose Ask Sam'}
            </EditableContent>
            <EditableContent
              blockId="why-us-benefits-description"
              blockType="paragraph"
              tag="p"
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              {getBlockContent(pageContent, 'why-us-benefits-description') || 'Discover the advantages that set us apart and drive exceptional results for our clients.'}
            </EditableContent>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <EditableContent
              blockId="why-us-process-title"
              blockType="heading"
              tag="h2"
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            >
              {getBlockContent(pageContent, 'why-us-process-title') || 'How It Works'}
            </EditableContent>
            <EditableContent
              blockId="why-us-process-description"
              blockType="paragraph"
              tag="p"
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              {getBlockContent(pageContent, 'why-us-process-description') || 'A simple, streamlined process to get you operational fast.'}
            </EditableContent>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                {index < process.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gray-200 z-0">
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-600 rounded-full"></div>
                  </div>
                )}
                <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                  <div className="text-4xl font-bold text-blue-600 mb-4">{step.step}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <EditableContent
              blockId="why-us-testimonials-title"
              blockType="heading"
              tag="h2"
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              {getBlockContent(pageContent, 'why-us-testimonials-title') || 'Trusted by Industry Leaders'}
            </EditableContent>
            <EditableContent
              blockId="why-us-testimonials-description"
              blockType="paragraph"
              tag="p"
              className="text-xl text-gray-300 max-w-3xl mx-auto"
            >
              {getBlockContent(pageContent, 'why-us-testimonials-description') || 'See what our clients say about working with Ask Sam.'}
            </EditableContent>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-200 mb-6 leading-relaxed italic">"{testimonial.quote}"</p>
                <div>
                  <div className="font-semibold text-white">{testimonial.author}</div>
                  <div className="text-sm text-gray-400">{testimonial.role}, {testimonial.company}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <EditableContent
              blockId="why-us-cta-title"
              blockType="heading"
              tag="h2"
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
            >
              {getBlockContent(pageContent, 'why-us-cta-title') || 'Ready to Scale Your Business?'}
            </EditableContent>
            <EditableContent
              blockId="why-us-cta-description"
              blockType="paragraph"
              tag="p"
              className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
            >
              {getBlockContent(pageContent, 'why-us-cta-description') || 'Join 100+ companies that trust Ask Sam to deliver exceptional results. Let\'s discuss how we can help transform your operations.'}
            </EditableContent>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact-us"
                className="inline-flex items-center justify-center bg-gray-900 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
              >
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/case-studies"
                className="inline-flex items-center justify-center bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg border-2 border-gray-300 hover:border-gray-400 transition-all"
              >
                View Case Studies
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default WhyUsPage;
