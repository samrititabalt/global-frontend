import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { FiMessageSquare, FiClock, FiCheckCircle } from 'react-icons/fi';
import { 
  Code, 
  Stethoscope, 
  Headphones, 
  FileText, 
  ShoppingCart, 
  Briefcase, 
  GraduationCap, 
  Home, 
  Palette, 
  Zap, 
  Globe, 
  Settings,
  Sparkles,
  ChevronRight,
  X
} from 'lucide-react';
import { customerAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/axios';

const CustomerDashboard = () => {
  const [services, setServices] = useState([]);
  const [chatSessions, setChatSessions] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedSubService, setSelectedSubService] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedServiceForDetail, setSelectedServiceForDetail] = useState(null);
  const [customRequestModalOpen, setCustomRequestModalOpen] = useState(false);
  const [customRequest, setCustomRequest] = useState('');
  const [submittingCustomRequest, setSubmittingCustomRequest] = useState(false);
  const [hiringCompany, setHiringCompany] = useState(null);
  const [samStudiosAccess, setSamStudiosAccess] = useState([]);
  const [samStudiosServices, setSamStudiosServices] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const availableMinutes = Number(user?.tokenBalance ?? 0);

  const fallbackSamStudiosServices = [
    { key: 'ask_sam', label: 'Ask Sam' },
    { key: 'expense_monitor', label: 'Expense Monitor' },
    { key: 'sams_smart_reports', label: "Sam's Smart Reports" },
    { key: 'sam_reports', label: 'Sam Reports' },
    { key: 'merge_spreadsheets', label: 'Merge Spreadsheets' },
    { key: 'forecasts', label: 'Forecasts' },
    { key: 'risk_fraud', label: 'Risk & Fraud' },
    { key: 'hiring', label: 'Hiring' },
    { key: 'facebook_ads', label: 'Run Facebook Ads' },
    { key: 'resume_builder', label: 'Resume Builder' },
    { key: 'linkedin_helper', label: 'LinkedIn Helper' },
    { key: 'industry_solutions', label: 'Industry Solutions' },
    { key: 'document_converter', label: 'Document Converter & PDF Editor' },
  ];

  const samStudiosRoutes = {
    ask_sam: '/ask-sam',
    expense_monitor: '/solutions/expense-monitor',
    sams_smart_reports: '/solutions/sams-smart-reports',
    sam_reports: '/solutions/sam-reports',
    merge_spreadsheets: '/solutions/merge-spreadsheets',
    forecasts: '/solutions/forecasts',
    risk_fraud: '/solutions/risk-fraud',
    hiring: '/solutions/hiring',
    facebook_ads: '/solutions/facebook-ads',
    resume_builder: '/resume-builder',
    linkedin_helper: '/solutions/linkedin-helper',
    industry_solutions: '/solutions/industry-solutions',
    document_converter: '/solutions/document-converter'
  };

  const subscribedServices = samStudiosAccess
    .filter((entry) => entry.enabled)
    .map((entry) => samStudiosServices.find((service) => service.key === entry.key))
    .filter(Boolean);
  const visibleServices = services.filter((service) => service.name?.toLowerCase().includes('ask sam'));

  // Icon mapping for services
  const getServiceIcon = (serviceName) => {
    const name = serviceName.toLowerCase();
    if (name.includes('it') || name.includes('tech') || name.includes('software') || name.includes('development')) {
      return <Code className="w-8 h-8" />;
    } else if (name.includes('health') || name.includes('medical') || name.includes('care')) {
      return <Stethoscope className="w-8 h-8" />;
    } else if (name.includes('support') || name.includes('customer') || name.includes('service')) {
      return <Headphones className="w-8 h-8" />;
    } else if (name.includes('document') || name.includes('report') || name.includes('data')) {
      return <FileText className="w-8 h-8" />;
    } else if (name.includes('ecommerce') || name.includes('retail') || name.includes('shopping')) {
      return <ShoppingCart className="w-8 h-8" />;
    } else if (name.includes('business') || name.includes('consulting') || name.includes('management')) {
      return <Briefcase className="w-8 h-8" />;
    } else if (name.includes('education') || name.includes('training') || name.includes('learning')) {
      return <GraduationCap className="w-8 h-8" />;
    } else if (name.includes('real estate') || name.includes('property') || name.includes('housing')) {
      return <Home className="w-8 h-8" />;
    } else if (name.includes('design') || name.includes('creative') || name.includes('art')) {
      return <Palette className="w-8 h-8" />;
    } else if (name.includes('marketing') || name.includes('advertising') || name.includes('social')) {
      return <Zap className="w-8 h-8" />;
    } else if (name.includes('travel') || name.includes('tourism') || name.includes('international')) {
      return <Globe className="w-8 h-8" />;
    } else {
      return <Settings className="w-8 h-8" />;
    }
  };

  // Color mapping for service cards - consistent blue for all services
  const getServiceColor = (index) => {
    return { 
      bg: 'bg-gradient-to-br from-blue-500 to-blue-600', 
      icon: 'text-white', 
      text: 'text-blue-900' 
    };
  };

  // Generate short caption from description
  const getShortCaption = (description) => {
    if (!description) return 'Professional service tailored to your needs';
    // Take first sentence or first 80 characters
    const firstSentence = description.split('.')[0];
    if (firstSentence.length <= 80) return firstSentence;
    return description.substring(0, 77) + '...';
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [servicesRes, chatsRes, hiringRes, accessRes] = await Promise.all([
        customerAPI.getServices(),
        customerAPI.getChatSessions(),
        api.get('/hiring-pro/customer/company').catch(() => ({ data: { company: null } })),
        api.get('/customer/sam-studios-access').catch(() => ({ data: { services: [], access: [] } }))
      ]);
      setServices(servicesRes.data.services);
      setChatSessions(chatsRes.data.chatSessions);
      setHiringCompany(hiringRes.data.company || null);
      setSamStudiosServices(accessRes.data.services?.length ? accessRes.data.services : fallbackSamStudiosServices);
      setSamStudiosAccess(accessRes.data.access || []);
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

  const handleOpenDetail = (service, e) => {
    e.stopPropagation();
    setSelectedServiceForDetail(service);
    setDetailModalOpen(true);
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
                <p className="text-3xl font-bold text-gray-900">{visibleServices.length}</p>
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
                  {subscribedServices.map((service) => service.label).join(', ')}
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
              
              {!selectedService ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {visibleServices.map((service, index) => {
                      const colorScheme = getServiceColor(index);
                      const IconComponent = getServiceIcon(service.name);
                      return (
                        <div
                          key={service._id}
                          className="group relative overflow-hidden rounded-2xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-xl bg-white"
                        >
                          <div className={`${colorScheme.bg} p-4 flex items-center justify-between`}>
                            <div className={`${colorScheme.icon} flex items-center gap-3`}>
                              {IconComponent}
                              <h3 className="font-bold text-lg text-white">{service.name}</h3>
                            </div>
                          </div>
                          <div className="p-5">
                            <p className="text-sm text-gray-600 mb-4 min-h-[40px]">
                              {getShortCaption(service.description)}
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleServiceSelect(service)}
                                className="flex-1 bg-gray-900 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-all text-sm flex items-center justify-center gap-2"
                              >
                                Select
                                <ChevronRight className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => handleOpenDetail(service, e)}
                                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all text-sm"
                              >
                                Detail
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Custom Request Button */}
                  <button
                    onClick={() => setCustomRequestModalOpen(true)}
                    className="w-full p-6 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white font-bold text-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 group"
                  >
                    <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                    Can't Find Your Service? Create Your Own
                    <Sparkles className="w-6 h-6 group-hover:-rotate-12 transition-transform" />
                  </button>
                </>
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

      {/* Detail Modal */}
      {detailModalOpen && selectedServiceForDetail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className={`${getServiceColor(services.findIndex((s) => s._id === selectedServiceForDetail._id)).bg} p-6 text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-xl">
                    {getServiceIcon(selectedServiceForDetail.name)}
                  </div>
                  <h2 className="text-2xl font-bold">{selectedServiceForDetail.name}</h2>
                </div>
                <button
                  onClick={() => setDetailModalOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  {selectedServiceForDetail.description || 'No description available.'}
                </p>
              </div>
              {selectedServiceForDetail.subServices && selectedServiceForDetail.subServices.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Available Sub-Services</h3>
                  <div className="space-y-2">
                    {selectedServiceForDetail.subServices.map((subService, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="font-semibold text-gray-900">{subService.name}</h4>
                        {subService.description && (
                          <p className="text-sm text-gray-600 mt-1">{subService.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setDetailModalOpen(false);
                    handleServiceSelect(selectedServiceForDetail);
                  }}
                  className="flex-1 bg-gray-900 text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-800 transition-all"
                >
                  Select This Service
                </button>
                <button
                  onClick={() => setDetailModalOpen(false)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
