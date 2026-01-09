import React from 'react';
import { Trash2, Mail, Clock, Server } from 'lucide-react';
import Header from '../../components/public/Header';
import Footer from '../../components/public/Footer';

const steps = [
  {
    title: 'Submit a request',
    detail:
      'Email privacy@tabalt.co.uk from the address associated with your Tabalt account or Facebook Business Manager. Include “Data Deletion Request” in the subject.',
    icon: Mail,
  },
  {
    title: 'Verification',
    detail:
      'We verify ownership via secure email and, if applicable, confirm the request inside Meta Business integrations. This protects your ad accounts from unauthorized removal.',
    icon: ShieldIcon,
  },
  {
    title: 'Deletion window',
    detail:
      'We erase user profiles, chat transcripts, SamAI logs, and Facebook access tokens within 7 business days (max 30 days for offline backups). You will receive a completion report.',
    icon: Clock,
  },
  {
    title: 'Meta-specific data',
    detail:
      'Campaign entities that already exist inside your Meta ad account remain under your control. We delete any mirrored data and revoke our app access automatically.',
    icon: Server,
  },
];

function ShieldIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M12 3l7 4v5c0 5-3 9-7 9s-7-4-7-9V7l7-4z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 12.5l2 2 3-4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const DataDeletion = () => (
  <div className="min-h-screen bg-white">
    <Header />
    <main className="pt-28 pb-16">
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0">
          <div className="absolute w-72 h-72 bg-blue-500/30 blur-3xl top-10 left-10" />
          <div className="absolute w-96 h-96 bg-indigo-500/30 blur-3xl bottom-0 right-0" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 py-16 text-center space-y-6">
          <p className="text-sm uppercase tracking-[0.5em] text-blue-200">Data Deletion</p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Delete your Tabalt + Meta data on demand
          </h1>
          <p className="text-lg text-slate-200">
            Meta requires partners to provide a clear deletion workflow. Tabalt honours any verified
            request in line with UK GDPR, Meta terms, and contractual obligations.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-8">
        {steps.map((step) => (
          <article
            key={step.title}
            className="rounded-3xl border border-gray-100 bg-white shadow-lg p-8 hover:shadow-xl transition-shadow"
          >
            <step.icon className="h-10 w-10 text-blue-600 mb-5" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">{step.title}</h2>
            <p className="text-gray-600 leading-relaxed">{step.detail}</p>
          </article>
        ))}
      </section>

      <section className="max-w-4xl mx-auto px-4">
        <div className="rounded-3xl bg-gray-50 border border-gray-100 p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Need expedited removal?</h3>
              <p className="text-gray-600">
                If you require deletion in under 48 hours for compliance, call +44 7448 614 160 after
                submitting your email request. Our privacy team operates 24/5 for urgent Meta
                escalations.
              </p>
            </div>
            <a
              href="mailto:privacy@tabalt.co.uk"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white px-6 py-3 font-semibold shadow-lg hover:bg-blue-700"
            >
              <Trash2 className="h-5 w-5" />
              Request deletion
            </a>
          </div>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
            <div>
              <p className="text-xs uppercase text-gray-400 mb-1">Backup policy</p>
              <p>Rolling encrypted backups purge automatically after 30 days.</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-400 mb-1">Third parties</p>
              <p>We forward requests to sub-processors (hosting, analytics) within 5 days.</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-400 mb-1">Proof of completion</p>
              <p>Signed audit log sent once data and OAuth tokens are removed.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default DataDeletion;

