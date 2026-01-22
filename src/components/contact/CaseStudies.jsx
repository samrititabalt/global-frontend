import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Users,
  ShieldCheck,
  Rocket,
  BarChart3,
  Clock,
  HeartHandshake,
  Laptop,
  Globe,
  ChevronDown
} from 'lucide-react';
import hrServices from '../../data/hrServices';

const CaseStudies = () => {
  const [expandedStudy, setExpandedStudy] = useState(null);

  const caseStudies = [
    {
      company: 'NovaFin (Anonymized)',
      industry: 'Fintech',
      challenge: 'Scaling HR for a 20-person startup while preparing for rapid growth after seed funding.',
      subservices: [
        'HR function setup from scratch',
        'Role & responsibility definition',
        'Headcount & hiring plan',
        'Offer letter templates'
      ],
      wfhHrmSolution: 'WFH-HRM centralized HR policies, hiring plans, and templates to get the team hiring-ready in under three weeks.',
      askSamImpact: 'Ask Sam agents sourced early pipelines and coordinated interviews so founders stayed focused on product.',
      outcomes: [
        { metric: '3 weeks', label: 'Time to HR setup' },
        { metric: '18 roles', label: 'Pipeline built' },
        { metric: '40%', label: 'Faster hiring cycle' },
        { metric: '0', label: 'Compliance gaps' }
      ],
      quote: 'WFH‑HRM gave us structure overnight, and Ask Sam kept the hiring machine running.',
      summary: 'A full HR foundation built before the first growth sprint, enabling confident hiring.',
      icon: Rocket
    },
    {
      company: 'CipherLab',
      industry: 'B2B SaaS',
      challenge: 'Closing five hard-to-fill engineering roles within three weeks.',
      subservices: [
        'Resume sourcing',
        'Interview coordination',
        'Candidate screening',
        'Offer negotiation & closure'
      ],
      wfhHrmSolution: 'WFH-HRM structured the hiring workflow, automated scheduling, and created role-specific scorecards.',
      askSamImpact: 'Ask Sam handled candidate outreach and follow-ups, keeping the funnel active 7 days a week.',
      outcomes: [
        { metric: '5 roles', label: 'Closed in 3 weeks' },
        { metric: '72 hrs', label: 'Average time-to-screen' },
        { metric: '2x', label: 'Interview throughput' },
        { metric: '92%', label: 'Offer acceptance rate' }
      ],
      quote: 'Ask Sam kept our pipeline warm while WFH‑HRM delivered the hiring engine.',
      summary: 'Accelerated hiring velocity without expanding internal HR headcount.',
      icon: Users
    },
    {
      company: 'CloudLedger',
      industry: 'Remote-first SaaS',
      challenge: 'Payroll compliance overhaul across US, UK, and India with inconsistent salary structures.',
      subservices: [
        'Monthly payroll processing',
        'Salary structuring',
        'PF, ESIC, PT compliance',
        'Payroll audits'
      ],
      wfhHrmSolution: 'WFH-HRM standardized payroll workflows, compliance calendars, and audit trails.',
      askSamImpact: 'Ask Sam agents verified documentation, validated payroll runs, and resolved employee queries.',
      outcomes: [
        { metric: '30 days', label: 'Compliance alignment' },
        { metric: '98%', label: 'Payroll accuracy' },
        { metric: '45%', label: 'Time saved monthly' },
        { metric: '0', label: 'Penalty notices' }
      ],
      quote: 'We went from chaos to compliance in one payroll cycle.',
      summary: 'Global payroll compliance achieved with automated controls and support.',
      icon: ShieldCheck
    },
    {
      company: 'BrightLane',
      industry: 'SaaS',
      challenge: 'Creating HR policies and employment contracts for a newly funded company.',
      subservices: [
        'HR policy handbook creation',
        'Employment contract drafting',
        'Basic HR compliance setup',
        'Org chart creation'
      ],
      wfhHrmSolution: 'WFH-HRM delivered policy templates, compliant contracts, and org structure guidance.',
      askSamImpact: 'Ask Sam coordinated legal reviews and ensured all hires had signed documentation before start dates.',
      outcomes: [
        { metric: '2 weeks', label: 'Policy rollout' },
        { metric: '100%', label: 'Signed contract coverage' },
        { metric: '35%', label: 'Faster onboarding' },
        { metric: '0', label: 'Policy gaps' }
      ],
      quote: 'We launched policies in record time and stayed investor-ready.',
      summary: 'An HR compliance foundation that supported rapid expansion.',
      icon: Briefcase
    },
    {
      company: 'PulseCart',
      industry: 'E-commerce',
      challenge: 'Reducing attrition and improving engagement across a 120-person team.',
      subservices: [
        'Engagement surveys (simple & quick)',
        'Recognition & reward programs',
        'Wellness initiatives',
        'Retention strategy design'
      ],
      wfhHrmSolution: 'WFH-HRM unified engagement tracking, feedback loops, and retention dashboards.',
      askSamImpact: 'Ask Sam ran pulse survey follow-ups and coordinated recognition programs.',
      outcomes: [
        { metric: '22%', label: 'Attrition reduction' },
        { metric: '3x', label: 'Engagement participation' },
        { metric: '18%', label: 'eNPS uplift' },
        { metric: '60 days', label: 'Retention turnaround' }
      ],
      quote: 'Engagement became measurable and actionable within a month.',
      summary: 'Higher retention driven by continuous engagement and recognition.',
      icon: HeartHandshake
    },
    {
      company: 'VertexWorks',
      industry: 'Hybrid Tech',
      challenge: 'Setting up an HR tech stack and automation for a 200-person hybrid workforce.',
      subservices: [
        'HRMS selection & setup',
        'Attendance tool integration',
        'HR process automation',
        'HR dashboards & reports'
      ],
      wfhHrmSolution: 'WFH-HRM integrated HRMS, attendance, and analytics into a single workflow.',
      askSamImpact: 'Ask Sam supported data migration, SOP rollout, and employee training.',
      outcomes: [
        { metric: '45 days', label: 'Tech stack rollout' },
        { metric: '60%', label: 'Manual task reduction' },
        { metric: '90%', label: 'Self-service adoption' },
        { metric: '1 hub', label: 'Unified HR reporting' }
      ],
      quote: 'Our HR ops went from spreadsheet chaos to automated clarity.',
      summary: 'A modern HR tech backbone with measurable efficiency gains.',
      icon: Laptop
    },
    {
      company: 'Shopora',
      industry: 'Retail & Logistics',
      challenge: 'Managing onboarding and exits for a fast-growing operations team.',
      subservices: [
        'New hire onboarding checklist',
        'Documentation & compliance collection',
        'Exit interviews',
        'Full & final settlement coordination'
      ],
      wfhHrmSolution: 'WFH-HRM standardized onboarding, documentation flows, and exit protocols.',
      askSamImpact: 'Ask Sam coordinated paperwork, scheduling, and knowledge handover plans.',
      outcomes: [
        { metric: '50%', label: 'Faster onboarding' },
        { metric: '100%', label: 'Document compliance' },
        { metric: '28%', label: 'Reduced exit delays' },
        { metric: '4.7/5', label: 'New hire satisfaction' }
      ],
      quote: 'Onboarding and exits finally feel seamless and consistent.',
      summary: 'Operational continuity protected during rapid hiring and offboarding.',
      icon: Clock
    },
    {
      company: 'HelixCare',
      industry: 'Healthcare Services',
      challenge: 'Mitigating legal and compliance risk during rapid expansion.',
      subservices: [
        'Labor law compliance management',
        'Compliance calendar creation',
        'Policy audits',
        'Employment law advisory'
      ],
      wfhHrmSolution: 'WFH-HRM delivered a compliance calendar, audit-ready documentation, and policy updates.',
      askSamImpact: 'Ask Sam managed audit logistics and coordinated with external legal advisors.',
      outcomes: [
        { metric: '0', label: 'Compliance penalties' },
        { metric: '35%', label: 'Audit prep time reduced' },
        { metric: '100%', label: 'Policy coverage' },
        { metric: '4 audits', label: 'Cleared successfully' }
      ],
      quote: 'We passed every audit with confidence.',
      summary: 'Legal risk reduced with proactive compliance operations.',
      icon: ShieldCheck
    },
    {
      company: 'GlobalAid',
      industry: 'NGO',
      challenge: 'Providing HR leadership for a distributed nonprofit without hiring a full-time team.',
      subservices: [
        'Virtual HR manager services',
        'HR advisory for founders',
        'Culture building for growing teams',
        'HR SOP documentation'
      ],
      wfhHrmSolution: 'WFH-HRM enabled a virtual HR desk with policies, SOPs, and culture initiatives.',
      askSamImpact: 'Ask Sam coordinated regional hiring and managed HR communications across time zones.',
      outcomes: [
        { metric: '6 regions', label: 'HR coverage' },
        { metric: '30%', label: 'Lower HR costs' },
        { metric: '25%', label: 'Faster hiring' },
        { metric: '5.0', label: 'Leadership satisfaction' }
      ],
      quote: 'We gained a full HR function without the overhead.',
      summary: 'Scalable HR leadership delivered through a virtual model.',
      icon: Globe
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {caseStudies.map((study, index) => {
          const Icon = study.icon;
          const isExpanded = expandedStudy === study.company;
          return (
            <motion.div
              key={study.company}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setExpandedStudy(isExpanded ? null : study.company)}
                className="w-full text-left p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{study.company}</h3>
                      <p className="text-sm text-gray-500">{study.industry}</p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-4">{study.challenge}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {study.subservices.slice(0, 2).map((sub) => (
                    <span key={sub} className="px-3 py-1 rounded-full bg-gray-100 text-xs text-gray-700">
                      {sub}
                    </span>
                  ))}
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-xs text-blue-700">
                    +{study.subservices.length - 2} more
                  </span>
                </div>
              </button>
              {isExpanded && (
                <div className="border-t border-gray-200 px-6 pb-6 pt-4 space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Subservices used</h4>
                    <div className="flex flex-wrap gap-2">
                      {study.subservices.map((sub) => (
                        <span key={sub} className="px-3 py-1 rounded-full bg-gray-100 text-xs text-gray-700">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">How WFH-HRM helped</h4>
                    <p className="text-sm text-gray-600">{study.wfhHrmSolution}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Ask Sam acceleration</h4>
                    <p className="text-sm text-gray-600">{study.askSamImpact}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Outcomes</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {study.outcomes.map((result) => (
                        <div key={result.label} className="bg-gradient-to-br from-blue-50 to-gray-50 rounded-xl p-4 text-center">
                          <div className="text-xl font-bold text-blue-600">{result.metric}</div>
                          <div className="text-xs text-gray-600 mt-1">{result.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-gray-900 text-white rounded-xl p-4">
                    <p className="text-sm italic">"{study.quote}"</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Impact summary</h4>
                    <p className="text-sm text-gray-600">{study.summary}</p>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <section className="mt-16 bg-white/80 border border-gray-200 rounded-3xl p-8 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Full HR capability coverage</h3>
            <p className="text-gray-600">
              WFH-HRM delivers 12 HR service categories with 110 subservices tailored to every stage of growth.
            </p>
          </div>
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold">
            110 subservices in total
          </span>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hrServices.map((service) => (
            <div key={service.name} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <p className="font-semibold text-gray-900">{service.name}</p>
              <p className="text-xs text-gray-500 mt-1">
                {service.subServices.length} sub-services
              </p>
            </div>
          ))}
        </div>
      </section>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mt-16 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-12 text-center text-white"
      >
        <h3 className="text-3xl font-bold mb-4">Want results like these?</h3>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Let our HR experts and Ask Sam agents build your next hiring success story.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/contact-us"
            className="inline-flex items-center justify-center bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
          >
            Talk to our HR team
          </Link>
          <Link
            to="/solutions/hiring"
            className="inline-flex items-center justify-center bg-transparent text-white px-8 py-4 rounded-lg font-semibold text-lg border border-white/40 hover:bg-white/10 transition-all"
          >
            Explore WFH-HRM
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default CaseStudies;

