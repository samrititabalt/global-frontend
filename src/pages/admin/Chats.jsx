import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/axios';

const AdminChats = () => {
  const [chats, setChats] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [chatsRes, agentsRes] = await Promise.all([
        api.get('/admin/chats'),
        api.get('/admin/agents')
      ]);
      setChats(chatsRes.data.chats);
      setAgents(agentsRes.data.agents);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = (chat) => {
    setSelectedChat(chat);
    setSelectedAgent('');
    setShowTransferModal(true);
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/admin/chats/${selectedChat._id}/transfer`, {
        agentId: selectedAgent
      });
      setShowTransferModal(false);
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to transfer chat');
    }
  };

  return (
    <Layout title="Chat Monitoring">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {chats.map((chat) => (
              <tr key={chat._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {chat.customer?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {chat.agent?.name || 'Unassigned'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {chat.service?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    chat.status === 'active' ? 'bg-green-100 text-green-800' :
                    chat.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    chat.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {chat.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {chat.agent && (
                    <button
                      onClick={() => handleTransfer(chat)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      Transfer
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Transfer Modal */}
      {showTransferModal && selectedChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Transfer Chat</h2>
            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select New Agent
                </label>
                <select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select an agent</option>
                  {agents
                    .filter(agent => agent._id !== selectedChat.agent?._id)
                    .map((agent) => (
                      <option key={agent._id} value={agent._id}>
                        {agent.name} - {agent.serviceCategory?.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminChats;

