import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { FiMessageSquare, FiClock, FiCheckCircle } from 'react-icons/fi';
import { customerAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CustomerDashboard = () => {
  const [services, setServices] = useState([]);
  const [chatSessions, setChatSessions] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedSubService, setSelectedSubService] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const availableMinutes = Number(user?.tokenBalance ?? 0);
  
  // Get current plan info
  const currentPlan = user?.currentPlan;
  const planStatus = user?.planStatus;

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
      // Handle case when all agents are offline
      if (error.response?.status === 503 && error.response?.data?.allAgentsOffline) {
        // Show friendly message - don't show technical error
        alert('All agents are currently offline. We\'ve notified the team and someone will be with you shortly.');
      } else {
        alert(error.response?.data?.message || 'Failed to request service. Please try again later.');
      }
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
      <div className="space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gradient-to-r from-gray-900 via-gray-800 to-blue-900 text-white rounded-3xl p-8 shadow-2xl">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-blue-200 font-semibold">Overview</p>
                <h2 className="text-4xl font-bold mt-3 mb-4">Service minutes available</h2>
              </div>
              {currentPlan && (
                <div className="text-right">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                    planStatus === 'approved' 
                      ? 'bg-green-500/20 text-green-200 border border-green-400/50' 
                      : planStatus === 'pending'
                      ? 'bg-yellow-500/20 text-yellow-200 border border-yellow-400/50'
                      : planStatus === 'expired'
                      ? 'bg-red-500/20 text-red-200 border border-red-400/50'
                      : 'bg-gray-500/20 text-gray-200 border border-gray-400/50'
                  }`}>
                    {currentPlan.name || 'Plan Active'}
                  </span>
                  {planStatus && (
                    <p className="text-xs text-gray-300 mt-1 capitalize">{planStatus}</p>
                  )}
                </div>
              )}
            </div>
            <div className="text-5xl font-extrabold tracking-tight mb-4">
              {availableMinutes.toLocaleString()} min
            </div>
            <p className="mt-4 text-gray-200 max-w-2xl">
              Request a service and connect with your dedicated team instantly. Running low on minutes?
              You can top up anytime with a new plan.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => document.getElementById('service-selection')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-6 py-3 rounded-full bg-white text-gray-900 font-semibold hover:bg-gray-100 transition shadow-lg"
              >
                Request a service
              </button>
              <Link
                to="/customer/plans"
                className="px-6 py-3 rounded-full border border-white/40 text-white font-semibold hover:bg-white/10 transition"
              >
                {currentPlan ? 'Upgrade Plan' : 'Add more minutes'}
              </Link>
            </div>
          </div>
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xl hover:shadow-2xl transition-shadow">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-[0.3em] mb-6">Quick stats</p>
            <div className="space-y-6">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <p className="text-3xl font-bold text-gray-900 mb-1">{services.length}</p>
                <p className="text-sm text-gray-600 font-medium">Services available</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <p className="text-3xl font-bold text-gray-900 mb-1">{chatSessions.length}</p>
                <p className="text-sm text-gray-600 font-medium">Chat sessions</p>
              </div>
              {currentPlan && (
                <div className="pt-4 border-t-2 border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Current Plan</p>
                  <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                    <p className="text-lg font-bold text-gray-900 mb-1">{currentPlan.name}</p>
                    {currentPlan.tokens && (
                      <p className="text-xs text-gray-600 font-medium">{currentPlan.tokens.toLocaleString()} minutes included</p>
                    )}
                    {currentPlan.price && (
                      <p className="text-xs text-gray-500 mt-1">${currentPlan.price}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Service Selection */}
          <div id="service-selection" className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Request a Service</h2>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Select a service to start</p>
                </div>
              </div>
              
              {!selectedService ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <button
                      key={service._id}
                      onClick={() => handleServiceSelect(service)}
                      className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left group shadow-sm hover:shadow-md"
                    >
                      <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">{service.name}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{service.description || 'Click to select this service'}</p>
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
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Chat History</h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
              {chatSessions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FiMessageSquare className="text-gray-400 w-8 h-8" />
                  </div>
                  <p className="text-gray-500 font-medium">No chat history</p>
                  <p className="text-xs text-gray-400 mt-1">Your conversations will appear here</p>
                </div>
              ) : (
                chatSessions.map((chat) => (
                  <div
                    key={chat._id}
                    onClick={() => navigate(`/customer/chat/${chat._id}`)}
                    className="p-4 border-2 border-gray-100 rounded-xl hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-gray-900 group-hover:text-blue-700 transition-colors">{chat.service?.name || 'Service'}</span>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(chat.status)}`}>
                        {chat.status}
                      </span>
                    </div>
                    {chat.agent && (
                      <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        Agent: {chat.agent.name}
                      </p>
                    )}
                    {chat.unreadCount > 0 && (
                      <div className="mt-2">
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {chat.unreadCount} new
                        </span>
                      </div>
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

