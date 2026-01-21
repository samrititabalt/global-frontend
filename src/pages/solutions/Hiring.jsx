import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Brain, ShieldCheck, Sparkles, Workflow, Users, BarChart3, CheckCircle2 } from 'lucide-react';
import Header from '../../components/public/Header';
import Footer from '../../components/public/Footer';
import AccessProButton from '../../components/solutions/AccessProButton';

const Hiring = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-slate-50 via-white to-indigo-50 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-0 w-[28rem] h-[28rem] bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-[26rem] h-[26rem] bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-4 py-2 text-sm text-indigo-600 font-semibold mb-6">
                <Sparkles className="h-4 w-4" />
                AI Agentic HRM Platform
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                WFH‑HRM powers hiring, onboarding, and HR workflows with AI.
              </h1>
              <p className="text-xl text-gray-600 max-w-xl mb-8">
                Build distributed teams faster with intelligent sourcing, automated screening, compliant onboarding, and
                unified HR operations — all in one SaaS platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <AccessProButton
                  customerProPath="/customer/hiring-pro"
                  agentProPath="/agent/hiring-pro"
                />
                <Link
                  to="/contact-us"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-all"
                >
                  Talk to an expert
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Compliant onboarding
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  AI screening & scoring
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Global workforce ready
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-3xl border border-white/80 bg-white/70 backdrop-blur shadow-2xl p-6">
                <img
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=900&h=700&fit=crop"
                  alt="WFH-HRM dashboard"
                  className="rounded-2xl w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl border border-gray-100 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">AI insights</p>
                <p className="text-lg font-semibold text-gray-900">92% faster shortlisting</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.3em] text-indigo-500 font-semibold">WFH‑HRM Platform</p>
            <h2 className="text-4xl font-bold text-gray-900 mt-3">Everything you need to hire and onboard globally</h2>
            <p className="text-lg text-gray-600 mt-4 max-w-3xl mx-auto">
              Automate every step from candidate sourcing to compliant onboarding with AI copilots, workflows,
              and realtime dashboards.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Brain, title: 'AI Candidate Intelligence', description: 'Score, rank, and shortlist talent with explainable AI recommendations.' },
              { icon: Workflow, title: 'Workflow Automation', description: 'Automate approvals, follow-ups, and onboarding tasks across teams.' },
              { icon: Users, title: 'Talent CRM', description: 'Centralize hiring pipelines, interview feedback, and candidate communications.' },
              { icon: ShieldCheck, title: 'Compliance & Security', description: 'Built-in audit trails, secure docs, and privacy-first data handling.' },
              { icon: BarChart3, title: 'Hiring Analytics', description: 'Measure time-to-hire, source quality, and pipeline conversion in real time.' },
              { icon: Sparkles, title: 'AI HR Co-Pilot', description: 'Generate offer letters, NDAs, and HR templates in seconds.' },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow"
              >
                <feature.icon className="h-10 w-10 text-indigo-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Outcomes Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl md:text-4xl font-bold mb-6">Deliver a world-class hiring experience</h3>
              <p className="text-lg text-indigo-100 mb-8">
                WFH‑HRM helps distributed teams launch faster with consistent onboarding, smart documentation,
                and employee-ready portals.
              </p>
              <div className="space-y-4 text-sm">
                {[
                  'Unified hiring and HR workspace for HR, managers, and finance.',
                  'Automated compliance checks with built-in audit trails.',
                  'Multi-tenant architecture for agencies managing multiple clients.'
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5" />
                    <p>{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <img
                src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=900&h=700&fit=crop"
                alt="Hiring workflow"
                className="rounded-2xl w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ready to launch WFH‑HRM?</h3>
          <p className="text-lg text-gray-600 mb-8">
            Start onboarding with the Access Pro Version or talk to our team for a tailored rollout plan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <AccessProButton
              customerProPath="/customer/hiring-pro"
              agentProPath="/agent/hiring-pro"
            />
            <Link
              to="/contact-us"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-all"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Hiring;

