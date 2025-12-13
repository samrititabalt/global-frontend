import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { XCircle, ArrowLeft, ShoppingBag } from 'lucide-react';

const CustomerPaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [planName, setPlanName] = useState('');
  const planId = searchParams.get('planId');

  useEffect(() => {
    // Optionally fetch plan name if planId is provided
    if (planId) {
      // You could fetch plan details here if needed
      setPlanName('your selected plan');
    }
  }, [planId]);

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50 py-16 px-4">
        <div className="max-w-2xl w-full bg-white/80 border border-white/60 backdrop-blur-xl rounded-3xl shadow-2xl p-10 text-center">
          <div className="mb-8">
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Payment Cancelled</h1>
            <p className="text-xl text-gray-600 mb-2">
              Your payment was not completed
            </p>
            {planName && (
              <p className="text-gray-500">
                Plan: <span className="font-semibold">{planName}</span>
              </p>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-yellow-900 mb-3">What happened?</h2>
            <ul className="text-left text-yellow-800 space-y-2">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>You chose to cancel the payment process on PayPal</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>No charges were made to your account</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Your plan selection has been saved, but not purchased</span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-3">What's next?</h2>
            <p className="text-blue-800 text-left">
              You can try again anytime. Simply go back to the plans page and select your preferred plan. 
              If you encountered any issues during payment, please contact our support team for assistance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/customer/plans')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 font-semibold transition shadow-lg hover:shadow-xl"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Try Again</span>
            </button>
            <Link
              to="/customer/dashboard"
              className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 hover:bg-gray-50 font-semibold transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need help? <Link to="/customer/dashboard" className="text-blue-600 hover:underline font-medium">Contact Support</Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CustomerPaymentCancel;

