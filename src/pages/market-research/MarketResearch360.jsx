import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  PhoneCall,
  FileText,
  BarChart3,
  LineChart,
  Users,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import Header from '../../components/public/Header';
import Footer from '../../components/public/Footer';
import api from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';

const MarketResearch360 = () => {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = isAuthenticated && user?.role === 'admin';
  const [landingCode, setLandingCode] = useState('');
  const [accessError, setAccessError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [secretNumber, setSecretNumber] = useState('');
  const [validating, setValidating] = useState(false);
  const navigate = useNavigate();

  const isUnlocked = useMemo(() => {
    if (isAdmin) return true;
    return localStorage.getItem('mr360LandingAccess') === 'true';
  }, [isAdmin]);

  const handleUnlock = (e) => {
    e.preventDefault();
    if (landingCode.trim() === '0181') {
      localStorage.setItem('mr360LandingAccess', 'true');
      setAccessError('');
      window.location.reload();
    } else {
      setAccessError('Invalid secret code.');
    }
  };

  const handleValidate = async (e) => {
    e.preventDefault();
    setAccessError('');
    setValidating(true);
    try {
      const response = await api.post('/public/market-research/validate', {
        companyName,
        secretNumber,
      });
      if (response.data?.success) {
        const payload = {
          companyName: response.data.companyName,
          slug: response.data.slug,
          issuedAt: Date.now(),
        };
        localStorage.setItem('mr360CompanyAccess', JSON.stringify(payload));
        navigate(`/market-research-360/${response.data.slug}`);
      }
    } catch (err) {
      setAccessError(err.response?.data?.message || 'Invalid credentials.');
    } finally {
      setValidating(false);
    }
  };

  const capabilities = [
    {
      title: 'Data Collection',
      icon: ClipboardList,
      items: ['Qualitative surveys', 'Quantitative surveys', 'Online panels', 'Phone interviews'],
    },
    {
      title: 'Market Research Reports',
      icon: FileText,
      items: ['Industry reports', 'Category deep dives', 'Competitor analysis', 'Consumer insights'],
    },
    {
      title: 'Market Research Platform',
      icon: BarChart3,
      items: ['Real-time insights', 'Quarterly trends', 'Category intelligence', 'Competitor developments'],
    },
    {
      title: 'Real Human Researchers',
      icon: Users,
      items: [
        'One dedicated researcher per client',
        'Platform + manual research',
        'Drafts reports and conducts surveys',
        'Fills insight gaps with human expertise',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-0">
        {!isUnlocked ? (
          <section className="max-w-xl mx-auto px-6 py-24 text-center">
            <ShieldCheck className="w-12 h-12 text-blue-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Market Research 360</h1>
            <p className="text-gray-600 mb-8">
              Enter the secret code to access this landing page.
            </p>
            <form onSubmit={handleUnlock} className="space-y-3">
              <input
                value={landingCode}
                onChange={(e) => setLandingCode(e.target.value)}
                placeholder="Enter secret code"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm"
              />
              {accessError && <div className="text-sm text-red-600">{accessError}</div>}
              <button className="w-full rounded-lg bg-blue-600 text-white py-3 font-semibold hover:bg-blue-700">
                Unlock Market Research 360
              </button>
            </form>
          </section>
        ) : (
          <>
            <section className="relative overflow-hidden bg-slate-900 text-white">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_#1e40af_0%,_transparent_55%)]"></div>
              <div className="max-w-6xl mx-auto px-6 py-20 relative z-10">
                <div className="max-w-3xl">
                  <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-blue-200">
                    <TrendingUp className="w-4 h-4" />
                    Market Research 360
                  </span>
                  <h1 className="text-4xl md:text-5xl font-bold mt-4">
                    End-to-End Market Research. One Platform. One Researcher.
                  </h1>
                  <p className="text-lg text-blue-100 mt-4">
                    SamStudios delivers full-stack market research combining technology, data, and dedicated researchers
                    to build confident business decisions.
                  </p>
                </div>
              </div>
            </section>
            <section className="bg-white">
              <div className="max-w-6xl mx-auto px-6 pt-0 pb-6">
                <div className="relative overflow-hidden rounded-3xl border border-gray-200 shadow-sm">
                  <img
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=2000&h=900&fit=crop"
                    alt="Market researchers collecting data"
                    className="w-full h-[360px] md:h-[460px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/40 via-slate-900/10 to-transparent"></div>
                </div>
              </div>
            </section>

            <section className="max-w-6xl mx-auto px-6 py-16">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {capabilities.map((capability) => {
                  const Icon = capability.icon;
                  return (
                    <div key={capability.title} className="rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">{capability.title}</h3>
                      </div>
                      <ul className="text-gray-600 space-y-2 list-disc list-inside">
                        {capability.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="max-w-6xl mx-auto px-6 pb-20">
              <div className="rounded-2xl bg-white border border-gray-200 p-8 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Premium research, delivered fast</h2>
                  <p className="text-gray-600 mt-2">
                    Dedicated researchers build reports, conduct surveys, and surface insight gaps for your category.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <PhoneCall className="w-4 h-4" />
                    Phone & online research included
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <LineChart className="w-4 h-4" />
                    Quarterly intelligence updates
                  </div>
                </div>
              </div>
            </section>

            <button
              onClick={() => setModalOpen(true)}
              className="fixed bottom-6 right-6 bg-blue-600 text-white px-5 py-3 rounded-full font-semibold shadow-lg hover:bg-blue-700 transition"
            >
              Market Research Platform
            </button>

            {modalOpen && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
                <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Access Market Research Platform</h3>
                  <form onSubmit={handleValidate} className="space-y-4">
                    <input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Company Name"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2"
                    />
                    <input
                      value={secretNumber}
                      onChange={(e) => setSecretNumber(e.target.value)}
                      placeholder="Secret Number"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2"
                    />
                    {accessError && <div className="text-sm text-red-600">{accessError}</div>}
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setModalOpen(false)}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={validating}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
                      >
                        {validating ? 'Validating...' : 'Enter Platform'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MarketResearch360;
