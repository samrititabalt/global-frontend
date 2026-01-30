import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ShieldCheck, MessageSquareText, PhoneCall } from 'lucide-react';
import Header from '../../components/public/Header';
import Footer from '../../components/public/Footer';
import { useAuth } from '../../context/AuthContext';
import LiveChatBot from '../../components/public/LiveChatBot';

const MarketResearchAdminDashboard = () => {
  const { company } = useParams();
  const { user, isAuthenticated } = useAuth();
  const isAdmin = isAuthenticated && user?.role === 'admin';

  const access = useMemo(() => {
    if (isAdmin) return { allowed: true, companyName: company };
    const stored = localStorage.getItem('mr360CompanyAccess');
    if (!stored) return { allowed: false };
    try {
      const parsed = JSON.parse(stored);
      if (parsed?.slug === company) {
        return { allowed: true, companyName: parsed.companyName || company };
      }
    } catch (err) {
      return { allowed: false };
    }
    return { allowed: false };
  }, [company, isAdmin]);

  const displayName = access.companyName || company;
  const quadrants = [
    { title: 'Sector Overview', description: '2-page style overview, quarterly performance, and trends.' },
    { title: 'New Product Launches', description: 'Sector launches with filters by month and quarter.' },
    { title: 'Retail Overview', description: 'Retailer performance, channel insights, promotions and pricing.' },
    { title: 'Consumer Overview', description: 'Behavior, attitudes, preferences, and demographics.' },
    { title: 'Advertising Overview', description: 'Ad spend, creative trends, competitor campaigns.' },
    { title: 'Major Companies', description: 'Profiles, market share, key developments.' },
    { title: 'Minor Companies', description: 'Smaller players, innovations, growth signals.' },
    { title: 'Major Competitors', description: 'Competitor profiles, strengths, weaknesses, recent moves.' },
    { title: 'SWOT', description: 'SWOT analysis for the client’s product or brand.' },
    { title: 'Recent Contracts', description: 'Retailer deals, supplier agreements, distribution changes.' },
    { title: 'Major Developments', description: 'Board appointments, M&A, funding, regulatory changes.' },
    { title: 'Investors Room', description: 'Investment trends, analyst commentary, market forecasts.' },
    { title: 'Outlook', description: 'Short-term and long-term outlook, risks, opportunities.' },
  ];

  const companyProfiles = [
    { name: 'Lush', tier: 'Major Company', details: ['Overview', 'Key products', 'Market position', 'Recent developments', 'SWOT', 'Financial signals'] },
    { name: 'The Body Shop', tier: 'Major Company', details: ['Overview', 'Key products', 'Market position', 'Recent developments', 'SWOT', 'Financial signals'] },
    { name: 'Boots', tier: 'Major Company', details: ['Overview', 'Key products', 'Market position', 'Recent developments', 'SWOT', 'Financial signals'] },
    { name: 'Indie Wellness Co.', tier: 'Minor Company', details: ['Overview', 'Key products', 'Market position', 'Recent developments', 'SWOT', 'Financial signals'] },
    { name: 'Herbal Glow', tier: 'Minor Company', details: ['Overview', 'Key products', 'Market position', 'Recent developments', 'SWOT', 'Financial signals'] },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-24">
        {!access.allowed ? (
          <section className="max-w-2xl mx-auto px-6 py-20 text-center">
            <ShieldCheck className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Access required</h1>
            <p className="text-gray-600 mt-2">
              Please validate your company access on the Market Research 360 landing page.
            </p>
            <Link
              to="/market-research-360"
              className="inline-flex items-center justify-center mt-6 rounded-lg bg-blue-600 text-white px-5 py-2 font-semibold hover:bg-blue-700"
            >
              Back to MR 360
            </Link>
          </section>
        ) : (
          <>
            <section className="max-w-6xl mx-auto px-6 py-12">
              <h1 className="text-3xl font-bold text-gray-900">MR 360 Customer Admin — {displayName}</h1>
              <p className="text-gray-600 mt-2">
                Includes the full public insights dashboard plus Ask Sam access and agent collaboration tools.
              </p>
            </section>

            <section className="max-w-6xl mx-auto px-6 pb-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <MessageSquareText className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Ask Sam Interface</h2>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Use the Ask Sam chat/call interface to connect with researchers and request custom MR tasks.
                  </p>
                  <div className="flex items-center gap-3">
                    <Link
                      to="/customer/chat"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
                    >
                      Open Ask Sam Console
                    </Link>
                    <Link
                      to={`/market-research-360/${company}/public`}
                      className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50"
                    >
                      View Public Dashboard
                    </Link>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <PhoneCall className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Connect with Researchers</h2>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Schedule calls, submit briefing notes, and coordinate research tasks directly with your assigned researcher.
                  </p>
                  <ul className="text-gray-600 space-y-2 list-disc list-inside">
                    <li>Dedicated MR researcher assigned to {displayName}</li>
                    <li>Manual gap-filling and survey execution</li>
                    <li>Priority updates and quarterly briefings</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="max-w-6xl mx-auto px-6 pb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quadrants.map((quad) => (
                  <div key={quad.title} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900">{quad.title}</h3>
                    <p className="text-sm text-gray-600 mt-2">{quad.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="max-w-6xl mx-auto px-6 pb-20">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Company Profiles</h2>
                <p className="text-gray-600 mb-6">
                  Explore major and minor company profiles with deep insights and SWOT analysis.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {companyProfiles.map((profile) => (
                    <div key={profile.name} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{profile.name}</h3>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                          {profile.tier}
                        </span>
                      </div>
                      <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                        {profile.details.map((detail) => (
                          <li key={detail}>{detail}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
      <LiveChatBot />
    </div>
  );
};

export default MarketResearchAdminDashboard;
