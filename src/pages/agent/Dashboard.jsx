import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { FiMessageSquare, FiClock, FiCheckCircle, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import api from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';

const AgentDashboard = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState({
    pendingRequests: [],
    activeChats: [],
    completedCases: []
  });
  const [agentInfo, setAgentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(user?.isOnline || false);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await api.get('/agent/dashboard');
      setDashboard(response.data.dashboard);
      if (response.data.agent) {
        setAgentInfo(response.data.agent);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (chatId) => {
    try {
      await api.post(`/agent/accept-request/${chatId}`);
      loadDashboard();
      navigate(`/agent/chat/${chatId}`);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to accept request');
    }
  };

  const handleToggleStatus = async () => {
    try {
      const newStatus = !isOnline;
      await api.put('/agent/status', { isOnline: newStatus, isAvailable: newStatus });
      setIsOnline(newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleCompleteChat = async (chatId) => {
    try {
      await api.post(`/agent/complete-chat/${chatId}`);
      loadDashboard();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to complete chat');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Agent Dashboard">
      <div className="space-y-8">
        {/* Agent Info Header */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-blue-900 text-white rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-blue-200 font-semibold">Agent Profile</p>
                  <h2 className="text-3xl font-bold mt-2">{user?.name || 'Agent'}</h2>
                </div>
                {(agentInfo?.serviceCategory || user?.serviceCategory) && (
                  <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold border border-white/30 flex items-center gap-2">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                    {(agentInfo?.serviceCategory?.name || user?.serviceCategory?.name) || 'General'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                  isOnline ? 'bg-green-500/20 border border-green-400/50' : 'bg-gray-500/20 border border-gray-400/50'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                  <span className="text-sm font-medium">{isOnline ? 'Online' : 'Offline'}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleToggleStatus}
              className={`flex items-center justify-center gap-3 px-6 py-3 rounded-full text-base font-semibold transition shadow-lg ${
                isOnline
                  ? 'bg-white text-gray-900 hover:bg-gray-100'
                  : 'bg-blue-600 text-white hover:bg-blue-500'
              }`}
            >
              {isOnline ? <FiToggleRight className="h-6 w-6" /> : <FiToggleLeft className="h-6 w-6" />}
              <span>{isOnline ? 'Go Offline' : 'Go Online'}</span>
            </button>
          </div>
          <p className="text-gray-200 mt-4 max-w-2xl">
            Stay online to instantly accept pending requests and keep chats moving. Toggle your availability at any time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Requests */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center space-x-2 text-gray-900">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FiClock className="text-yellow-600 w-5 h-5" />
              </div>
              <span>Pending Requests</span>
            </h2>
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
              {dashboard.pendingRequests.length}
            </span>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
            {dashboard.pendingRequests.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiClock className="text-gray-400 w-8 h-8" />
                </div>
                <p className="text-gray-500 font-medium">No pending requests</p>
                <p className="text-xs text-gray-400 mt-1">New requests will appear here</p>
              </div>
            ) : (
              dashboard.pendingRequests.map((request) => (
                <div
                  key={request._id}
                  className="p-4 border-2 border-gray-100 rounded-xl hover:border-yellow-300 hover:bg-yellow-50/50 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1">{request.customer?.name || 'Customer'}</p>
                      <p className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-md inline-block">
                        {request.service?.name || 'Service'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAcceptRequest(request._id)}
                    className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-2.5 px-4 rounded-lg text-sm font-semibold hover:from-gray-800 hover:to-gray-700 transition-all shadow-md hover:shadow-lg"
                  >
                    Accept Request
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Chats */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center space-x-2 text-gray-900">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiMessageSquare className="text-green-600 w-5 h-5" />
              </div>
              <span>Active Chats</span>
            </h2>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
              {dashboard.activeChats.length}
            </span>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
            {dashboard.activeChats.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiMessageSquare className="text-gray-400 w-8 h-8" />
                </div>
                <p className="text-gray-500 font-medium">No active chats</p>
                <p className="text-xs text-gray-400 mt-1">Your active conversations will appear here</p>
              </div>
            ) : (
              dashboard.activeChats.map((chat) => (
                <div
                  key={chat._id}
                  className="p-4 border-2 border-gray-100 rounded-xl hover:border-green-300 hover:bg-green-50/50 cursor-pointer transition-all group"
                  onClick={() => {
                    navigate(`/agent/chat/${chat._id}`);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1 group-hover:text-green-700 transition-colors">
                        {chat.customer?.name || 'Customer'}
                      </p>
                      <p className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-md inline-block">
                        {chat.service?.name || 'Service'}
                      </p>
                    </div>
                    {chat.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Completed Cases */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center space-x-2 text-gray-900">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiCheckCircle className="text-blue-600 w-5 h-5" />
              </div>
              <span>Completed Cases</span>
            </h2>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
              {dashboard.completedCases.length}
            </span>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
            {dashboard.completedCases.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiCheckCircle className="text-gray-400 w-8 h-8" />
                </div>
                <p className="text-gray-500 font-medium">No completed cases</p>
                <p className="text-xs text-gray-400 mt-1">Completed chats will appear here</p>
              </div>
            ) : (
              dashboard.completedCases.map((case_) => (
                <div
                  key={case_._id}
                  className="p-4 border-2 border-gray-100 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all"
                >
                  <p className="font-semibold text-gray-900 mb-1">{case_.customer?.name || 'Customer'}</p>
                  <p className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-md inline-block">
                    {case_.service?.name || 'Service'}
                  </p>
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

export default AgentDashboard;

