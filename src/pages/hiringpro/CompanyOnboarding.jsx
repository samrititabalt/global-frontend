import React, { useState } from 'react';
import api from '../../utils/axios';

const CompanyOnboarding = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    authorityName: '',
    authorityTitle: '',
    logo: null
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append('companyName', formData.companyName);
      payload.append('authorityName', formData.authorityName);
      payload.append('authorityTitle', formData.authorityTitle);
      if (formData.logo) payload.append('logo', formData.logo);

      const response = await api.post('/hiring-pro/companies', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        setResult(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to onboard company.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Company Setup</h2>
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {result ? (
        <div className="space-y-4">
          <div className="rounded-xl bg-green-50 border border-green-200 p-4">
            <p className="font-semibold text-green-900">Company onboarded successfully.</p>
            <p className="text-sm text-green-700">Use the admin credentials below to access your company admin panel.</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500 uppercase tracking-wide">Company Admin Credentials</p>
            <p className="mt-2 text-sm"><span className="font-semibold">Email:</span> {result.adminCredentials.email}</p>
            <p className="text-sm"><span className="font-semibold">Temporary Password:</span> {result.adminCredentials.password}</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
            <input
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter company name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
            <input
              type="file"
              name="logo"
              accept="image/*"
              onChange={handleChange}
              className="w-full text-sm text-gray-600"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Signing Authority Name</label>
              <input
                name="authorityName"
                value={formData.authorityName}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Jane Smith"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Signing Authority Title</label>
              <input
                name="authorityTitle"
                value={formData.authorityTitle}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Head of HR"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {loading ? 'Onboarding...' : 'Create Company Profile'}
          </button>
        </form>
      )}
    </div>
  );
};

export default CompanyOnboarding;
