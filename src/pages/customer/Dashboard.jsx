import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { FiMessageSquare, FiClock, FiCheckCircle } from 'react-icons/fi';
import { Sparkles, X, Search } from 'lucide-react';
import { customerAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/axios';
import hrServices from '../../data/hrServices';

const CustomerDashboard = () => {
  const [services, setServices] = useState([]);
  const [chatSessions, setChatSessions] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedSubService, setSelectedSubService] = useState('');
  const [loading, setLoading] = useState(true);
  const [customRequestModalOpen, setCustomRequestModalOpen] = useState(false);
  const [customRequest, setCustomRequest] = useState('');
  const [submittingCustomRequest, setSubmittingCustomRequest] = useState(false);
  const [serviceSearch, setServiceSearch] = useState('');
  const [openService, setOpenService] = useState(hrServices[0]?.name || null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const availableMinutes = Number(user?.tokenBalance ?? 0);

  const subscribedServices = useMemo(() => {
    const seedSource = user?._id || user?.email || 'default';
    let seed = 0;
    for (let i = 0; i < seedSource.length; i += 1) {
      seed = (seed * 31 + seedSource.charCodeAt(i)) % 1000000007;
    }
    const count = 2 + (seed % 2);
    let randomState = seed || 1;
    const random = () => {
      randomState = (randomState * 48271) % 2147483647;
      return randomState / 2147483647;
    };
    const shuffled = [...hrServices].sort(() => random() - 0.5);
    return shuffled.slice(0, count).map((service) => service.name);
  }, [user?._id, user?.email]);

  const filteredServices = useMemo(() => {
    const term = serviceSearch.trim().toLowerCase();
    if (!term) {
      return hrServices.map((service) => ({
        ...service,
        filteredSubServices: service.subServices
      }));
    }
    return hrServices
      .map((service) => {
        const serviceMatch = service.name.toLowerCase().includes(term);
        const subMatches = service.subServices.filter((sub) =>
          sub.toLowerCase().includes(term)
        );
        if (serviceMatch) {
          return { ...service, filteredSubServices: service.subServices };
        }
        if (subMatches.length > 0) {
          return { ...service, filteredSubServices: subMatches };
        }
        return null;
      })
      .filter(Boolean);
  }, [serviceSearch]);

  const askSamService = useMemo(
    () => services.find((service) => service.name?.toLowerCase().includes('ask sam')),
    [services]
  );

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

  const handleServiceSelect = (serviceName, subServiceName) => {
    setSelectedService(serviceName);
    setSelectedSubService(subServiceName);
    setOpenService(serviceName);
  };

  const handleRequestService = async () => {
    if (!selectedService || !selectedSubService) {
      alert('Please select a service and sub-service');
      return;
    }
    if (!askSamService?._id) {
      alert('Services are still loading. Please try again in a moment.');
      return;
    }

    try {
      const response = await customerAPI.requestService({
        serviceId: askSamService._id,
        subService: `${selectedService} — ${selectedSubService}`
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

  const handleSubmitCustomRequest = async () => {
    if (!customRequest.trim()) {
      alert('Please enter your custom service request');
      return;
    }

    setSubmittingCustomRequest(true);
    try {
      // Send custom request to admin
      const response = await api.post('/customer/custom-service-request', {
        requestDetails: customRequest,
        customerName: user?.name || 'Unknown',
        customerEmail: user?.email || 'Unknown',
        plan: user?.currentPlan ? user.currentPlan.toString() : 'No plan',
        tokenBalance: availableMinutes
      });

      if (response.data.success) {
        alert('Your custom service request has been submitted! An admin will review it shortly.');
        setCustomRequest('');
        setCustomRequestModalOpen(false);
      } else {
        alert(response.data.message || 'Failed to submit request. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting custom request:', error);
      alert(error.response?.data?.message || 'Failed to submit request. Please try again.');
    } finally {
      setSubmittingCustomRequest(false);
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
            <p className="text-sm uppercase tracking-[0.3em] text-blue-200 font-semibold">Overview</p>
            <h2 className="text-4xl font-bold mt-3 mb-4">Service minutes available</h2>
            <div className="text-5xl font-extrabold tracking-tight">
              {availableMinutes.toLocaleString()} min
            </div>
            <p className="mt-4 text-gray-200 max-w-2xl">
              Request a service and connect with your dedicated team instantly. Running low on minutes?
              You can top up anytime with a new plan.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => document.getElementById('service-selection')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-6 py-3 rounded-full bg-white text-gray-900 font-semibold hover:bg-gray-100 transition"
              >
                Request a service
              </button>
              <Link
                to="/customer/plans"
                className="px-6 py-3 rounded-full border border-white/40 text-white font-semibold hover:bg-white/10 transition"
              >
                Add more minutes
              </Link>
            </div>
          </div>
          <div className="bg-white/80 border border-white/60 rounded-3xl p-6 shadow-xl backdrop-blur">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-[0.3em]">Quick stats</p>
            <div className="mt-6 space-y-4">
              <div>
                <p className="text-3xl font-bold text-gray-900">{hrServices.length}</p>
                <p className="text-sm text-gray-500">Services available</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{chatSessions.length}</p>
                <p className="text-sm text-gray-500">Chat sessions</p>
              </div>
            </div>
            <div className="mt-6 border-t border-gray-200 pt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-[0.2em]">Subscribed Services</p>
              {subscribedServices.length ? (
                <p className="mt-2 text-sm text-gray-700">
                  {subscribedServices.join(', ')}
                </p>
              ) : (
                <p className="mt-2 text-sm text-gray-500">No active subscriptions yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Service Selection */}
          <div id="service-selection" className="lg:col-span-2">
            <div className="bg-white/80 rounded-3xl shadow-xl border border-white/60 p-8 backdrop-blur">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Request a Service</h2>

              <div className="mb-6 flex flex-col md:flex-row md:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                    placeholder="Search HR services or sub-services"
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setCustomRequestModalOpen(true)}
                  className="px-5 py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition"
                >
                  Custom request
                </button>
              </div>

              {filteredServices.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  No matching services found. Try a different search.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredServices.map((service) => {
                    const isOpen = openService === service.name;
                    return (
                      <div
                        key={service.name}
                        className="rounded-2xl border border-gray-200 bg-white"
                      >
                        <button
                          type="button"
                          onClick={() => setOpenService(isOpen ? null : service.name)}
                          className="w-full flex items-center justify-between px-6 py-5 text-left"
                        >
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {service.name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {service.filteredSubServices.length} sub-service
                              {service.filteredSubServices.length > 1 ? 's' : ''}
                            </p>
                          </div>
                          <span className="text-gray-400 text-2xl leading-none">
                            {isOpen ? '−' : '+'}
                          </span>
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {service.filteredSubServices.map((subService) => {
                                const isSelected =
                                  selectedService === service.name &&
                                  selectedSubService === subService;
                                return (
                                  <button
                                    key={subService}
                                    type="button"
                                    onClick={() => handleServiceSelect(service.name, subService)}
                                    className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition ${
                                      isSelected
                                        ? 'border-primary-500 bg-primary-50'
                                        : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                                    }`}
                                  >
                                    <span className={`mt-1 h-2 w-2 rounded-full ${
                                      isSelected ? 'bg-primary-500' : 'bg-gray-300'
                                    }`}></span>
                                    <span className="text-sm text-gray-700">{subService}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-6 border-t border-gray-200 pt-5">
                <p className="text-sm text-gray-600">Selected service</p>
                {selectedService && selectedSubService ? (
                  <p className="text-base font-semibold text-gray-900 mt-2">
                    {selectedService} — {selectedSubService}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 mt-2">
                    Choose a service and sub-service to continue.
                  </p>
                )}
              </div>

              <button
                onClick={handleRequestService}
                disabled={!selectedService || !selectedSubService}
                className={`w-full mt-6 py-4 px-6 rounded-xl font-semibold transition-all shadow-lg ${
                  selectedService && selectedSubService
                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                Start Chat
              </button>
            </div>
          </div>

          {/* Chat History */}
          <div className="bg-white/80 rounded-3xl shadow-xl border border-white/60 p-8 backdrop-blur">
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

      {/* Custom Request Modal */}
      {customRequestModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full">
            <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 p-6 text-white rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6" />
                  <h2 className="text-2xl font-bold">Create Your Own Service</h2>
                </div>
                <button
                  onClick={() => setCustomRequestModalOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Can't find what you're looking for? Tell us about your custom service request and we'll get back to you!
              </p>
              <textarea
                value={customRequest}
                onChange={(e) => setCustomRequest(e.target.value)}
                placeholder="Describe your custom service request in detail..."
                className="w-full p-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 min-h-[150px] resize-y"
              />
              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleSubmitCustomRequest}
                  disabled={submittingCustomRequest || !customRequest.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingCustomRequest ? 'Submitting...' : 'Submit Request'}
                </button>
                <button
                  onClick={() => setCustomRequestModalOpen(false)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default CustomerDashboard;
