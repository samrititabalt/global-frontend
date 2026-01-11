import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, UserPlus, UserCheck, MessageCircle, FileText, 
  Calendar, Filter, RefreshCw, Mail, Phone, User, Building2 
} from 'lucide-react';
import Layout from '../../components/Layout';
import api from '../../utils/axios';

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    loadActivities();
  }, [filter, dateFilter]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('type', filter);
      if (dateFilter) params.append('date', dateFilter);

      const response = await api.get(`/admin/activities?${params.toString()}`);
      setActivities(response.data.activities || []);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    const icons = {
      customer_registered: UserPlus,
      agent_registered: UserCheck,
      chatbot_interaction: MessageCircle,
      chatbot_contact_shared: MessageCircle,
      resume_generated: FileText,
      transaction_approved: FileText,
      service_created: FileText,
      plan_created: FileText,
      other: Activity
    };
    return icons[type] || Activity;
  };

  const getActivityColor = (type) => {
    const colors = {
      customer_registered: 'bg-blue-100 text-blue-600',
      agent_registered: 'bg-green-100 text-green-600',
      chatbot_interaction: 'bg-purple-100 text-purple-600',
      chatbot_contact_shared: 'bg-indigo-100 text-indigo-600',
      resume_generated: 'bg-orange-100 text-orange-600',
      transaction_approved: 'bg-emerald-100 text-emerald-600',
      service_created: 'bg-pink-100 text-pink-600',
      plan_created: 'bg-cyan-100 text-cyan-600',
      other: 'bg-gray-100 text-gray-600'
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  };

  const formatActivityType = (type) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Layout title="Recent Activity">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Activity className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Recent Activity</h1>
                <p className="text-sm text-gray-500">Monitor all site activities and changes</p>
              </div>
            </div>
            <button
              onClick={loadActivities}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Activities</option>
              <option value="customer_registered">Customer Registered</option>
              <option value="agent_registered">Agent Registered</option>
              <option value="chatbot_interaction">Chatbot Interactions</option>
              <option value="chatbot_contact_shared">Chatbot Contact Shared</option>
              <option value="resume_generated">Resume Generated</option>
            </select>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Filter by date"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Clear Date
              </button>
            )}
          </div>
        </div>

        {/* Activities List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No activities found</p>
              </div>
            ) : (
              activities.map((activity, index) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <motion.div
                    key={activity._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${getActivityColor(activity.type)}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {formatActivityType(activity.type)}
                          </h3>
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(activity.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-3">{activity.description}</p>
                        
                        {/* Metadata Display */}
                        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-2">
                            {activity.metadata.email && (
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-700">{activity.metadata.email}</span>
                              </div>
                            )}
                            {activity.metadata.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-700">{activity.metadata.phone}</span>
                              </div>
                            )}
                            {activity.metadata.name && (
                              <div className="flex items-center gap-2 text-sm">
                                <User className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-700">{activity.metadata.name}</span>
                              </div>
                            )}
                            {activity.metadata.message && (
                              <div className="text-sm text-gray-700 mt-2 p-2 bg-white rounded border border-gray-200">
                                <strong>Message:</strong> {activity.metadata.message}
                              </div>
                            )}
                            {activity.metadata.country && (
                              <div className="flex items-center gap-2 text-sm">
                                <Building2 className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-700">{activity.metadata.country}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RecentActivity;
