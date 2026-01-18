import React, { useEffect, useMemo, useState } from 'react';
import { FileText, Building2, MapPin, TrendingUp, Sparkles, FileDown } from 'lucide-react';
import Header from '../../components/public/Header';
import Footer from '../../components/public/Footer';
import api from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';

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
  const { isAuthenticated } = useAuth();
  const [industry, setIndustry] = useState('');
  const [sector, setSector] = useState('');
  const [yearRange, setYearRange] = useState('2026 (Current)');
  const [industryReport, setIndustryReport] = useState(null);
  const [industries, setIndustries] = useState(INDUSTRIES);
  const [availableSectors, setAvailableSectors] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoadingIndustry, setIsLoadingIndustry] = useState(false);
  const [isDownloadingIndustry, setIsDownloadingIndustry] = useState(false);

  const [companyName, setCompanyName] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('');
  const [companySector, setCompanySector] = useState('');
  const [companyRegion, setCompanyRegion] = useState('');
  const [suggestedCompanies, setSuggestedCompanies] = useState([]);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [isLoadingCompany, setIsLoadingCompany] = useState(false);
  const [isDownloadingCompany, setIsDownloadingCompany] = useState(false);

  const sectors = useMemo(() => {
    if (!industry) return [];
    if (availableSectors.length) return availableSectors;
    return SECTOR_MAP[industry] || ['Core Segment', 'Adjacent Segment', 'Emerging Segment', 'Services & Enablement'];
  }, [industry, availableSectors]);

  useEffect(() => {
    if (!isAuthenticated) {
      setStatusMessage('Log in to generate Sam Reports.');
      return;
    }
    api.get('/sam-reports/industries')
      .then((response) => {
        if (Array.isArray(response.data?.industries)) {
          setIndustries(response.data.industries);
        }
      })
      .catch(() => {
        setIndustries(INDUSTRIES);
      });
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !industry) {
      setAvailableSectors([]);
      return;
    }
    api.post('/sam-reports/sectors', { industry })
      .then((response) => {
        if (Array.isArray(response.data?.sectors)) {
          setAvailableSectors(response.data.sectors);
        } else {
          setAvailableSectors([]);
        }
      })
      .catch(() => {
        setAvailableSectors([]);
      });
  }, [industry, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    const start = Date.now();
    api.post('/sam-reports/analytics', { eventType: 'session_started' }).catch(() => {});
    return () => {
      const durationSeconds = Math.max(1, Math.floor((Date.now() - start) / 1000));
      api.post('/sam-reports/analytics', {
        eventType: 'session_ended',
        metadata: { durationSeconds }
      }).catch(() => {});
    };
  }, [isAuthenticated]);

  const handleGenerateIndustryReport = async () => {
    if (!isAuthenticated) {
      setStatusMessage('Please log in to generate a report.');
      return;
    }
    if (!industry || !sector || !yearRange) return;
    setIsLoadingIndustry(true);
    setStatusMessage('');
    try {
      const response = await api.post('/sam-reports/industry-report', {
        industry,
        sector,
        yearRange
      });
      if (response.data?.report) {
        setIndustryReport(response.data.report);
      }
    } catch (error) {
      setStatusMessage(error.response?.data?.message || 'Unable to generate report.');
    } finally {
      setIsLoadingIndustry(false);
    }
  };

  const handleDownloadIndustryPdf = async () => {
    if (!industryReport?._id) return;
    setIsDownloadingIndustry(true);
    setStatusMessage('');
    try {
      await api.post(`/sam-reports/report/${industryReport._id}/pdf`);
      const download = await api.get(`/sam-reports/report/${industryReport._id}/download`);
      if (download.data?.url) {
        window.open(download.data.url, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      setStatusMessage(error.response?.data?.message || 'Unable to download PDF.');
    } finally {
      setIsDownloadingIndustry(false);
    }
  };

  const handleSuggestCompanies = async () => {
    if (!isAuthenticated) {
      setStatusMessage('Please log in to view suggestions.');
      return;
    }
    if (!companyIndustry || !companySector || !companyRegion) return;
    setStatusMessage('');
    try {
      const response = await api.post('/sam-reports/company-suggestions', {
        industry: companyIndustry,
        sector: companySector,
        region: companyRegion
      });
      if (Array.isArray(response.data?.suggestions)) {
        setSuggestedCompanies(response.data.suggestions);
      }
    } catch (error) {
      setStatusMessage(error.response?.data?.message || 'Unable to load suggestions.');
    }
  };

  const handleGenerateCompanyProfile = async () => {
    if (!isAuthenticated) {
      setStatusMessage('Please log in to generate a company report.');
      return;
    }
    const resolvedName = companyName || suggestedCompanies[0]?.name;
    if (!resolvedName || !companyIndustry || !companySector || !companyRegion) {
      setStatusMessage('Select industry, sector, region, and company name.');
      return;
    }
    setIsLoadingCompany(true);
    setStatusMessage('');
    try {
      const response = await api.post('/sam-reports/company-report', {
        companyName: resolvedName,
        industry: companyIndustry,
        sector: companySector,
        region: companyRegion
      });
      if (response.data?.report) {
        setCompanyProfile(response.data.report);
      }
    } catch (error) {
      setStatusMessage(error.response?.data?.message || 'Unable to generate company report.');
    } finally {
      setIsLoadingCompany(false);
    }
  };

  const handleDownloadCompanyPdf = async () => {
    if (!companyProfile?._id) return;
    setIsDownloadingCompany(true);
    setStatusMessage('');
    try {
      await api.post(`/sam-reports/report/${companyProfile._id}/pdf`);
      const download = await api.get(`/sam-reports/report/${companyProfile._id}/download`);
      if (download.data?.url) {
        window.open(download.data.url, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      setStatusMessage(error.response?.data?.message || 'Unable to download PDF.');
    } finally {
      setIsDownloadingCompany(false);
    }
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
                    {industries.map(item => (
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
                  disabled={isLoadingIndustry}
                  className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white font-semibold hover:bg-blue-700 transition"
                >
                  {isLoadingIndustry ? 'Generating...' : 'Generate Report'}
                </button>
              </div>

              {industryReport && (
                <div className="mt-6 space-y-4">
                  <div className="rounded-lg border border-gray-200 p-4 bg-slate-50">
                    <p className="text-sm text-gray-500">Summary</p>
                    <p className="font-semibold text-gray-900">{industry} • {sector} • {yearRange}</p>
                  </div>
                  <div className="space-y-3 text-sm text-gray-700">
                    <p><span className="font-semibold">Industry overview:</span> {industryReport.content?.overview}</p>
                    <p><span className="font-semibold">Sector insights:</span> {industryReport.content?.sectorInsights}</p>
                    <p><span className="font-semibold">Key trends:</span> {(industryReport.content?.keyTrends || []).join(', ')}</p>
                    <p><span className="font-semibold">Market drivers:</span> {(industryReport.content?.marketDrivers || []).join(', ')}</p>
                    <p><span className="font-semibold">Challenges:</span> {(industryReport.content?.challenges || []).join(', ')}</p>
                    <p><span className="font-semibold">Opportunities:</span> {(industryReport.content?.opportunities || []).join(', ')}</p>
                    <p><span className="font-semibold">Forecast commentary:</span> {industryReport.content?.forecastCommentary}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadIndustryPdf}
                    disabled={isDownloadingIndustry}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
                  >
                    <FileDown className="h-4 w-4" />
                    {isDownloadingIndustry ? 'Preparing PDF...' : 'Download Report as PDF'}
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
                      {industries.map(item => (
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
                  disabled={isLoadingCompany}
                  className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-70"
                >
                  {isLoadingCompany ? 'Generating...' : 'Generate Company Profile'}
                </button>
              </div>

              {companyProfile && (
                <div className="mt-6 space-y-3 text-sm text-gray-700">
                  <div className="rounded-lg border border-gray-200 p-4 bg-slate-50">
                    <p className="text-sm text-gray-500">Company summary</p>
                    <p className="font-semibold text-gray-900">{companyProfile.companyName}</p>
                    <p className="text-gray-700">{companyProfile.content?.overview}</p>
                  </div>
                  <p><span className="font-semibold">Business model:</span> {companyProfile.content?.businessModel}</p>
                  <p><span className="font-semibold">Key financial indicators:</span> {companyProfile.content?.keyFinancialIndicators}</p>
                  <p><span className="font-semibold">Strategic priorities:</span> {(companyProfile.content?.strategicPriorities || []).join(', ')}</p>
                  <p><span className="font-semibold">Competitive positioning:</span> {companyProfile.content?.competitivePositioning}</p>
                  <div className="rounded-lg border border-gray-200 p-4">
                    <p className="font-semibold text-gray-900 mb-2">SWOT Analysis</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
                      <div><span className="font-semibold">Strengths:</span> {(companyProfile.content?.swot?.strengths || []).join(', ')}</div>
                      <div><span className="font-semibold">Weaknesses:</span> {(companyProfile.content?.swot?.weaknesses || []).join(', ')}</div>
                      <div><span className="font-semibold">Opportunities:</span> {(companyProfile.content?.swot?.opportunities || []).join(', ')}</div>
                      <div><span className="font-semibold">Threats:</span> {(companyProfile.content?.swot?.threats || []).join(', ')}</div>
                    </div>
                  </div>
                  <p><span className="font-semibold">Future outlook:</span> {companyProfile.content?.futureOutlook}</p>
                  <button
                    type="button"
                    onClick={handleDownloadCompanyPdf}
                    disabled={isDownloadingCompany}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
                  >
                    <FileDown className="h-4 w-4" />
                    {isDownloadingCompany ? 'Preparing PDF...' : 'Download Report as PDF'}
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

          {statusMessage && (
            <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 text-sm text-blue-700">
              {statusMessage}
            </div>
          )}
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
