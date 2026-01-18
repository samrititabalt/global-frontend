import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Users, Shield, Zap, Headphones, BarChart3, Globe } from 'lucide-react';
import Header from '../components/public/Header';
import Footer from '../components/public/Footer';
import LiveChatBot from '../components/public/LiveChatBot';
import HeroVideoSection from '../components/public/HeroVideoSection';
import EditableContent from '../components/admin/EditableContent';
import { usePageContent, getBlockContent } from '../hooks/usePageContent';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const isAdministrator = isAuthenticated && user?.role === 'admin';
  const { content: pageContent } = usePageContent();
  const getHome = (key, fallback) => getBlockContent(pageContent, key) || fallback;
  
  // Get editable content for hero section
  const heroHeading = getBlockContent(pageContent, 'home-hero-heading') || 'Transform Your Business Operations';
  const heroDescription = getBlockContent(pageContent, 'home-hero-description') || 'Get a complete operations organization, not just individual agents. Every team includes trainers, QA analysts, and managers.';

  const features = [
    {
      icon: Users,
      title: 'Dedicated Teams',
      titleKey: 'home-feature-1-title',
      description: 'Get a complete operations organization, not just individual agents. Every team includes trainers, QA analysts, and managers.',
      descriptionKey: 'home-feature-1-description',
    },
    {
      icon: Shield,
      title: 'Brand Protection',
      titleKey: 'home-feature-2-title',
      description: 'Maintain your brand voice while scaling. Our teams are trained to represent your company authentically.',
      descriptionKey: 'home-feature-2-description',
    },
    {
      icon: Zap,
      title: 'Rapid Scaling',
      titleKey: 'home-feature-3-title',
      description: 'Scale your operations quickly without compromising quality. Launch new teams in weeks, not months.',
      descriptionKey: 'home-feature-3-description',
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      titleKey: 'home-feature-4-title',
      description: 'Round-the-clock customer service across multiple time zones. Never miss a customer interaction.',
      descriptionKey: 'home-feature-4-description',
    },
    {
      icon: BarChart3,
      title: 'Data-Driven',
      titleKey: 'home-feature-5-title',
      description: 'Real-time analytics and insights to optimize your customer experience and business performance.',
      descriptionKey: 'home-feature-5-description',
    },
    {
      icon: Globe,
      title: 'Global Reach',
      titleKey: 'home-feature-6-title',
      description: 'Teams located in strategic regions to serve your customers wherever they are in the world.',
      descriptionKey: 'home-feature-6-description',
    },
  ];

  const stats = [
    { number: '80%', label: 'ROI Increase', numberKey: 'home-stat-1-number', labelKey: 'home-stat-1-label' },
    { number: '50%', label: 'Cost Savings', numberKey: 'home-stat-2-number', labelKey: 'home-stat-2-label' },
    { number: '2200+', label: 'Team Members', numberKey: 'home-stat-3-number', labelKey: 'home-stat-3-label' },
    { number: '100+', label: 'Clients Served', numberKey: 'home-stat-4-number', labelKey: 'home-stat-4-label' },
  ];

  const bottomNavLinks = [
    { label: 'Home', to: '/' },
    { label: 'About Us', to: '/about-us' },
    { label: 'Ask Sam', to: '/ask-sam' },
    { label: 'Case Studies', to: '/case-studies' },
    { label: 'Contact Us', to: '/contact-us' },
    { label: 'Customer Login', to: '/customer/login' },
  ];
  if (isAdministrator) {
    bottomNavLinks.push(
      { label: 'Industry', to: '/industry' },
      { label: 'Services', to: '/services' },
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'transparent' }}>
      <Header />
      
      {/* 
        ============================================
        CRITICAL: HERO VIDEO SECTION
        ============================================
        DO NOT REPLACE <HeroVideoSection /> WITH INLINE VIDEO CODE
        DO NOT MODIFY OR DELETE THIS COMPONENT IMPORT
        The video is stored in Cloudinary and fetched via API
        See: global-frontend/src/components/public/HeroVideoSection.jsx
        ============================================
      */}
      <HeroVideoSection />
      
      {/* Hero Section - Template background starts here after video */}
      <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden bg-white bg-gradient-to-b from-gray-50 to-white">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 left-0 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 right-20 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
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
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <EditableContent
                  blockId="home-main-heading"
                  blockType="heading"
                  tag="h1"
                  className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight tracking-tight"
                >
                  {getBlockContent(pageContent, 'home-main-heading') || 'Premier Outsourcing.\nScale without losing\nyour brand\'s voice.'}
                </EditableContent>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <EditableContent
                  blockId="home-main-description"
                  blockType="paragraph"
                  tag="p"
                  className="text-xl text-gray-600 mb-8 max-w-2xl leading-relaxed"
                >
                  {getBlockContent(pageContent, 'home-main-description') || 'Premium outsourcing services that help UK businesses & individuals scale without losing their identity.'}
                </EditableContent>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link
                  to="/why-us"
                  className="inline-flex items-center justify-center bg-gray-900 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-gray-300"
                >
                  <EditableContent
                    blockId="home-hero-learn-more"
                    blockType="text"
                    tag="span"
                  >
                    {getHome('home-hero-learn-more', 'Learn More')}
                  </EditableContent>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/customer/signup"
                  className="inline-flex items-center justify-center bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg border-2 border-gray-300 hover:border-gray-400 transition-all focus:outline-none focus:ring-4 focus:ring-gray-200"
                >
                  <EditableContent
                    blockId="home-hero-get-started"
                    blockType="text"
                    tag="span"
                  >
                    {getHome('home-hero-get-started', 'Get Started')}
                  </EditableContent>
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
                  alt="Team collaboration"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center relative"
              >
                {index < stats.length - 1 && (
                  <div className="hidden md:block absolute right-0 top-1/2 transform -translate-y-1/2 w-px h-16 bg-gray-700"></div>
                )}
                <div className="text-5xl md:text-6xl font-bold mb-2">
                  <EditableContent
                    blockId={stat.numberKey}
                    blockType="text"
                    tag="span"
                  >
                    {getHome(stat.numberKey, stat.number)}
                  </EditableContent>
                </div>
                <div className="text-lg text-gray-300">
                  <EditableContent
                    blockId={stat.labelKey}
                    blockType="text"
                    tag="span"
                  >
                    {getHome(stat.labelKey, stat.label)}
                  </EditableContent>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <EditableContent
              blockId="home-features-heading"
              blockType="heading"
              tag="h2"
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            >
              {getBlockContent(pageContent, 'home-features-heading') || 'Why Choose Us'}
            </EditableContent>
            <EditableContent
              blockId="home-features-description"
              blockType="paragraph"
              tag="p"
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              {getBlockContent(pageContent, 'home-features-description') || 'The secret to our success is our people. Our dedicated team of professionals is at the heart of everything we do.'}
            </EditableContent>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <EditableContent
                    blockId={feature.titleKey}
                    blockType="heading"
                    tag="h3"
                    className="text-xl font-bold text-gray-900 mb-4"
                  >
                    {getHome(feature.titleKey, feature.title)}
                  </EditableContent>
                  <EditableContent
                    blockId={feature.descriptionKey}
                    blockType="paragraph"
                    tag="p"
                    className="text-gray-600 leading-relaxed"
                  >
                    {getHome(feature.descriptionKey, feature.description)}
                  </EditableContent>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <EditableContent
              blockId="home-cta-title"
              blockType="heading"
              tag="h2"
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
            >
              {getHome('home-cta-title', 'Ready to scale your business?')}
            </EditableContent>
            <EditableContent
              blockId="home-cta-description"
              blockType="paragraph"
              tag="p"
              className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed max-w-3xl mx-auto"
            >
              {getHome('home-cta-description', 'Choose an automation solution that boosts your efficiency, fuels company growth with top-notch performance, and scales your business with high conversion rates. All at lower costs.')}
            </EditableContent>
            <EditableContent
              blockId="home-cta-note"
              blockType="paragraph"
              tag="p"
              className="text-lg text-gray-400 mb-10"
            >
              {getHome('home-cta-note', 'Quality results at a better value — 80% ROI increase and save 50% compared to in-house teams.')}
            </EditableContent>
            <Link
              to="/contact-us"
              className="inline-flex items-center justify-center bg-white text-gray-900 px-10 py-5 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all shadow-2xl hover:shadow-3xl focus:outline-none focus:ring-4 focus:ring-white/50"
            >
              <EditableContent
                blockId="home-cta-button"
                blockType="text"
                tag="span"
              >
                {getHome('home-cta-button', "Let's Talk!")}
              </EditableContent>
              <ArrowRight className="ml-2 h-6 w-6" />
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-6 py-6 text-sm font-semibold text-gray-700">
            {bottomNavLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="transition-colors hover:text-gray-900"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <LiveChatBot />
    </div>
  );
};

export default Home;

