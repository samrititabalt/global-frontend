import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../utils/axios';

const CustomerPaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Processing payment...');

  useEffect(() => {
    const executePayment = async () => {
      const paymentId = searchParams.get('paymentId');
      const payerId = searchParams.get('PayerID');

      if (paymentId && payerId) {
        try {
          const response = await api.post('/payment/execute', {
            paymentId,
            payerId
          });

          if (response.data.success) {
            setMessage(response.data.message || 'Thank you! Our team will reach you shortly.');
            setTimeout(() => {
              navigate('/customer/dashboard');
            }, 3000);
          }
        } catch (error) {
          setMessage(error.response?.data?.message || 'Payment processing failed');
        }
      }
    };

    executePayment();
  }, [searchParams, navigate]);

  return (
    <Layout>
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Successful!</h2>
        <p className="text-gray-600">{message}</p>
      </div>
    </Layout>
  );
};

export default CustomerPaymentSuccess;

