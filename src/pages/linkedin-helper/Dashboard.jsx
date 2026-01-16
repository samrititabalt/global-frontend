import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Linkedin, 
  MessageSquare, 
  Users, 
  Settings, 
  FileText, 
  Activity,
  Plus,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Loader as LoaderIcon
} from 'lucide-react';
import api from '../../utils/axios';
import Loader from '../../components/Loader';
import { useAuth } from '../../context/AuthContext';

const LinkedInHelperDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalConnections: 0,
    activeCampaigns: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [accountsRes, campaignsRes] = await Promise.all([
        api.get('/linkedin-helper/accounts'),
        api.get('/linkedin-helper/campaigns')
      ]);

      setAccounts(accountsRes.data.accounts || []);
      setCampaigns(campaignsRes.data.campaigns || []);

      // Calculate stats
      const totalMessages = accounts.reduce((sum, acc) => sum + (acc.stats?.totalMessagesSent || 0), 0);
      const totalConnections = accounts.reduce((sum, acc) => sum + (acc.stats?.totalConnectionsSent || 0), 0);
      const activeCampaigns = campaigns.filter(c => c.status === 'active').length;

      setStats({ totalMessages, totalConnections, activeCampaigns });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      active: { icon: CheckCircle2, color: 'bg-green-100 text-green-700 border-green-200' },
      paused: { icon: Clock, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      error: { icon: XCircle, color: 'bg-red-100 text-red-700 border-red-200' },
      captcha_required: { icon: AlertCircle, color: 'bg-orange-100 text-orange-700 border-orange-200' },
      warning: { icon: AlertCircle, color: 'bg-red-100 text-red-700 border-red-200' }
    };
    const config = configs[status] || configs.error;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${config.color}`}>
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <Loader size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">LinkedIn Helper</h1>
              <p className="text-gray-600 mt-1">Automate your LinkedIn outreach safely</p>
            </div>
            {accounts.length === 0 ? (
              <Link
                to="/solutions/linkedin-helper/connect"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Connect Account
              </Link>
            ) : null}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Messages Sent</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalMessages}</p>
              </div>
              <MessageSquare className="h-12 w-12 text-blue-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Connections</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalConnections}</p>
              </div>
              <Users className="h-12 w-12 text-indigo-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Campaigns</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeCampaigns}</p>
              </div>
              <Activity className="h-12 w-12 text-green-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            to="/solutions/linkedin-helper/connect"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Linkedin className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Connect Account</h3>
                <p className="text-sm text-gray-600">Add LinkedIn account</p>
              </div>
            </div>
          </Link>

          {accounts.length > 0 && (
            <>
              <Link
                to={`/solutions/linkedin-helper/accounts/${accounts[0]._id}/inbox`}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                    <MessageSquare className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Inbox</h3>
                    <p className="text-sm text-gray-600">View messages</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/solutions/linkedin-helper/campaigns"
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Campaigns</h3>
                    <p className="text-sm text-gray-600">Manage campaigns</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/solutions/linkedin-helper/templates"
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Templates</h3>
                    <p className="text-sm text-gray-600">Message templates</p>
                  </div>
                </div>
              </Link>
            </>
          )}
        </div>

        {/* Accounts List */}
        {accounts.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">LinkedIn Accounts</h2>
              <Link
                to="/solutions/linkedin-helper/connect"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus className="h-4 w-4" />
                Add Account
              </Link>
            </div>
            <div className="space-y-4">
              {accounts.map(account => (
                <div
                  key={account._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Linkedin className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {account.linkedInName || account.linkedInEmail || 'LinkedIn Account'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Messages: {account.stats?.messagesToday || 0}/{account.settings?.dailyMessageLimit || 20} today
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(account.status)}
                    <Link
                      to={`/solutions/linkedin-helper/accounts/${account._id}/inbox`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Accounts State */}
        {accounts.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Linkedin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No LinkedIn Accounts Connected</h3>
            <p className="text-gray-600 mb-6">Connect your LinkedIn account to get started with automation.</p>
            <Link
              to="/solutions/linkedin-helper/connect"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Connect Your First Account
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default LinkedInHelperDashboard;

