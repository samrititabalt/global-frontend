import React, { useEffect, useMemo, useState } from 'react';
import api from '../../utils/axios';
import { RefreshCw, XCircle, Save } from 'lucide-react';

const UserAccessCodes = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [draftCodes, setDraftCodes] = useState({});

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/admin/access-codes');
      setUsers(response.data.users || []);
      const initialDrafts = {};
      (response.data.users || []).forEach((user) => {
        initialDrafts[user.id] = user.accessCode || '';
      });
      setDraftCodes(initialDrafts);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const searchLower = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesType = filterType === 'all' || user.type === filterType;
      if (!matchesType) return false;
      if (!searchLower) return true;
      return (
        user.name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.accessCode?.toLowerCase().includes(searchLower) ||
        user.id?.toLowerCase().includes(searchLower) ||
        user.type?.toLowerCase().includes(searchLower)
      );
    });
  }, [users, search, filterType]);

  const updateLocalUser = (updatedUser) => {
    setUsers((prev) => prev.map((user) => (user.id === updatedUser.id ? { ...user, ...updatedUser } : user)));
    setDraftCodes((prev) => ({ ...prev, [updatedUser.id]: updatedUser.accessCode || '' }));
  };

  const handleSave = async (user) => {
    const newCode = (draftCodes[user.id] || '').trim();
    setSavingId(user.id);
    setError('');
    try {
      const response = await api.put(`/admin/access-codes/${user.type}/${user.id}`, {
        action: 'set',
        accessCode: newCode
      });
      if (response.data?.user) {
        updateLocalUser(response.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update access code');
    } finally {
      setSavingId(null);
    }
  };

  const handleRegenerate = async (user) => {
    setSavingId(user.id);
    setError('');
    try {
      const response = await api.put(`/admin/access-codes/${user.type}/${user.id}`, {
        action: 'regenerate'
      });
      if (response.data?.user) {
        updateLocalUser(response.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to regenerate access code');
    } finally {
      setSavingId(null);
    }
  };

  const handleRevoke = async (user) => {
    setSavingId(user.id);
    setError('');
    try {
      const response = await api.put(`/admin/access-codes/${user.type}/${user.id}`, {
        action: 'revoke'
      });
      if (response.data?.user) {
        updateLocalUser(response.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to revoke access code');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="bg-white/90 rounded-3xl shadow-xl border border-white/60 p-6 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">User Access Codes (5-Digit Login IDs)</h2>
          <p className="text-sm text-gray-600 mt-1">Manage 5-digit access codes for employees, agents, and customers.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, role, or ID"
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm"
          >
            <option value="all">All Users</option>
            <option value="customer">Customers</option>
            <option value="agent">Agents</option>
            <option value="employee">Employees</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-gray-600">Loading access codes...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/70">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Access Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3 text-sm text-gray-900">{user.name || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.email || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">{user.type}</td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={draftCodes[user.id] || ''}
                      onChange={(e) => setDraftCodes((prev) => ({ ...prev, [user.id]: e.target.value }))}
                      maxLength={5}
                      className="w-28 px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-700"
                      placeholder="00000"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleSave(user)}
                        disabled={savingId === user.id}
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-blue-700 disabled:opacity-60"
                      >
                        <Save className="w-3 h-3" />
                        Save
                      </button>
                      <button
                        onClick={() => handleRegenerate(user)}
                        disabled={savingId === user.id}
                        className="inline-flex items-center gap-1 rounded-lg bg-gray-100 text-gray-700 px-3 py-1.5 text-xs font-semibold hover:bg-gray-200 disabled:opacity-60"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Regenerate
                      </button>
                      <button
                        onClick={() => handleRevoke(user)}
                        disabled={savingId === user.id}
                        className="inline-flex items-center gap-1 rounded-lg bg-gray-100 text-gray-700 px-3 py-1.5 text-xs font-semibold hover:bg-gray-200 disabled:opacity-60"
                      >
                        <XCircle className="w-3 h-3" />
                        Revoke
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-sm text-gray-500 text-center">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserAccessCodes;
