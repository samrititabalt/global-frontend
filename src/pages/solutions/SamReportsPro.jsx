import React, { useMemo, useState } from 'react';
import { FileText, Building2, MapPin, TrendingUp, Sparkles, FileDown } from 'lucide-react';
import Header from '../../components/public/Header';
import Footer from '../../components/public/Footer';

const INDUSTRIES = [
  'Aerospace & Defense', 'Agriculture', 'Alternative Energy', 'Apparel & Fashion',
  'Automotive', 'Banking', 'Biotechnology', 'Chemicals', 'Cloud Computing',
  'Construction', 'Consumer Electronics', 'Consumer Goods', 'Cybersecurity',
  'Data Centers', 'Education', 'Energy & Utilities', 'Entertainment & Media',
  'Environmental Services', 'FinTech', 'Food & Beverage', 'Forestry & Paper',
  'Gaming', 'Healthcare', 'Hospitality', 'Industrial Manufacturing',
  'Insurance', 'Logistics', 'Luxury Goods', 'Maritime', 'Metals & Mining',
  'Mobility', 'Oil & Gas', 'Payments', 'Pharmaceuticals', 'Professional Services',
  'Real Estate', 'Renewables', 'Retail', 'Robotics', 'Semiconductors',
  'Smart Cities', 'Software', 'Sports & Fitness', 'Telecommunications',
  'Travel', 'Transportation', 'Venture Capital', 'Waste Management',
  'Water & Sanitation', 'Wholesale & Distribution', 'E-commerce',
  'Digital Marketing', 'HR & Talent', 'Legal Services', 'Public Sector',
  'Supply Chain', 'Space Tech', 'Defense Tech', 'Agritech', 'MedTech'
];

const SECTOR_MAP = {
  'Aerospace & Defense': ['Commercial Aviation', 'Defense Systems', 'Space Systems', 'Maintenance & Services'],
  'Automotive': ['OEMs', 'EV Platforms', 'Auto Parts', 'Aftermarket Services'],
  'Banking': ['Retail Banking', 'Corporate Banking', 'Wealth Management', 'Digital Banking'],
  'Healthcare': ['Hospitals', 'Diagnostics', 'Digital Health', 'Medical Devices'],
  'Retail': ['Grocery', 'Specialty Retail', 'Luxury Retail', 'Online Marketplaces'],
  'Energy & Utilities': ['Power Generation', 'Grid Infrastructure', 'Smart Meters', 'Energy Trading'],
  'Technology': ['SaaS Platforms', 'IT Services', 'AI & Automation', 'Developer Tools']
};

const REGIONS = [
  'North America', 'Europe', 'United Kingdom', 'Middle East', 'Africa',
  'Asia Pacific', 'South Asia', 'Latin America', 'Nordics', 'Global'
];

