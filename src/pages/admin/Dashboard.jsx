import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { FiUsers, FiUserCheck, FiBriefcase, FiDollarSign, FiMessageSquare, FiClock, X } from 'react-icons/fi';
import api from '../../utils/axios';

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStat, setSelectedStat] = useState(null);
  const [detailData, setDetailData] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setDashboard(response.data.dashboard);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatClick = async (statType) => {
    setSelectedStat(statType);
    setLoadingDetails(true);
    setDetailData([]);

    try {
      let response;
      switch (statType) {
        case 'customers':
          response = await api.get('/admin/customers');
          setDetailData(response.data.customers || []);
          break;
        case 'agents':
          response = await api.get('/admin/agents');
          setDetailData(response.data.agents || []);
          break;
        case 'services':
          response = await api.get('/admin/services');
          setDetailData(response.data.services || []);
          break;
        case 'pendingTransactions':
          response = await api.get('/admin/transactions');
          const allTransactions = response.data.transactions || [];
          setDetailData(allTransactions.filter(t => t.status === 'pending'));
          break;
        case 'activeChats':
          response = await api.get('/admin/chats');
          const allChats = response.data.chats || [];
          setDetailData(allChats.filter(c => c.status === 'active'));
          break;
        case 'transactions':
          response = await api.get('/admin/transactions');
          setDetailData(response.data.transactions || []);
          break;
        default:
          setDetailData([]);
      }
    } catch (error) {
      console.error('Error loading details:', error);
      alert('Failed to load details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const getStatTitle = (statType) => {
    const titles = {
      customers: 'Customers',
      agents: 'Agents',
      services: 'Services',
      pendingTransactions: 'Pending Transactions',
      activeChats: 'Active Chats',
      transactions: 'All Transactions'
    };
    return titles[statType] || statType;
  };

  const renderDetailContent = () => {
    if (loadingDetails) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      );
    }

    if (detailData.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No data available
        </div>
      );
    }

    switch (selectedStat) {
      case 'customers':
        return (
          <div className="overflow-y-auto max-h-96">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Minutes</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {detailData.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => { setSelectedStat(null); navigate('/admin/customers'); }}>
                    <td className="px-4 py-2 text-sm text-gray-900">{customer.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{customer.email}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{Number(customer.tokenBalance || 0).toLocaleString()} min</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        customer.planStatus === 'approved' ? 'bg-green-100 text-green-800' :
                        customer.planStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {customer.planStatus || 'none'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'agents':
        return (
          <div className="overflow-y-auto max-h-96">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Minutes</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {detailData.map((agent) => (
                  <tr key={agent._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => { setSelectedStat(null); navigate('/admin/agents'); }}>
                    <td className="px-4 py-2 text-sm text-gray-900">{agent.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{agent.email}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{agent.serviceCategory?.name || '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{Number(agent.agentMinutes || 0).toLocaleString()} min</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        agent.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {agent.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'services':
        return (
          <div className="overflow-y-auto max-h-96">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {detailData.map((service) => (
                  <tr key={service._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => { setSelectedStat(null); navigate('/admin/services'); }}>
                    <td className="px-4 py-2 text-sm text-gray-900">{service.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{service.description || '-'}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        service.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {service.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'pendingTransactions':
      case 'transactions':
        return (
          <div className="overflow-y-auto max-h-96">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {detailData.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => { setSelectedStat(null); navigate('/admin/transactions'); }}>
                    <td className="px-4 py-2 text-sm text-gray-900">{transaction.customer?.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{transaction.plan?.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">${transaction.amount}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        transaction.status === 'approved' ? 'bg-green-100 text-green-800' :
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'activeChats':
        return (
          <div className="overflow-y-auto max-h-96">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {detailData.map((chat) => (
                  <tr key={chat._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => { setSelectedStat(null); navigate('/admin/chats'); }}>
                    <td className="px-4 py-2 text-sm text-gray-900">{chat.customer?.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{chat.agent?.name || 'Unassigned'}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{chat.service?.name}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        chat.status === 'active' ? 'bg-green-100 text-green-800' :
                        chat.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {chat.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return <div className="text-center py-8 text-gray-500">No details available</div>;
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

  const stats = dashboard?.stats || {};
  const recentTransactions = dashboard?.recentTransactions || [];
  const statCards = [
    { label: 'Total Customers', value: stats.totalCustomers || 0, icon: FiUsers, accent: 'text-blue-600', type: 'customers' },
    { label: 'Total Agents', value: stats.totalAgents || 0, icon: FiUserCheck, accent: 'text-emerald-600', type: 'agents' },
    { label: 'Total Services', value: stats.totalServices || 0, icon: FiBriefcase, accent: 'text-purple-600', type: 'services' },
    { label: 'Pending Transactions', value: stats.pendingTransactions || 0, icon: FiClock, accent: 'text-amber-600', type: 'pendingTransactions' },
    { label: 'Active Chats', value: stats.activeChats || 0, icon: FiMessageSquare, accent: 'text-indigo-600', type: 'activeChats' },
    { label: 'Total Transactions', value: stats.totalTransactions || 0, icon: FiDollarSign, accent: 'text-green-600', type: 'transactions' },
  ];

  return (
    <Layout title="Admin Dashboard">
      <div className="space-y-10">
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-blue-900 text-white rounded-3xl p-8 shadow-2xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-200 font-semibold">Control Center</p>
            <h2 className="text-4xl font-bold mt-3">Keep your operations aligned</h2>
            <p className="text-gray-200 mt-3 max-w-2xl">
              Monitor customers, agents, and transactions from a single place. Stay ahead with real-time insights that mirror the public site experience.
            </p>
          </div>
          <Link
            to="/admin/plans"
            className="px-6 py-3 rounded-full bg-white text-gray-900 font-semibold hover:bg-gray-100 transition shadow-lg text-center"
          >
            Update Plans
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                onClick={() => handleStatClick(card.type)}
                className="bg-white/80 rounded-3xl shadow-xl border border-white/60 p-6 backdrop-blur cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">{card.label}</p>
                    <p className="text-4xl font-bold text-gray-900 mt-3">{card.value}</p>
                  </div>
                  <Icon className={`h-12 w-12 ${card.accent}`} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/services"
            className="bg-white/80 rounded-3xl shadow-lg border border-white/60 p-4 hover:shadow-xl transition backdrop-blur"
          >
            <h3 className="font-semibold text-gray-900">Manage Services</h3>
            <p className="text-sm text-gray-600 mt-1">Create and edit services</p>
          </Link>
          <Link
            to="/admin/plans"
            className="bg-white/80 rounded-3xl shadow-lg border border-white/60 p-4 hover:shadow-xl transition backdrop-blur"
          >
            <h3 className="font-semibold text-gray-900">Manage Plans</h3>
            <p className="text-sm text-gray-600 mt-1">Control pricing and minutes</p>
          </Link>
          <Link
            to="/admin/agents"
            className="bg-white/80 rounded-3xl shadow-lg border border-white/60 p-4 hover:shadow-xl transition backdrop-blur"
          >
            <h3 className="font-semibold text-gray-900">Manage Agents</h3>
            <p className="text-sm text-gray-600 mt-1">Add and manage agents</p>
          </Link>
          <Link
            to="/admin/transactions"
            className="bg-white/80 rounded-3xl shadow-lg border border-white/60 p-4 hover:shadow-xl transition backdrop-blur"
          >
            <h3 className="font-semibold text-gray-900">Transactions</h3>
            <p className="text-sm text-gray-600 mt-1">Approve payments</p>
          </Link>
          <Link
            to="/admin/customers"
            className="bg-white/80 rounded-3xl shadow-lg border border-white/60 p-4 hover:shadow-xl transition backdrop-blur"
          >
            <h3 className="font-semibold text-gray-900">Manage Customers</h3>
            <p className="text-sm text-gray-600 mt-1">View and adjust customer minutes</p>
          </Link>
          <Link
            to="/admin/chats"
            className="bg-white/80 rounded-3xl shadow-lg border border-white/60 p-4 hover:shadow-xl transition backdrop-blur"
          >
            <h3 className="font-semibold text-gray-900">Monitor Chats</h3>
            <p className="text-sm text-gray-600 mt-1">View all conversations</p>
          </Link>
        </div>

        <div className="bg-white/90 rounded-3xl shadow-xl border border-white/60 p-6 backdrop-blur">
          <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/70">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentTransactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.customer?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.plan?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${transaction.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        transaction.status === 'approved' ? 'bg-green-100 text-green-800' :
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Modal */}
        {selectedStat && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {getStatTitle(selectedStat)}
                </h2>
                <button
                  onClick={() => setSelectedStat(null)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 flex-1 overflow-hidden">
                {renderDetailContent()}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
