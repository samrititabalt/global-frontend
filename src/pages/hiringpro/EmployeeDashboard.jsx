import React, { useState } from 'react';
import api from '../../utils/axios';

const EmployeeDashboard = () => {
  const [token, setToken] = useState(localStorage.getItem('hiringProToken'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [offerLetters, setOfferLetters] = useState([]);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/hiring-pro/auth/login', { email, password, role: 'employee' });
      if (response.data.success) {
        localStorage.setItem('hiringProToken', response.data.token);
        setToken(response.data.token);
        const offers = await api.get('/hiring-pro/employee/offer-letters', {
          headers: { Authorization: `Bearer ${response.data.token}` }
        });
        setOfferLetters(offers.data.offerLetters || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  if (!token) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Employee Login</h2>
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2"
            placeholder="Employee email"
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
            className="w-full rounded-lg bg-blue-600 text-white py-2 font-semibold"
          >
            Sign In
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Offer Letters</h2>
      <div className="space-y-3">
        {offerLetters.length === 0 && (
          <p className="text-sm text-gray-600">No offer letters available yet.</p>
        )}
        {offerLetters.map(letter => (
          <div key={letter._id} className="rounded-lg border border-gray-200 p-4">
            <p className="font-semibold">{letter.candidateName} — {letter.roleTitle}</p>
            <p className="text-sm text-gray-600">Start Date: {letter.startDate}</p>
            <p className="text-sm text-gray-600">Status: {letter.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
