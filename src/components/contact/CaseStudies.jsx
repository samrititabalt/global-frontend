import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Users,
  ShieldCheck,
  Rocket,
  Clock,
  HeartHandshake,
  Laptop,
  Globe,
  ChevronDown
} from 'lucide-react';

const CaseStudies = () => {
  const [expandedStudy, setExpandedStudy] = useState(null);

  const caseStudies = [
    {
      company: 'NovaPulse (Anonymized)',
      industry: 'Retail',
      challenge: 'Large-scale data collection across 12 UK regions to understand shopper behavior.',
      subservices: [
        'Qualitative surveys',
        'Quantitative surveys',
        'Online panels',
        'Phone interviews',
        'Mystery shopping'
      ],
      wfhHrmSolution: 'MR 360 orchestrated fieldwork, sample quotas, and survey logic in one platform.',
      askSamImpact: 'Ask Sam researchers executed interviews, validated responses, and cleaned the dataset.',
      outcomes: [
        { metric: '18k', label: 'Responses captured' },
        { metric: '4 weeks', label: 'Fieldwork window' },
        { metric: '12', label: 'Regions covered' },
        { metric: '96%', label: 'Data quality score' }
      ],
      quote: 'We finally had reliable, large-scale shopper data in one quarter.',
      summary: 'Nationwide data collection delivered with high-quality response validation.',
      icon: Rocket
    },
    {
      company: 'BlueHarbor Health',
      industry: 'Healthcare',
      challenge: 'Multi-country qualitative and quantitative study to understand patient preferences.',
      subservices: [
        'Qualitative surveys',
        'Quantitative surveys',
        'Consumer interviews',
        'Category deep dives'
      ],
      wfhHrmSolution: 'MR 360 managed multi-market survey rollout and centralized reporting.',
      askSamImpact: 'Ask Sam analysts handled interview guides, transcription, and insight synthesis.',
      outcomes: [
        { metric: '6 markets', label: 'Countries covered' },
        { metric: '2,400', label: 'Participants' },
        { metric: '3 weeks', label: 'Insight delivery' },
        { metric: '8', label: 'Segments mapped' }
      ],
      quote: 'We turned complex patient feedback into a clear roadmap.',
      summary: 'Multi-country insights powered a patient-centered product strategy.',
      icon: Users
    },
    {
      company: 'CipherView',
      industry: 'Fintech',
      challenge: 'Always-on competitor intelligence and category insights for a fast-moving market.',
      subservices: [
        'Competitor analysis',
        'Trend reports',
        'Category insights',
        'Quarterly sector updates'
      ],
      wfhHrmSolution: 'MR 360 delivered competitor tracking dashboards and quarterly briefings.',
      askSamImpact: 'Ask Sam researchers monitored market signals and drafted executive summaries.',
      outcomes: [
        { metric: '15', label: 'Competitors tracked' },
        { metric: '4', label: 'Quarterly reports' },
        { metric: '20%', label: 'Faster strategy cycles' },
        { metric: '1 hub', label: 'Unified intelligence' }
      ],
      quote: 'We finally had a clear competitor pulse every quarter.',
      summary: 'Continuous intelligence supported strategic positioning updates.',
      icon: ShieldCheck
    },
    {
      company: 'BrightShelf',
      industry: 'CPG',
      challenge: 'Tracking new product launches and performance across retail channels.',
      subservices: [
        'Product performance summaries',
        'Retail audits',
        'Consumer interviews',
        'Trend tracking'
      ],
      wfhHrmSolution: 'MR 360 consolidated launch data, pricing, and distribution metrics.',
      askSamImpact: 'Ask Sam conducted audits and competitor benchmarking in-store.',
      outcomes: [
        { metric: '32', label: 'Launches tracked' },
        { metric: '5', label: 'Retail channels' },
        { metric: '6 weeks', label: 'Launch insights' },
        { metric: '12%', label: 'Forecast accuracy lift' }
      ],
      quote: 'Launch tracking became measurable and actionable.',
      summary: 'Product launch performance visibility across channels.',
      icon: Briefcase
    },
    {
      company: 'UrbanCart',
      industry: 'Retail & Logistics',
      challenge: 'Capturing shopper insights and execution quality through mystery shopping.',
      subservices: [
        'Mystery shopping',
        'Retail audits',
        'Shopper insights',
        'Phone interviews'
      ],
      wfhHrmSolution: 'MR 360 structured the mystery shopping program and aggregated findings.',
      askSamImpact: 'Ask Sam researchers executed visits and compiled insight summaries.',
      outcomes: [
        { metric: '120', label: 'Store visits' },
        { metric: '4.6/5', label: 'Service score' },
        { metric: '18%', label: 'Experience uplift' },
        { metric: '30 days', label: 'Program cycle' }
      ],
      quote: 'We now know exactly what happens in-store.',
      summary: 'Shopper insights improved service consistency and conversion.',
      icon: HeartHandshake
    },
    {
      company: 'Atlas Mobility',
      industry: 'Automotive',
      challenge: 'Market sizing and forecasting for a new EV category launch.',
      subservices: [
        'Market research reports',
        'Trend reports',
        'Category insights',
        'SWOT analysis'
      ],
      wfhHrmSolution: 'MR 360 modeled market size, growth forecasts, and category shifts.',
      askSamImpact: 'Ask Sam analysts validated assumptions and drafted investor-ready summaries.',
      outcomes: [
        { metric: '5-year', label: 'Forecast built' },
        { metric: '3', label: 'Scenarios modeled' },
        { metric: '40%', label: 'Faster planning' },
        { metric: '1', label: 'Go-to-market roadmap' }
      ],
      quote: 'Forecasting became a board-level strength.',
      summary: 'Market sizing and outlook guided launch strategy.',
      icon: Laptop
    },
    {
      company: 'EcoGrid Energy',
      industry: 'Energy',
      challenge: 'End-to-end market research program with ongoing ad hoc insights.',
      subservices: [
        'Market research reports',
        'Ad hoc research',
        'Competitor analysis',
        'Quarterly sector updates'
      ],
      wfhHrmSolution: 'MR 360 centralized insights, reporting cadence, and trend monitoring.',
      askSamImpact: 'Ask Sam researchers handled rapid requests and analyst briefings.',
      outcomes: [
        { metric: '12', label: 'Insight briefs/year' },
        { metric: '4', label: 'Quarterly packs' },
        { metric: '2 wks', label: 'Average turnaround' },
        { metric: '1 team', label: 'Dedicated researchers' }
      ],
      quote: 'We finally had a research engine that never stops.',
      summary: 'Always-on market intelligence and rapid research support.',
      icon: Clock
    },
    {
      company: 'PulseWare',
      industry: 'SaaS',
      challenge: 'Ad hoc research support for investor updates and strategy planning.',
      subservices: [
        'Rapid insight generation',
        'Desk research',
        'Analyst support',
        'One-off deep dives'
      ],
      wfhHrmSolution: 'MR 360 captured research requests and delivered structured briefs.',
      askSamImpact: 'Ask Sam analysts executed deep dives and summarized findings.',
      outcomes: [
        { metric: '14', label: 'Insight briefs' },
        { metric: '72 hrs', label: 'Fastest delivery' },
        { metric: '8', label: 'Deep dives' },
        { metric: '100%', label: 'On-time delivery' }
      ],
      quote: 'We now have analyst support on demand.',
      summary: 'Rapid research enabled faster leadership decisions.',
      icon: ShieldCheck
    },
    {
      company: 'Lush',
      industry: 'Beauty & Personal Care',
      challenge: 'Quarterly category insights and consumer trend tracking across EMEA.',
      subservices: [
        'Category insights',
        'Quarterly sector updates',
        'Consumer insights',
        'Trend reports'
      ],
      wfhHrmSolution: 'MR 360 delivered quarterly insight decks and competitive tracking.',
      askSamImpact: 'Ask Sam researchers validated findings with expert interviews.',
      outcomes: [
        { metric: '4', label: 'Quarterly reports' },
        { metric: '6', label: 'Markets tracked' },
        { metric: '28', label: 'Consumer signals' },
        { metric: '92%', label: 'Stakeholder satisfaction' }
      ],
      quote: 'Our category decisions are now backed by evidence, not instinct.',
      summary: 'Ongoing consumer and category intelligence across key markets.',
      icon: Globe
    },
  ];

  const mrServiceCoverage = [
    { name: 'Data Collection & Fieldwork Support', detail: 'Qualitative + quantitative surveys, panels, interviews' },
    { name: 'Market Research Reporting & Insights', detail: 'Category deep dives, quarterly insight packs' },
    { name: 'Ad Hoc Research & Analyst Support', detail: 'Rapid insight briefs and desk research' },
    { name: 'Competitor & Category Intelligence', detail: 'Monitoring moves, pricing, and category shifts' },
    { name: 'Consumer & Shopper Insights', detail: 'Attitudes, preferences, and behavior tracking' },
    { name: 'Mystery Shopping Programs', detail: 'In-store and online experience audits' },
    { name: 'Trend Tracking', detail: 'Quarterly trends and market shifts' },
    { name: 'Market Sizing & Forecasting', detail: 'Scenario planning and outlook modeling' },
    { name: 'Product Launch Tracking', detail: 'Performance summaries and launch diagnostics' },
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
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">How MR 360 helped</h4>
                    <p className="text-sm text-gray-600">{study.wfhHrmSolution}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Ask Sam research support</h4>
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
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Full market research coverage</h3>
            <p className="text-gray-600">
              MR 360 + Ask Sam deliver data collection, reporting, and on-demand research across industries.
            </p>
          </div>
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold">
            End-to-end MR services
          </span>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mrServiceCoverage.map((service) => (
            <div key={service.name} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <p className="font-semibold text-gray-900">{service.name}</p>
              <p className="text-xs text-gray-500 mt-1">
                {service.detail}
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
          Let our researchers and Ask Sam analysts build your next market research success story.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/contact-us"
            className="inline-flex items-center justify-center bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
          >
            Talk to our research team
          </Link>
          <Link
            to="/market-research-360"
            className="inline-flex items-center justify-center bg-transparent text-white px-8 py-4 rounded-lg font-semibold text-lg border border-white/40 hover:bg-white/10 transition-all"
          >
            Explore MR 360
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default CaseStudies;

