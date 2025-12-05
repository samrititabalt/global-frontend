import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/axios';

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
    subServices: []
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await api.get('/admin/services');
      setServices(response.data.services);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        isActive: formData.isActive,
        // Filter out empty sub-services
        subServices: (formData.subServices || []).filter(
          (s) => s.name && s.name.trim() !== ''
        )
      };

      if (editingService) {
        await api.put(`/admin/services/${editingService._id}`, payload);
      } else {
        await api.post('/admin/services', payload);
      }
      setShowModal(false);
      setEditingService(null);
      setFormData({ name: '', description: '', isActive: true, subServices: [] });
      loadServices();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save service');
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      isActive: service.isActive,
      subServices: service.subServices || []
    });
    setShowModal(true);
  };

  const handleDelete = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await api.delete(`/admin/services/${serviceId}`);
        loadServices();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete service');
      }
    }
  };

  return (
    <Layout title="Manage Services">
      <div className="mb-4">
        <button
          onClick={() => {
            setEditingService(null);
            setFormData({ name: '', description: '', isActive: true, subServices: [] });
            setShowModal(true);
          }}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          Add New Service
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sub-Services</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {services.map((service) => (
              <tr key={service._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {service.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {service.description || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {service.subServices && service.subServices.length > 0 ? (
                    <div className="space-y-1">
                      <p className="font-medium">
                        {service.subServices.length} sub-service
                        {service.subServices.length > 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-gray-400 truncate max-w-xs">
                        {service.subServices.map((s) => s.name).join(', ')}
                      </p>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">No sub-services</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    service.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {service.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(service)}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(service._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows="3"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="mr-2"
                />
                <label className="text-sm text-gray-700">Active</label>
              </div>
              {/* Sub-Services CRUD inside Service modal */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Sub-Services
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        subServices: [
                          ...(prev.subServices || []),
                          { name: '', description: '' }
                        ]
                      }))
                    }
                    className="text-xs text-primary-600 hover:text-primary-800 font-semibold"
                  >
                    + Add Sub-Service
                  </button>
                </div>
                {(!formData.subServices || formData.subServices.length === 0) && (
                  <p className="text-xs text-gray-400 mb-2">
                    No sub-services yet. Click &quot;Add Sub-Service&quot; to create one.
                  </p>
                )}
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {(formData.subServices || []).map((sub, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                    >
                      <div className="flex items-start space-x-2">
                        <div className="flex-1 space-y-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Name
                            </label>
                            <input
                              type="text"
                              value={sub.name}
                              onChange={(e) =>
                                setFormData((prev) => {
                                  const updated = [...(prev.subServices || [])];
                                  updated[index] = {
                                    ...updated[index],
                                    name: e.target.value
                                  };
                                  return { ...prev, subServices: updated };
                                })
                              }
                              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                              placeholder="Sub-service name"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Description (optional)
                            </label>
                            <textarea
                              value={sub.description || ''}
                              onChange={(e) =>
                                setFormData((prev) => {
                                  const updated = [...(prev.subServices || [])];
                                  updated[index] = {
                                    ...updated[index],
                                    description: e.target.value
                                  };
                                  return { ...prev, subServices: updated };
                                })
                              }
                              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                              rows="2"
                              placeholder="Short description"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              subServices: (prev.subServices || []).filter(
                                (_, i) => i !== index
                              )
                            }))
                          }
                          className="text-xs text-red-600 hover:text-red-800 ml-1"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingService(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminServices;

