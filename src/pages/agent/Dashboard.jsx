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
      {/* Status Toggle */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Online Status</h3>
            <p className="text-sm text-gray-600">
              {isOnline ? 'You are online and available' : 'You are offline'}
            </p>
          </div>
          <button
            onClick={handleToggleStatus}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isOnline
                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {isOnline ? <FiToggleRight className="h-6 w-6" /> : <FiToggleLeft className="h-6 w-6" />}
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Requests */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center space-x-2">
              <FiClock className="text-yellow-600" />
              <span>Pending Requests</span>
            </h2>
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">
              {dashboard.pendingRequests.length}
            </span>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {dashboard.pendingRequests.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No pending requests</p>
            ) : (
              dashboard.pendingRequests.map((request) => (
                <div
                  key={request._id}
                  className="p-3 border border-gray-200 rounded-lg"
                >
                  <p className="font-medium text-sm mb-1">{request.customer?.name}</p>
                  <p className="text-xs text-gray-600 mb-2">{request.service?.name}</p>
                  <button
                    onClick={() => handleAcceptRequest(request._id)}
                    className="w-full bg-primary-600 text-white py-1 px-3 rounded text-sm hover:bg-primary-700"
                  >
                    Accept
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Chats */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center space-x-2">
              <FiMessageSquare className="text-green-600" />
              <span>Active Chats</span>
            </h2>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
              {dashboard.activeChats.length}
            </span>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {dashboard.activeChats.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No active chats</p>
            ) : (
              dashboard.activeChats.map((chat) => (
                <div
                  key={chat._id}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/agent/chat/${chat._id}`)}
                >
                  <p className="font-medium text-sm mb-1">{chat.customer?.name}</p>
                  <p className="text-xs text-gray-600">{chat.service?.name}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Completed Cases */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center space-x-2">
              <FiCheckCircle className="text-blue-600" />
              <span>Completed Cases</span>
            </h2>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
              {dashboard.completedCases.length}
            </span>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {dashboard.completedCases.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No completed cases</p>
            ) : (
              dashboard.completedCases.map((case_) => (
                <div
                  key={case_._id}
                  className="p-3 border border-gray-200 rounded-lg"
                >
                  <p className="font-medium text-sm mb-1">{case_.customer?.name}</p>
                  <p className="text-xs text-gray-600">{case_.service?.name}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AgentDashboard;

