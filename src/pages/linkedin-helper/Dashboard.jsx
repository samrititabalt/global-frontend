import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus,
  MessageSquare,
  Users,
  Settings,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText
} from 'lucide-react';
import Layout from '../../components/Layout';
import api from '../../utils/axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMessages: 0,
    unreadMessages: 0,
    activeCampaigns: 0,
    pendingTasks: 0
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const response = await api.get('/linkedin-helper/accounts');
      setAccounts(response.data);
      
      // Calculate stats
      let unread = 0;
      let activeCampaigns = 0;
      let pendingTasks = 0;

      for (const account of response.data) {
        try {
          const inboxRes = await api.get(`/linkedin-helper/accounts/${account._id}/inbox?limit=1`);
          unread += inboxRes.data.unreadCount || 0;
        } catch (err) {
          console.error('Error loading inbox stats:', err);
        }
      }

      setStats({
        totalMessages: 0, // Would need separate endpoint
        unreadMessages: unread,
        activeCampaigns,
        pendingTasks
      });
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-700';
      case 'paused':
        return 'bg-amber-100 text-amber-700';
      case 'warning':
        return 'bg-orange-100 text-orange-700';
      case 'error':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">LinkedIn Helper</h1>
          <p className="text-gray-600">Automate your LinkedIn outreach and messaging</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">LinkedIn Accounts</p>
                <p className="text-2xl font-bold text-gray-900">{accounts.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unread Messages</p>
                <p className="text-2xl font-bold text-gray-900">{stats.unreadMessages}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-purple-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeCampaigns}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingTasks}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            <Link
              to="/linkedin-helper/accounts/connect"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Connect LinkedIn Account
            </Link>
            <Link
              to="/linkedin-helper/campaigns"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              <FileText className="h-5 w-5" />
              Create Campaign
            </Link>
            <Link
              to="/linkedin-helper/templates"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              <FileText className="h-5 w-5" />
              Message Templates
            </Link>
          </div>
        </div>

        {/* Accounts List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">LinkedIn Accounts</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {accounts.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No LinkedIn accounts connected</p>
                <Link
                  to="/linkedin-helper/accounts/connect"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  Connect Your First Account
                </Link>
              </div>
            ) : (
              accounts.map((account) => (
                <div key={account._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{account.linkedInEmail}</h3>
                        <p className="text-sm text-gray-600">
                          {account.linkedInName || 'LinkedIn Account'}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(account.status)}`}>
                            {account.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {account.stats.messagesSentToday}/{account.safety.dailyMessageLimit} messages today
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/linkedin-helper/accounts/${account._id}/inbox`}
                        className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        Inbox
                      </Link>
                      <Link
                        to={`/linkedin-helper/accounts/${account._id}/settings`}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700"
                      >
                        Settings
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

