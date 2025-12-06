import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { FiMessageSquare, FiClock, FiCheckCircle } from 'react-icons/fi';
import { customerAPI } from '../../services/api';

const CustomerDashboard = () => {
  const [services, setServices] = useState([]);
  const [chatSessions, setChatSessions] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedSubService, setSelectedSubService] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [servicesRes, chatsRes] = await Promise.all([
        customerAPI.getServices(),
        customerAPI.getChatSessions()
      ]);
      setServices(servicesRes.data.services);
      setChatSessions(chatsRes.data.chatSessions);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setSelectedSubService('');
  };

  const handleRequestService = async () => {
    if (!selectedService) return;
    if (selectedService.subServices.length > 0 && !selectedSubService) {
      alert('Please select a sub-service');
      return;
    }

    try {
      const response = await customerAPI.requestService({
        serviceId: selectedService._id,
        subService: selectedSubService
      });

      if (response.data.success) {
        navigate(`/customer/chat/${response.data.chatSession._id}`);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to request service');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-accent-100 text-accent-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-800"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Customer Dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Service Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Request a Service</h2>
              
              {!selectedService ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <button
                      key={service._id}
                      onClick={() => handleServiceSelect(service)}
                      className="p-6 border-2 border-gray-200 rounded-xl hover:border-primary-800 hover:bg-gray-50 transition-all text-left group"
                    >
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-800 transition-colors">{service.name}</h3>
                      <p className="text-sm text-gray-600">{service.description}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <div>
                  <div className="mb-6">
                    <button
                      onClick={() => {
                        setSelectedService(null);
                        setSelectedSubService('');
                      }}
                      className="text-primary-800 hover:text-primary-900 font-medium mb-4 flex items-center transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back to services
                    </button>
                    <h3 className="text-xl font-bold text-gray-900">{selectedService.name}</h3>
                  </div>

                  {selectedService.subServices.length > 0 ? (
                    <div className="space-y-3 mb-6">
                      {selectedService.subServices.map((subService, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedSubService(subService.name)}
                          className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                            selectedSubService === subService.name
                              ? 'border-primary-800 bg-primary-50'
                              : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                          }`}
                        >
                          <span className="font-semibold text-gray-900">{subService.name}</span>
                          {subService.description && (
                            <p className="text-sm text-gray-600 mt-1">{subService.description}</p>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : null}

                  <button
                    onClick={handleRequestService}
                    className="w-full bg-gray-900 text-white py-4 px-6 rounded-xl hover:bg-gray-800 font-semibold transition-all shadow-lg hover:shadow-xl"
                  >
                    Start Chat
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Chat History */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Chat History</h2>
            <div className="space-y-3">
              {chatSessions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No chat history</p>
              ) : (
                chatSessions.map((chat) => (
                  <div
                    key={chat._id}
                    onClick={() => navigate(`/customer/chat/${chat._id}`)}
                    className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-primary-300 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm text-gray-900">{chat.service?.name}</span>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(chat.status)}`}>
                        {chat.status}
                      </span>
                    </div>
                    {chat.agent && (
                      <p className="text-xs text-gray-600 mt-1">Agent: {chat.agent.name}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CustomerDashboard;

