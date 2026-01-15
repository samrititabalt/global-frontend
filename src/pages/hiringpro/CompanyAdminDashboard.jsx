import React, { useState } from 'react';
import api from '../../utils/axios';

const CompanyAdminDashboard = () => {
  const [token, setToken] = useState(localStorage.getItem('hiringProToken'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [offerLetters, setOfferLetters] = useState([]);
  const [offerForm, setOfferForm] = useState({
    candidateName: '',
    roleTitle: '',
    startDate: '',
    salaryPackage: '',
    ctcBreakdown: '',
    notes: ''
  });
  const [offerContent, setOfferContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadCompanyData = async (authToken) => {
    const [profile, employeeRes, offerRes] = await Promise.all([
      api.get('/hiring-pro/company/profile', { headers: { Authorization: `Bearer ${authToken}` } }),
      api.get('/hiring-pro/company/employees', { headers: { Authorization: `Bearer ${authToken}` } }),
      api.get('/hiring-pro/company/offer-letters', { headers: { Authorization: `Bearer ${authToken}` } })
    ]);
    setCompany(profile.data.company);
    setEmployees(employeeRes.data.employees || []);
    setOfferLetters(offerRes.data.offerLetters || []);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/hiring-pro/auth/login', { email, password, role: 'company_admin' });
      if (response.data.success) {
        localStorage.setItem('hiringProToken', response.data.token);
        setToken(response.data.token);
        await loadCompanyData(response.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateOffer = async () => {
    setError('');
    try {
      const response = await api.post('/hiring-pro/company/offer-letter/generate', offerForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOfferContent(response.data.content || '');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to generate offer letter');
    }
  };

  const handleSaveOffer = async () => {
    setError('');
    try {
      const response = await api.post('/hiring-pro/company/offer-letter', {
        ...offerForm,
        content: offerContent
      }, { headers: { Authorization: `Bearer ${token}` } });
      setOfferLetters(prev => [response.data.offerLetter, ...prev]);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save offer letter');
    }
  };

  if (!token) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Company Admin Login</h2>
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2"
            placeholder="Admin email"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2"
            placeholder="Password"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 text-white py-2 font-semibold"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">{company?.name}</h2>
        <p className="text-sm text-gray-600">Signing Authority: {company?.signingAuthority?.name} ({company?.signingAuthority?.title})</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">Generate Offer Letter</h3>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['candidateName', 'roleTitle', 'startDate', 'salaryPackage'].map(field => (
            <input
              key={field}
              value={offerForm[field]}
              onChange={(e) => setOfferForm(prev => ({ ...prev, [field]: e.target.value }))}
              className="rounded-lg border border-gray-300 px-4 py-2"
              placeholder={field.replace(/([A-Z])/g, ' $1')}
            />
          ))}
        </div>
        <textarea
          value={offerForm.ctcBreakdown}
          onChange={(e) => setOfferForm(prev => ({ ...prev, ctcBreakdown: e.target.value }))}
          className="w-full rounded-lg border border-gray-300 px-4 py-2"
          rows={3}
          placeholder="CTC breakdown"
        />
        <textarea
          value={offerForm.notes}
          onChange={(e) => setOfferForm(prev => ({ ...prev, notes: e.target.value }))}
          className="w-full rounded-lg border border-gray-300 px-4 py-2"
          rows={2}
          placeholder="Additional notes"
        />
        <button
          onClick={handleGenerateOffer}
          className="rounded-lg bg-gray-900 text-white px-4 py-2 font-semibold"
        >
          Generate Offer Letter
        </button>
        {offerContent && (
          <div className="space-y-3">
            <textarea
              value={offerContent}
              onChange={(e) => setOfferContent(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
              rows={10}
            />
            <button
              onClick={handleSaveOffer}
              className="rounded-lg bg-indigo-600 text-white px-4 py-2 font-semibold"
            >
              Save Offer Letter
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Offer Letters</h3>
        <div className="space-y-3">
          {offerLetters.map(letter => (
            <div key={letter._id} className="rounded-lg border border-gray-200 p-4">
              <p className="font-semibold">{letter.candidateName} — {letter.roleTitle}</p>
              <p className="text-sm text-gray-600">Start Date: {letter.startDate}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Employees</h3>
        <div className="space-y-2">
          {employees.map(employee => (
            <div key={employee._id} className="rounded-lg border border-gray-200 p-3">
              <p className="font-semibold">{employee.name}</p>
              <p className="text-sm text-gray-600">{employee.email}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompanyAdminDashboard;
