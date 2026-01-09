import React from 'react';
import { Shield, Lock, FileSearch, Users } from 'lucide-react';
import Header from '../../components/public/Header';
import Footer from '../../components/public/Footer';

const sections = [
  {
    icon: Shield,
    title: 'Data we collect',
    items: [
      'Account information (name, email, company, role).',
      'Conversation data needed for Tabalt services and SamAI.',
      'Meta OAuth tokens, ad account IDs, and campaign metadata when you connect Facebook.',
    ],
  },
  {
    icon: Lock,
    title: 'How we use it',
    items: [
      'Provision and support of Tabalt services, including chat, plans, and reporting.',
      'Automated campaign management via the Meta Marketing API with Advantage+ best practices.',
      'Security, auditing, fraud prevention, and compliance with Meta platform policies.',
    ],
  },
  {
    icon: FileSearch,
    title: 'How long we retain it',
    items: [
      'Service data is retained while you maintain an active contract.',
      'Meta access tokens are rotated automatically and stored encrypted.',
      'Analytics data is aggregated and anonymised after 12 months.',
    ],
  },
  {
    icon: Users,
    title: 'Your choices',
    items: [
      'Revoke Meta access anytime from the Facebook Business Integrations panel.',
      'Request export or deletion of your Tabalt data via privacy@tabalt.co.uk.',
      'Opt-out of marketing emails directly from the footer of each message.',
    ],
  },
];

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-28 pb-16">
        <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="max-w-5xl mx-auto px-4 py-16 text-center">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">
              Privacy Policy
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Transparent data practices for Meta compliance
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Tabalt Ltd (“Tabalt”, “we”) is committed to protecting the personal data of our
              customers, agents, and Meta users. This policy explains how we collect, use, share, and
              delete information in line with the UK GDPR, Meta Platform Terms, and industry
              standards.
            </p>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          {sections.map((section) => (
            <div
              key={section.title}
              className="rounded-3xl border border-gray-100 bg-white shadow-sm p-8 hover:shadow-xl transition-shadow"
            >
              <section.icon className="h-10 w-10 text-blue-600 mb-5" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">{section.title}</h3>
              <ul className="space-y-3 text-gray-600">
                {section.items.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <p>{item}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="max-w-5xl mx-auto px-4 pb-20">
          <div className="rounded-3xl bg-gray-900 text-gray-100 p-8 md:p-12 shadow-2xl">
            <h2 className="text-3xl font-semibold mb-4">Meta-specific disclosures</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              When you launch Facebook or Instagram ads through Tabalt, we only request the minimum
              scopes required for ads_management, ads_read, business_management, and
              pages_read_engagement. Campaign creation, ad sets, creatives, and automation are
              executed with strict logging, and tokens are stored encrypted with automatic rotation.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <p className="text-gray-400 uppercase text-xs mb-1">Controller</p>
                <p>Tabalt Ltd, 3 Herron Court, Bromley, London</p>
              </div>
              <div>
                <p className="text-gray-400 uppercase text-xs mb-1">DPO / Privacy</p>
                <a href="mailto:privacy@tabalt.co.uk" className="text-white hover:text-blue-300">
                  privacy@tabalt.co.uk
                </a>
              </div>
              <div>
                <p className="text-gray-400 uppercase text-xs mb-1">Last updated</p>
                <p>9 Jan 2026</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;

