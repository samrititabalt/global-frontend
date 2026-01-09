import React from 'react';
import { ScrollText, CheckCircle, Layers3 } from 'lucide-react';
import Header from '../../components/public/Header';
import Footer from '../../components/public/Footer';

const commitments = [
  {
    title: 'Service scope',
    description:
      'Tabalt provides outsourcing, managed support, SamAI chat, and Facebook Ads Quick Launch as “Software + Services”. We may update features to align with Meta Platform changes.',
  },
  {
    title: 'Acceptable use',
    description:
      'You agree not to use Tabalt to promote prohibited content (adult, discriminatory, deceptive, or policy-violating material) and to follow Meta Advertising Standards at all times.',
  },
  {
    title: 'Billing & plans',
    description:
      'Subscriptions, tokens, and retainers follow the plan you selected. Campaign ad spend on Meta is billed by Meta directly to your ad account. Tabalt invoices only for our managed services.',
  },
];

const legalClauses = [
  {
    title: 'Platform integrations',
    body: 'By connecting Meta, you authorise Tabalt to create campaigns, ad sets, creatives, and ads under your Business Manager with the scopes you granted. You may revoke access at any time from Meta Business Integrations.',
  },
  {
    title: 'Data processing',
    body: 'Tabalt is a data processor for customer content and acts as a joint controller when configuring Meta campaigns. We comply with UK GDPR and execute DPAs upon request.',
  },
  {
    title: 'Support & termination',
    body: 'Support tickets are handled via chat or email. Either party may terminate with 30 days written notice. Any outstanding fees remain payable and data deletion requests will be honoured as described in our Data Deletion Policy.',
  },
];

const TermsOfService = () => (
  <div className="min-h-screen bg-white">
    <Header />
    <main className="pt-28 pb-16">
      <section className="bg-gradient-to-r from-gray-50 to-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-gray-500 mb-4">Terms of Service</p>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              The guardrails for partnering with Tabalt
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              These Terms govern your access to Tabalt products, including SamAI, customer/agent
              workspaces, and our Facebook Ads Quick Launch tooling. By using Tabalt, you confirm you
              are authorized to bind your organisation and ad accounts.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                Effective: 9 Jan 2026
              </div>
              <div className="px-4 py-2 rounded-full bg-gray-900 text-gray-100 text-sm font-semibold flex items-center gap-2">
                <ScrollText className="h-4 w-4" />
                Meta partner compliant
              </div>
            </div>
          </div>
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">What you can expect</h2>
            <div className="space-y-5">
              {commitments.map((item) => (
                <div key={item.title} className="flex gap-4">
                  <CheckCircle className="h-6 w-6 text-emerald-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16 space-y-10">
        {legalClauses.map((clause) => (
          <article
            key={clause.title}
            className="rounded-3xl border border-gray-100 bg-white shadow-sm p-8 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center gap-3 mb-4">
              <Layers3 className="h-5 w-5 text-blue-600" />
              <h3 className="text-2xl font-semibold text-gray-900">{clause.title}</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">{clause.body}</p>
          </article>
        ))}
      </section>

      <section className="max-w-4xl mx-auto px-4">
        <div className="rounded-3xl bg-blue-600 text-white p-10 shadow-2xl">
          <h2 className="text-3xl font-semibold mb-4">Need a signed agreement?</h2>
          <p className="text-blue-100 mb-6">
            For enterprise clients we provide MSAs, DPAs, SCCs, and security documentation. Reach
            out to <a href="mailto:legal@tabalt.co.uk" className="underline">legal@tabalt.co.uk</a>{' '}
            with your requirements.
          </p>
          <div className="text-sm opacity-75">
            Governing law: England & Wales. Venue: London courts. These Terms incorporate our
            Privacy Policy and Data Deletion Policy by reference.
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default TermsOfService;

