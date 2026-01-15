import React from 'react';
import Header from '../../components/public/Header';
import Footer from '../../components/public/Footer';

const HiringProAgent = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-24 pb-16 max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-3">Hiring Platform Access</h1>
          <p className="text-gray-600">
            Hiring Pro is available to company administrators and employees only. Please contact your administrator for access.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HiringProAgent;
