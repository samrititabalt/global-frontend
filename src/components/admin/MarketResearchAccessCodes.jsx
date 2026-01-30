import React, { useEffect, useState } from 'react';
import { Trash2, Save } from 'lucide-react';
import api from '../../utils/axios';

const MarketResearchAccessCodes = () => {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newSecretNumber, setNewSecretNumber] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingCompany, setEditingCompany] = useState('');
  const [editingSecret, setEditingSecret] = useState('');

  const loadCodes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/market-research-access-codes');
      setCodes(response.data.codes || []);
    } catch (err) {
      setError('Failed to load access codes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCodes();
  }, []);

  const handleAdd = async () => {
    if (!newCompanyName.trim() || !newSecretNumber.trim()) {
      setError('Company name and secret number are required.');
      return;
    }
    setError('');
    try {
      await api.post('/admin/market-research-access-codes', {
        companyName: newCompanyName.trim(),
        secretNumber: newSecretNumber.trim(),
      });
      setNewCompanyName('');
      setNewSecretNumber('');
      await loadCodes();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add access code.');
    }
  };

  const startEditing = (code) => {
    setEditingId(code._id);
    setEditingCompany(code.companyName);
    setEditingSecret(code.secretNumber);
  };

  const handleSave = async (id) => {
    if (!editingCompany.trim() || !editingSecret.trim()) {
      setError('Company name and secret number are required.');
      return;
    }
    setError('');
    setSavingId(id);
    try {
      await api.put(`/admin/market-research-access-codes/${id}`, {
        companyName: editingCompany.trim(),
        secretNumber: editingSecret.trim(),
      });
      setEditingId(null);
      await loadCodes();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update access code.');
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this access code?')) {
      return;
    }
    setError('');
    try {
      await api.delete(`/admin/market-research-access-codes/${id}`);
      await loadCodes();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete access code.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-slate-900 text-white rounded-2xl p-6">
        <h3 className="text-2xl font-bold">Market Research Platform Access Codes</h3>
        <p className="text-gray-200 mt-2">Manage company access to MR 360 Platform</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Add Company Access</h4>
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            value={newCompanyName}
            onChange={(e) => setNewCompanyName(e.target.value)}
            placeholder="Company Name"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            value={newSecretNumber}
            onChange={(e) => setNewSecretNumber(e.target.value)}
            placeholder="Secret Number"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <button
            onClick={handleAdd}
            className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700"
          >
            Add Access
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Existing Access Codes</h4>
        {loading ? (
          <div className="text-sm text-gray-500">Loading access codes...</div>
        ) : codes.length === 0 ? (
          <div className="text-sm text-gray-500">No access codes available.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-gray-600">Company</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-600">Secret Number</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {codes.map((code) => (
                  <tr key={code._id}>
                    <td className="px-4 py-2">
                      {editingId === code._id ? (
                        <input
                          value={editingCompany}
                          onChange={(e) => setEditingCompany(e.target.value)}
                          className="rounded-md border border-gray-300 px-2 py-1 text-sm w-full"
                        />
                      ) : (
                        code.companyName
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {editingId === code._id ? (
                        <input
                          value={editingSecret}
                          onChange={(e) => setEditingSecret(e.target.value)}
                          className="rounded-md border border-gray-300 px-2 py-1 text-sm w-full"
                        />
                      ) : (
                        code.secretNumber
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        {editingId === code._id ? (
                          <button
                            onClick={() => handleSave(code._id)}
                            disabled={savingId === code._id}
                            className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1 text-white text-xs font-semibold hover:bg-emerald-700"
                          >
                            <Save className="w-3 h-3" />
                            {savingId === code._id ? 'Saving...' : 'Save'}
                          </button>
                        ) : (
                          <button
                            onClick={() => startEditing(code)}
                            className="rounded-md border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                          >
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(code._id)}
                          className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketResearchAccessCodes;
