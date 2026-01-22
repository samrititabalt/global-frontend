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
  ArrowRight,
  BarChart3,
  Clock,
  Heart
} from 'lucide-react';

const WhyUs = () => {
  const differentiators = [
    {
      icon: Users,
      title: 'Close Hard-to-Fill Roles',
      description: 'WFH-HRM workflow design plus Ask Sam recruiters deliver shortlists fast for tech, non-tech, and specialist roles.',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: Shield,
      title: 'Niche Talent Sourcing',
      description: 'Access a global talent pool and pre-vetted HR, recruitment, and operational professionals across industries.',
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: Zap,
      title: 'Staff Augmentation Pods',
      description: 'Onshore and offshore staffing options with dedicated or shared teams for immediate scale and reliable coverage.',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      icon: Award,
      title: 'HR Advisory & Documentation',
      description: 'Policies, contracts, onboarding, and compliance support aligned to 12 HR service categories and 110 subservices.',
      color: 'bg-orange-100 text-orange-600',
    },
  ];

  const benefits = [
    {
      icon: TrendingUp,
      title: 'Reduce Hiring Time',
      description: 'Move from requisition to shortlist in days, not weeks, with coordinated sourcing and screening.',
    },
    {
      icon: BarChart3,
      title: 'Lower HR Costs',
      description: 'Cut hiring costs by 40 to 70 percent while keeping quality and compliance high.',
    },
    {
      icon: Clock,
      title: 'Access Global Talent',
      description: 'Source onshore or offshore talent across UK, Europe, US, India, APAC, and LATAM.',
    },
    {
      icon: Heart,
      title: 'Scale Teams Quickly',
      description: 'Support SMEs, startups, and global teams with flexible staffing and HR expertise.',
    },
  ];

  const stats = [
    { number: '40-70%', label: 'Hiring Cost Reduction', description: 'Lower total hiring spend with shared talent pods' },
    { number: '12', label: 'HR Service Categories', description: 'End-to-end HR coverage inside WFH-HRM' },
    { number: '110', label: 'HR Subservices', description: 'From onboarding to compliance and retention' },
    { number: '10 days', label: 'Average Shortlist Time', description: 'Role intake to qualified candidates' },
  ];

  const process = [
    {
      step: '01',
      title: 'Submit HR Requirements',
      description: 'Share your role, team plan, or HR request directly in WFH-HRM.',
    },
    {
      step: '02',
      title: 'Ask Sam Analyzes Needs',
      description: 'We define the success profile, scope, and ideal sourcing strategy.',
    },
    {
      step: '03',
      title: 'Talent Sourcing Begins',
      description: 'WFH-HRM and Ask Sam source onshore or offshore talent and screen candidates.',
    },
    {
      step: '04',
      title: 'Interviews to Finalists',
      description: 'We coordinate interviews, calibrate feedback, and deliver final candidates fast.',
    },
  ];

  const testimonials = [
    {
      quote: 'Onshore resources across the UK, Europe, and US for roles that require local context and time zone coverage.',
      author: 'Onshore Resources',
      role: 'UK, Europe, US',
      company: 'Dedicated or shared teams',
    },
    {
      quote: 'Offshore delivery across India, APAC, and LATAM for 24/7 capacity and significant cost efficiencies.',
      author: 'Offshore Resources',
      role: 'India, APAC, LATAM',
      company: 'Scalable hiring pods',
    },
    {
      quote: 'Flexible staffing across HR, recruitment, admin, finance, and operations with up to 70 percent savings.',
      author: 'Staff Augmentation',
      role: 'Dedicated or shared',
      company: '40-70% lower costs',
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
            Strategic HR and hiring support that turns requirements into qualified candidates and compliant HR workflows.
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
            Benefit-driven hiring outcomes powered by WFH-HRM and a global talent network.
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
            A clear, fast hiring and HR workflow that brings you qualified candidates quickly.
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
            Staff <span className="text-blue-400">Augmentation Options</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Flexible onshore and offshore delivery models built for cost, speed, and quality.
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
            Ready to Build Your HR Advantage?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Partner with Ask Sam for hiring velocity, compliant HR support, and access to WFH-HRM's 12 service categories and 110 subservices.
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

