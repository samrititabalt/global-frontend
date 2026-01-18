import React, { useEffect, useState } from 'react';
import api from '../../utils/axios';

const SamStudiosAccessCRM = () => {
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});

  const loadData = async () => {
    try {
      const response = await api.get('/admin/sam-studios-access');
      setCustomers(response.data.customers || []);
      setServices(response.data.services || []);
    } catch (error) {
      console.error('Error loading Sam Studios access:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const hasAccess = (customer, serviceKey) => {
    const entry = customer.samStudiosAccess?.find((item) => item.key === serviceKey);
    return !!entry?.enabled;
  };

  const toggleAccess = async (customerId, serviceKey, enabled) => {
    setSaving((prev) => ({ ...prev, [`${customerId}:${serviceKey}`]: true }));
    try {
      await api.put(`/admin/sam-studios-access/${customerId}`, { serviceKey, enabled });
      setCustomers((prev) =>
        prev.map((customer) => {
          if (customer._id !== customerId) return customer;
          const access = Array.isArray(customer.samStudiosAccess) ? [...customer.samStudiosAccess] : [];
          const existing = access.find((item) => item.key === serviceKey);
          if (existing) {
            existing.enabled = enabled;
            existing.updatedAt = new Date().toISOString();
          } else {
            access.push({ key: serviceKey, enabled, updatedAt: new Date().toISOString() });
          }
          return { ...customer, samStudiosAccess: access };
        })
      );
    } catch (error) {
      console.error('Error updating access:', error);
    } finally {
      setSaving((prev) => ({ ...prev, [`${customerId}:${serviceKey}`]: false }));
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-200 border-t-primary-800"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-blue-900 text-white rounded-3xl p-8 shadow-2xl">
        <h2 className="text-3xl font-bold mb-2">Sam Studios Access CRM</h2>
        <p className="text-blue-200">Grant or revoke access to Pro services per customer</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 overflow-x-auto">
        {customers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No customers found.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Customer</th>
                {services.map((service) => (
                  <th key={service.key} className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">
                    {service.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customers.map((customer) => (
                <tr key={customer._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-900">{customer.name}</div>
                    <div className="text-xs text-gray-500">{customer.email}</div>
                  </td>
                  {services.map((service) => {
                    const enabled = hasAccess(customer, service.key);
                    const isSaving = saving[`${customer._id}:${service.key}`];
                    return (
                      <td key={service.key} className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => toggleAccess(customer._id, service.key, !enabled)}
                          disabled={isSaving}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                            enabled
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          } ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                          {enabled ? 'Granted' : 'Grant'}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SamStudiosAccessCRM;
