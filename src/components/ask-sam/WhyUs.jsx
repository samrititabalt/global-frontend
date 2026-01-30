import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  ArrowRight,
  BarChart3,
  Clock,
  Heart
} from 'lucide-react';

const WhyUs = () => {
  const differentiators = [
    {
      icon: Users,
      title: 'Data Collection & Fieldwork Support',
      description: 'Market researchers run surveys, panels, interviews, and mystery shopping with reliable field execution.',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: BarChart3,
      title: 'Market Research Reporting & Insights',
      description: 'Decision-ready reports, category deep dives, and quarterly insight packs built for leadership teams.',
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: TrendingUp,
      title: 'Competitor & Category Intelligence',
      description: 'Monitor competitor moves, category shifts, and pricing activity with ongoing research coverage.',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      icon: Heart,
      title: 'Consumer & Shopper Insights',
      description: 'Capture attitudes, preferences, and behaviors to guide product, brand, and channel decisions.',
      color: 'bg-orange-100 text-orange-600',
    },
  ];

  const benefits = [
    {
      icon: Clock,
      title: 'Faster Insight Cycles',
      description: 'Move from brief to insight in weeks with coordinated data collection and analyst support.',
    },
    {
      icon: Users,
      title: 'Dedicated Researcher',
      description: 'One researcher owns your account, validates data, and fills gaps manually.',
    },
    {
      icon: BarChart3,
      title: 'Decision-Ready Reporting',
      description: 'Reports, dashboards, and summaries tailored for leadership and category teams.',
    },
    {
      icon: TrendingUp,
      title: 'Always-On Intelligence',
      description: 'Quarterly trends, competitor moves, and consumer shifts tracked continuously.',
    },
  ];

  const stats = [
    { number: '50+', label: 'Industries Covered', description: 'Cross-sector coverage with dedicated researchers' },
    { number: '10k+', label: 'Sector-Level Reports', description: 'Category, competitor, and consumer insights' },
    { number: '4-6 wks', label: 'Insight Delivery', description: 'From brief to board-ready report' },
    { number: '1', label: 'Dedicated Researcher', description: 'Aligned to your brand and category' },
  ];

  const process = [
    {
      step: '01',
      title: 'Submit Research Brief',
      description: 'Share your category, market, and decision goals with Ask Sam.',
    },
    {
      step: '02',
      title: 'Research Design & Scope',
      description: 'We define methodology, sample, and reporting outputs with your team.',
    },
    {
      step: '03',
      title: 'Fieldwork & Data Collection',
      description: 'Surveys, interviews, panels, and audits executed by researchers.',
    },
    {
      step: '04',
      title: 'Analysis & Reporting',
      description: 'Insights, dashboards, and executive summaries delivered on schedule.',
    },
  ];

  const testimonials = [
    {
      quote: 'Dedicated researchers validate survey results and triangulate insights with desk research.',
      author: 'Dedicated Researcher',
      role: 'Hands-on analysis',
      company: 'Market research teams',
    },
    {
      quote: 'Quarterly trend reports keep leadership aligned on category shifts and competitor moves.',
      author: 'Quarterly Intelligence',
      role: 'Ongoing tracking',
      company: 'Category leadership',
    },
    {
      quote: 'Ad hoc requests turn into insight briefs within days, not weeks.',
      author: 'Rapid Insights',
      role: 'On-demand analysis',
      company: 'Growth teams',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Stats Section */}
      <section className="py-16 bg-gray-900 text-white rounded-2xl mb-16">
        <div className="max-w-7xl mx-auto">
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
      <section className="mb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What <span className="text-blue-600">Ask Sam</span> Does
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Market research execution that turns questions into fieldwork, insights, and board-ready reports.
          </p>
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
      </section>

      {/* Key Benefits */}
      <section className="mb-16 bg-gradient-to-b from-gray-50 to-white rounded-2xl p-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Why Companies Use <span className="text-blue-600">Ask Sam</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Research velocity, accuracy, and an expert researcher assigned to your market category.
          </p>
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
      </section>

      {/* How It Works */}
      <section className="mb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How <span className="text-blue-600">Ask Sam</span> Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A structured market research workflow that delivers insights on schedule.
          </p>
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
      </section>

      {/* Testimonials */}
      <section className="mb-16 bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Research <span className="text-blue-400">Delivery Options</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Dedicated researchers supported by the MR 360 platform for always-on market intelligence.
          </p>
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
      </section>

      {/* CTA Section */}
      <section className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Ready to Activate Market Research?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Partner with Ask Sam for researcher-led insights, rapid fieldwork, and market intelligence you can act on.
          </p>
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
      </section>
    </div>
  );
};

export default WhyUs;

