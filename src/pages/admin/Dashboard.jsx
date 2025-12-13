import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { FiUsers, FiUserCheck, FiBriefcase, FiDollarSign, FiMessageSquare, FiClock } from 'react-icons/fi';
import api from '../../utils/axios';

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

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
    { label: 'Total Customers', value: stats.totalCustomers || 0, icon: FiUsers, accent: 'text-blue-600' },
    { label: 'Total Agents', value: stats.totalAgents || 0, icon: FiUserCheck, accent: 'text-emerald-600' },
    { label: 'Total Services', value: stats.totalServices || 0, icon: FiBriefcase, accent: 'text-purple-600' },
    { label: 'Pending Transactions', value: stats.pendingTransactions || 0, icon: FiClock, accent: 'text-amber-600' },
    { label: 'Active Chats', value: stats.activeChats || 0, icon: FiMessageSquare, accent: 'text-indigo-600' },
    { label: 'Total Transactions', value: stats.totalTransactions || 0, icon: FiDollarSign, accent: 'text-green-600' },
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
              <div key={card.label} className="bg-white/80 rounded-3xl shadow-xl border border-white/60 p-6 backdrop-blur">
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
            <p className="text-sm text-gray-600 mt-1">Control pricing and hours</p>
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
      </div>
    </Layout>
  );
};

export default AdminDashboard;