const SamReportsPro = () => {
  const [industry, setIndustry] = useState('');
  const [sector, setSector] = useState('');
  const [yearRange, setYearRange] = useState('2026 (Current)');
  const [industryReport, setIndustryReport] = useState(null);

  const [companyName, setCompanyName] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('');
  const [companySector, setCompanySector] = useState('');
  const [companyRegion, setCompanyRegion] = useState('');
  const [suggestedCompanies, setSuggestedCompanies] = useState([]);
  const [companyProfile, setCompanyProfile] = useState(null);

  const sectors = useMemo(() => {
    if (!industry) return [];
    return SECTOR_MAP[industry] || ['Core Segment', 'Adjacent Segment', 'Emerging Segment', 'Services & Enablement'];
  }, [industry]);

  const handleGenerateIndustryReport = () => {
    if (!industry || !sector || !yearRange) return;
    setIndustryReport({
      overview: `${industry} is entering a consolidation cycle with scaled operators prioritising margin resilience.`,
      sectorInsights: `${sector} activity is led by platform modernization and demand for efficiency gains.`,
      keyTrends: [
        'AI-driven cost optimisation',
        'Shift to subscription-based models',
        'Regional capacity rebalancing'
      ],
      marketDrivers: ['Digital adoption', 'Regulatory mandates', 'Supply chain redesign'],
      challenges: ['Margin pressure', 'Talent scarcity', 'Fragmented regulation'],
      opportunities: ['Adjacency expansion', 'Cross-border partnerships', 'Vertical integration'],
      forecast: `2025-2030 outlook indicates steady growth with mid-single digit CAGR and selective breakout niches.`
    });
  };

  const handleSuggestCompanies = () => {
    if (!companyIndustry || !companySector || !companyRegion) return;
    const base = companyIndustry.split(' ')[0] || 'Growth';
    setSuggestedCompanies([
      { name: `${base} Horizon Labs`, summary: 'AI-enabled market intelligence platform.', why: 'Transforms decision speed across sectors.' },
      { name: `${base} Pulse Systems`, summary: 'Operational optimisation suite for enterprise teams.', why: 'Delivers measurable productivity gains.' },
      { name: `${base} Vertex Analytics`, summary: 'Sector benchmarking and competitive monitoring.', why: 'Raises visibility into market shifts.' },
      { name: `${base} Nova Markets`, summary: 'Next-gen distribution and demand sensing.', why: 'Improves revenue resilience.' },
      { name: `${base} Catalyst Partners`, summary: 'Strategic transformation advisory network.', why: 'Enables rapid scale and adoption.' }
    ]);
  };

  const handleGenerateCompanyProfile = () => {
    const name = companyName || suggestedCompanies[0]?.name;
    if (!name) return;
    setCompanyProfile({
      name,
      overview: `${name} operates at the intersection of ${companyIndustry || industry || 'core'} and ${companySector || sector || 'adjacent'} markets.`,
      model: 'Platform-led strategy combining proprietary data assets with subscription revenue.',
      financials: 'Estimated ARR growth 18-24% with strong gross margin expansion.',
      priorities: ['Scale enterprise adoption', 'Strengthen partner ecosystems', 'Invest in automation'],
      positioning: 'Differentiated by speed-to-insight and vertically integrated workflows.',
      swot: {
        strengths: ['Data depth', 'Sticky enterprise contracts'],
        weaknesses: ['High onboarding complexity'],
        opportunities: ['International expansion', 'Verticalised bundles'],
        threats: ['Well-capitalised incumbents', 'Regulatory shifts']
      },
      outlook: 'Well-positioned to capture consolidation benefits over the next 24 months.'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="bg-gradient-to-r from-slate-900 to-blue-700 text-white rounded-2xl p-8 shadow-xl">
            <h1 className="text-4xl font-bold mb-2">Sam Reports Pro</h1>
            <p className="text-lg text-blue-100">
              Mock interface for syndicated reports, sector intelligence, and company profiling.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Industry & Sector Reports</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Industry</label>
                  <select
                    value={industry}
                    onChange={(e) => {
                      setIndustry(e.target.value);
                      setSector('');
                    }}
                    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2"
                  >
                    <option value="">Select industry</option>
                    {INDUSTRIES.map(item => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">Sector</label>
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2"
                    disabled={!industry}
                  >
                    <option value="">Select sector</option>
                    {sectors.map(item => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">Year Selection</label>
                  <select
                    value={yearRange}
                    onChange={(e) => setYearRange(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2"
                  >
                    <option value="2026 (Current)">2026 (Current)</option>
                    <option value="2025-2030 (Outlook)">2025–2030 (Outlook)</option>
                    <option value="2023-2025 (Historical)">2023–2025 (Historical)</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateIndustryReport}
                  className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white font-semibold hover:bg-blue-700 transition"
                >
                  Generate Report
                </button>
              </div>

              {industryReport && (
                <div className="mt-6 space-y-4">
                  <div className="rounded-lg border border-gray-200 p-4 bg-slate-50">
                    <p className="text-sm text-gray-500">Summary</p>
                    <p className="font-semibold text-gray-900">{industry} • {sector} • {yearRange}</p>
                  </div>
                  <div className="space-y-3 text-sm text-gray-700">
                    <p><span className="font-semibold">Industry overview:</span> {industryReport.overview}</p>
                    <p><span className="font-semibold">Sector insights:</span> {industryReport.sectorInsights}</p>
                    <p><span className="font-semibold">Key trends:</span> {industryReport.keyTrends.join(', ')}</p>
                    <p><span className="font-semibold">Market drivers:</span> {industryReport.marketDrivers.join(', ')}</p>
                    <p><span className="font-semibold">Challenges:</span> {industryReport.challenges.join(', ')}</p>
                    <p><span className="font-semibold">Opportunities:</span> {industryReport.opportunities.join(', ')}</p>
                    <p><span className="font-semibold">Forecast commentary:</span> {industryReport.forecast}</p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
                  >
                    <FileDown className="h-4 w-4" />
                    Download Report as PDF
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Company Profile Reports</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Company name</label>
                  <input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter company name"
                    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Industry</label>
                    <select
                      value={companyIndustry}
                      onChange={(e) => {
                        setCompanyIndustry(e.target.value);
                        setCompanySector('');
                      }}
                      className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2"
                    >
                      <option value="">Select industry</option>
                      {INDUSTRIES.map(item => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Sector</label>
                    <select
                      value={companySector}
                      onChange={(e) => setCompanySector(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2"
                      disabled={!companyIndustry}
                    >
                      <option value="">Select sector</option>
                      {(SECTOR_MAP[companyIndustry] || ['Core Segment', 'Adjacent Segment']).map(item => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">Region</label>
                  <select
                    value={companyRegion}
                    onChange={(e) => setCompanyRegion(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2"
                  >
                    <option value="">Select region</option>
                    {REGIONS.map(item => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleSuggestCompanies}
                  className="w-full rounded-lg border border-blue-600 px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 transition"
                >
                  Generate 5 Suggested Companies
                </button>
              </div>

              {suggestedCompanies.length > 0 && (
                <div className="mt-6 space-y-3">
                  <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    Suggested companies
                  </p>
                  {suggestedCompanies.map((company) => (
                    <div key={company.name} className="rounded-lg border border-gray-200 p-3 bg-slate-50">
                      <p className="font-semibold text-gray-900">{company.name}</p>
                      <p className="text-sm text-gray-600">{company.summary}</p>
                      <p className="text-xs text-gray-500 mt-1">{company.why}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleGenerateCompanyProfile}
                  className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white font-semibold hover:bg-blue-700 transition"
                >
                  Generate Company Profile
                </button>
              </div>

              {companyProfile && (
                <div className="mt-6 space-y-3 text-sm text-gray-700">
                  <div className="rounded-lg border border-gray-200 p-4 bg-slate-50">
                    <p className="text-sm text-gray-500">Company summary</p>
                    <p className="font-semibold text-gray-900">{companyProfile.name}</p>
                    <p className="text-gray-700">{companyProfile.overview}</p>
                  </div>
                  <p><span className="font-semibold">Business model:</span> {companyProfile.model}</p>
                  <p><span className="font-semibold">Key financial indicators:</span> {companyProfile.financials}</p>
                  <p><span className="font-semibold">Strategic priorities:</span> {companyProfile.priorities.join(', ')}</p>
                  <p><span className="font-semibold">Competitive positioning:</span> {companyProfile.positioning}</p>
                  <div className="rounded-lg border border-gray-200 p-4">
                    <p className="font-semibold text-gray-900 mb-2">SWOT Analysis</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
                      <div><span className="font-semibold">Strengths:</span> {companyProfile.swot.strengths.join(', ')}</div>
                      <div><span className="font-semibold">Weaknesses:</span> {companyProfile.swot.weaknesses.join(', ')}</div>
                      <div><span className="font-semibold">Opportunities:</span> {companyProfile.swot.opportunities.join(', ')}</div>
                      <div><span className="font-semibold">Threats:</span> {companyProfile.swot.threats.join(', ')}</div>
                    </div>
                  </div>
                  <p><span className="font-semibold">Future outlook:</span> {companyProfile.outlook}</p>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
                  >
                    <FileDown className="h-4 w-4" />
                    Download Report as PDF
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">What’s Included</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="rounded-lg border border-gray-200 p-4">
                Charts, tables, and commentary are mocked for layout testing.
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                Buttons will be wired to GPT + PDF workflows in the next phase.
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                Sam Studios branding and typography are aligned with existing pages.
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Mock data only. Live report generation and export will be connected in the backend phase.
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SamReportsPro;
