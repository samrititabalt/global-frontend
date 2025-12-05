import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/axios';

const AdminSubServices = () => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

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

  const handleAddSubService = (service) => {
    setSelectedService(service);
    setFormData({ name: '', description: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedService) return;

    try {
      const updatedSubServices = [
        ...(selectedService.subServices || []),
        { name: formData.name, description: formData.description }
      ];

      await api.put(`/admin/services/${selectedService._id}`, {
        subServices: updatedSubServices
      });

      setShowModal(false);
      loadServices();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add sub-service');
    }
  };

  const handleDeleteSubService = async (serviceId, subServiceIndex) => {
    if (window.confirm('Are you sure you want to delete this sub-service?')) {
      try {
        const service = services.find(s => s._id === serviceId);
        const updatedSubServices = service.subServices.filter((_, index) => index !== subServiceIndex);

        await api.put(`/admin/services/${serviceId}`, {
          subServices: updatedSubServices
        });

        loadServices();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete sub-service');
      }
    }
  };

  return (
    <Layout title="Manage Sub-Services">
      <div className="space-y-4">
        {services.map((service) => (
          <div key={service._id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{service.name}</h3>
              <button
                onClick={() => handleAddSubService(service)}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 text-sm"
              >
                Add Sub-Service
              </button>
            </div>
            <div className="space-y-2">
              {service.subServices && service.subServices.length > 0 ? (
                service.subServices.map((subService, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{subService.name}</p>
                      {subService.description && (
                        <p className="text-sm text-gray-600">{subService.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteSubService(service._id, index)}
                      className="text-red-600 hover:text-red-900 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No sub-services</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              Add Sub-Service to {selectedService.name}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sub-Service Name
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
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminSubServices;

