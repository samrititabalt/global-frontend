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

  return (
    <Layout title="Admin Dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Customers</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalCustomers || 0}</p>
            </div>
            <FiUsers className="h-12 w-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Agents</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalAgents || 0}</p>
            </div>
            <FiUserCheck className="h-12 w-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Services</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalServices || 0}</p>
            </div>
            <FiBriefcase className="h-12 w-12 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending Transactions</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pendingTransactions || 0}</p>
            </div>
            <FiClock className="h-12 w-12 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Chats</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeChats || 0}</p>
            </div>
            <FiMessageSquare className="h-12 w-12 text-indigo-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Transactions</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalTransactions || 0}</p>
            </div>
            <FiDollarSign className="h-12 w-12 text-green-500" />
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link
          to="/admin/services"
          className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow"
        >
          <h3 className="font-semibold text-gray-900">Manage Services</h3>
          <p className="text-sm text-gray-600 mt-1">Create and edit services</p>
        </Link>
        <Link
          to="/admin/plans"
          className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow"
        >
          <h3 className="font-semibold text-gray-900">Manage Plans</h3>
          <p className="text-sm text-gray-600 mt-1">Create and edit pricing plans</p>
        </Link>
        <Link
          to="/admin/agents"
          className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow"
        >
          <h3 className="font-semibold text-gray-900">Manage Agents</h3>
          <p className="text-sm text-gray-600 mt-1">Add and manage agents</p>
        </Link>
        <Link
          to="/admin/transactions"
          className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow"
        >
          <h3 className="font-semibold text-gray-900">Transactions</h3>
          <p className="text-sm text-gray-600 mt-1">Approve payments</p>
        </Link>
        <Link
          to="/admin/chats"
          className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow"
        >
          <h3 className="font-semibold text-gray-900">Monitor Chats</h3>
          <p className="text-sm text-gray-600 mt-1">View all conversations</p>
        </Link>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
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
    </Layout>
  );
};

export default AdminDashboard;

