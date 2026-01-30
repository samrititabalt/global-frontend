import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ShieldCheck, FileSearch, TrendingUp, Users } from 'lucide-react';
import Header from '../../components/public/Header';
import Footer from '../../components/public/Footer';
import { useAuth } from '../../context/AuthContext';

const MarketResearchPlatformLanding = () => {
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

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-0">
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
            <section className="max-w-6xl mx-auto px-6 pt-2 pb-12">
              <span className="text-xs uppercase tracking-[0.3em] text-blue-600">MR 360 Platform</span>
              <h1 className="text-4xl font-bold text-gray-900 mt-4">
                MR 360 Platform — {displayName}
              </h1>
              <p className="text-gray-600 mt-4 max-w-3xl">
                Comprehensive market intelligence designed for {displayName}. Dedicated researchers combine platform
                intelligence with human-led discovery to deliver decision-ready reports.
              </p>
            </section>

            <section className="max-w-6xl mx-auto px-6 pb-16">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                    <h3 className="text-xl font-semibold text-gray-900">Core capabilities</h3>
                  </div>
                  <ul className="text-gray-600 space-y-2 list-disc list-inside">
                    <li>Quarterly industry trends</li>
                    <li>Category insights</li>
                    <li>Competitor developments</li>
                    <li>New product launches</li>
                    <li>Sector outlook</li>
                    <li>SWOT analysis</li>
                    <li>Consumer & shopper insights</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="w-6 h-6 text-blue-600" />
                    <h3 className="text-xl font-semibold text-gray-900">Dedicated researcher</h3>
                  </div>
                  <ul className="text-gray-600 space-y-2 list-disc list-inside">
                    <li>Assigned researcher for {displayName}</li>
                    <li>Manual gap analysis + platform tooling</li>
                    <li>Researcher drafts reports and conducts surveys</li>
                    <li>Human validation of insights and trends</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-gray-200 p-6 md:col-span-2">
                  <div className="flex items-center gap-3 mb-3">
                    <FileSearch className="w-6 h-6 text-blue-600" />
                    <h3 className="text-xl font-semibold text-gray-900">Latest intelligence links</h3>
                  </div>
                  <ul className="text-gray-600 space-y-2 list-disc list-inside">
                    <li>Latest articles and insight briefs</li>
                    <li>Competitor moves and category updates</li>
                    <li>Insight snapshots for leadership</li>
                  </ul>
                </div>
              </div>
            </section>

            <div className="fixed bottom-6 right-6 flex flex-col gap-3">
              <Link
                to={`/market-research-360/${company}/admin`}
                className="bg-blue-600 text-white px-5 py-3 rounded-full font-semibold shadow-lg hover:bg-blue-700 text-center"
              >
                Customer Admin
              </Link>
              <Link
                to={`/market-research-360/${company}/public`}
                className="bg-white text-gray-900 px-5 py-3 rounded-full font-semibold shadow-lg border border-gray-200 hover:bg-gray-50 text-center"
              >
                Customer Public
              </Link>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MarketResearchPlatformLanding;
