import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/axios';
import { User, Upload, X, Search, Plus, Minus, Clock, Mail, Briefcase, Edit, Trash2 } from 'lucide-react';

const AdminAgents = () => {
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showMinutesModal, setShowMinutesModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [minuteAmount, setMinuteAmount] = useState('');
  const [minuteReason, setMinuteReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const avatarInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    serviceCategory: '', // Keep for backward compatibility
    serviceCategories: [], // New array for multiple categories
    password: ''
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ agentId: '', password: '' });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = agents.filter(agent =>
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.serviceCategory?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAgents(filtered);
    } else {
      setFilteredAgents(agents);
    }
  }, [searchTerm, agents]);

  const loadData = async () => {
    try {
      const [agentsRes, servicesRes] = await Promise.all([
        api.get('/admin/agents'),
        api.get('/admin/services')
      ]);
      setAgents(agentsRes.data.agents || []);
      setFilteredAgents(agentsRes.data.agents || []);
      setServices(servicesRes.data.services || []);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Avatar image must be less than 5MB');
        return;
      }
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatar(null);
    setAvatarPreview(null);
    if (avatarInputRef.current) {
      avatarInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('country', formData.country);
      
      // Send service categories as array
      if (formData.serviceCategories && formData.serviceCategories.length > 0) {
        formData.serviceCategories.forEach(categoryId => {
          submitData.append('serviceCategories', categoryId);
        });
      } else if (formData.serviceCategory) {
        // Backward compatibility: if only single category selected
        submitData.append('serviceCategories', formData.serviceCategory);
      }
      
      if (formData.password) {
        submitData.append('password', formData.password);
      }
      if (avatar) {
        submitData.append('avatar', avatar);
      }

      if (editingAgent) {
        // Update existing agent
        await api.put(`/admin/agents/${editingAgent._id}`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // Create new agent
        await api.post('/admin/agents', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      setShowModal(false);
      setEditingAgent(null);
      setFormData({ name: '', email: '', phone: '', country: '', serviceCategory: '', serviceCategories: [], password: '' });
      setAvatar(null);
      setAvatarPreview(null);
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || `Failed to ${editingAgent ? 'update' : 'create'} agent`);
    }
  };

  const handleEdit = (agent) => {
    setEditingAgent(agent);
    // Handle both old single serviceCategory and new serviceCategories array
    const serviceCategories = agent.serviceCategories && agent.serviceCategories.length > 0
      ? agent.serviceCategories.map(cat => cat._id || cat)
      : agent.serviceCategory
        ? [agent.serviceCategory._id || agent.serviceCategory]
        : [];
    
    setFormData({
      name: agent.name || '',
      email: agent.email || '',
      phone: agent.phone || '',
      country: agent.country || '',
      serviceCategory: serviceCategories[0] || '', // Keep for backward compatibility
      serviceCategories: serviceCategories, // New array
      password: agent.plainPassword || ''
    });
    setAvatarPreview(agent.avatar || null);
    setAvatar(null);
    setShowModal(true);
  };

  const handleDelete = async (agentId) => {
    if (window.confirm('Are you sure you want to delete this agent? This action cannot be undone.')) {
      try {
        await api.delete(`/admin/agents/${agentId}`);
        loadData();
        alert('Agent deleted successfully');
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete agent');
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', country: '', serviceCategory: '', serviceCategories: [], password: '' });
    setAvatar(null);
    setAvatarPreview(null);
    setEditingAgent(null);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!passwordData.password || passwordData.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    setUpdatingPassword(true);
    try {
      await api.put(`/admin/agents/${passwordData.agentId}/password`, {
        password: passwordData.password
      });
      setShowPasswordModal(false);
      setPasswordData({ agentId: '', password: '' });
      loadData();
      alert('Password updated successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update password');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const openPasswordModal = (agent) => {
    setPasswordData({ agentId: agent._id, password: agent.plainPassword || '' });
    setShowPasswordModal(true);
  };

  const handleAdjustMinutes = (agent) => {
    setSelectedAgent(agent);
    setMinuteAmount('');
    setMinuteReason('');
    setShowMinutesModal(true);
  };

  const handleMinuteSubmit = async (e) => {
    e.preventDefault();
    if (!minuteAmount || parseInt(minuteAmount) === 0) {
      alert('Please enter a valid amount (cannot be zero)');
      return;
    }

    setAdjusting(true);
    try {
      const response = await api.put(`/admin/agents/${selectedAgent._id}/minutes`, {
        amount: parseInt(minuteAmount),
        reason: minuteReason || 'Admin adjustment'
      });

      if (response.data.success) {
        setShowMinutesModal(false);
        setSelectedAgent(null);
        setMinuteAmount('');
        setMinuteReason('');
        loadData();
        alert(response.data.message || 'Minutes adjusted successfully!');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to adjust minutes');
    } finally {
      setAdjusting(false);
    }
  };

  const formatMinutes = (minutes) => {
    const mins = Number(minutes ?? 0);
    if (mins >= 60) {
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return remainingMins > 0 
        ? `${hours}h ${remainingMins}m` 
        : `${hours}h`;
    }
    return `${mins} min`;
  };

  if (loading) {
    return (
      <Layout title="Manage Agents">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-800"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Manage Agents">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-green-900 text-white rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Agent Management</h1>
              <p className="text-gray-200">Manage agents and adjust their service minutes</p>
            </div>
            <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
              className="px-6 py-3 rounded-full bg-white text-gray-900 font-semibold hover:bg-gray-100 transition shadow-lg"
            >
              Add New Agent
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wide">Total Agents</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{agents.length}</p>
              </div>
              <User className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wide">Total Minutes</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {agents.reduce((sum, a) => sum + (Number(a.agentMinutes) || 0), 0).toLocaleString()}
                </p>
              </div>
              <Clock className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wide">Online Agents</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {agents.filter(a => a.isOnline).length}
                </p>
              </div>
              <Briefcase className="w-12 h-12 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Agents Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service Minutes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Earned
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAgents.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      {searchTerm ? 'No agents found matching your search.' : 'No agents found.'}
                    </td>
                  </tr>
                ) : (
                  filteredAgents.map((agent) => (
                    <tr key={agent._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {agent.avatar ? (
                            <img
                              src={agent.avatar}
                              alt={agent.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold">
                              {agent.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                            <div className="text-sm text-gray-500">{agent.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {agent.email}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Password: <span className="font-mono font-semibold text-gray-700">{agent.plainPassword || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {agent.serviceCategories && agent.serviceCategories.length > 0 ? (
                            agent.serviceCategories.map((cat, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                              >
                                {cat.name || cat}
                              </span>
                            ))
                          ) : agent.serviceCategory?.name ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                              {agent.serviceCategory.name}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-green-600" />
                          <span className="text-sm font-semibold text-gray-900">
                            {formatMinutes(agent.agentMinutes)}
                          </span>
                          <span className="text-sm text-gray-500 ml-1">
                            ({Number(agent.agentMinutes || 0).toLocaleString()} min)
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatMinutes(agent.totalMinutesEarned)}
                        <span className="text-gray-500 ml-1">
                          ({Number(agent.totalMinutesEarned || 0).toLocaleString()} min)
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          agent.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {agent.isOnline ? 'Online' : 'Offline'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(agent)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => openPasswordModal(agent)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition"
                            title="Change Password"
                          >
                            🔑
                          </button>
                          <button
                            onClick={() => handleAdjustMinutes(agent)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Minutes
                          </button>
                          <button
                            onClick={() => handleDelete(agent._id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Agent Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
              {editingAgent ? 'Edit Agent' : 'Add New Agent'}
            </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Avatar Upload */}
                <div className="flex flex-col items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Picture (Optional)
                  </label>
                  <div className="relative">
                    {avatarPreview ? (
                      <div className="relative">
                        <img
                          src={avatarPreview}
                          alt="Avatar preview"
                          className="w-24 h-24 rounded-full object-cover border-2 border-primary-500"
                        />
                        <button
                          type="button"
                          onClick={removeAvatar}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => avatarInputRef.current?.click()}
                        className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors border-2 border-dashed border-gray-400"
                      >
                        <User className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="mt-2 text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{avatarPreview ? 'Change' : 'Upload'} Avatar</span>
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Service Categories <span className="text-gray-500 text-xs font-normal">(Click to select multiple)</span>
                  </label>
                  
                  {services.length === 0 ? (
                    <div className="p-4 border border-gray-300 rounded-lg bg-gray-50 text-center">
                      <p className="text-sm text-gray-500">No services available. Please create services first.</p>
                    </div>
                  ) : (
                    <>
                      {/* Clickable Service Pills */}
                      <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 max-h-64 overflow-y-auto">
                        <div className="grid grid-cols-1 gap-2">
                          {services.map((service) => {
                            const isSelected = formData.serviceCategories.includes(service._id);
                            return (
                              <button
                                key={service._id}
                                type="button"
                                onClick={() => {
                                  let updatedCategories;
                                  
                                  if (isSelected) {
                                    // Remove from selection
                                    updatedCategories = formData.serviceCategories.filter(id => id !== service._id);
                                  } else {
                                    // Add to selection
                                    updatedCategories = [...formData.serviceCategories, service._id];
                                  }
                                  
                                  setFormData({
                                    ...formData,
                                    serviceCategories: updatedCategories,
                                    serviceCategory: updatedCategories[0] || ''
                                  });
                                }}
                                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                                  isSelected
                                    ? 'bg-primary-50 border-primary-500 shadow-sm'
                                    : 'bg-white border-gray-200 hover:border-primary-300 hover:bg-primary-50/50'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 ${
                                      isSelected
                                        ? 'bg-primary-500 border-primary-500'
                                        : 'bg-white border-gray-300'
                                    }`}>
                                      {isSelected && (
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      )}
                                    </div>
                                    <span className={`text-sm font-medium ${
                                      isSelected ? 'text-primary-900' : 'text-gray-700'
                                    }`}>
                                      {service.name}
                                    </span>
                                  </div>
                                  {isSelected && (
                                    <span className="text-primary-600 text-sm font-semibold">Selected</span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Selection Summary */}
                      <div className="mt-3 flex items-center justify-between">
                        <p className={`text-sm ${
                          formData.serviceCategories.length === 0
                            ? 'text-amber-600 font-medium'
                            : 'text-green-600 font-medium'
                        }`}>
                          {formData.serviceCategories.length === 0 ? (
                            <span>⚠️ Please select at least one service category</span>
                          ) : (
                            <span>✓ {formData.serviceCategories.length} service{formData.serviceCategories.length !== 1 ? 's' : ''} selected</span>
                          )}
                        </p>
                        {formData.serviceCategories.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                serviceCategories: [],
                                serviceCategory: ''
                              });
                            }}
                            className="text-xs text-red-600 hover:text-red-800 font-medium underline"
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                      
                      {/* Selected Services as Compact Badges */}
                      {formData.serviceCategories.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs font-medium text-gray-600 mb-2">Selected Services:</p>
                          <div className="flex flex-wrap gap-2">
                            {formData.serviceCategories.map(catId => {
                              const service = services.find(s => s._id === catId);
                              return service ? (
                                <span
                                  key={catId}
                                  className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 border border-primary-300"
                                >
                                  {service.name}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = formData.serviceCategories.filter(id => id !== catId);
                                      setFormData({
                                        ...formData,
                                        serviceCategories: updated,
                                        serviceCategory: updated[0] || ''
                                      });
                                    }}
                                    className="ml-2 text-primary-600 hover:text-primary-900 font-bold text-base leading-none"
                                    title="Remove"
                                  >
                                    ×
                                  </button>
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password {editingAgent ? '(leave empty to keep current)' : '(leave empty to auto-generate)'}
                  </label>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingAgent ? 'Enter new password or leave empty' : 'Enter password or leave empty to auto-generate'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  {editingAgent && (
                    <p className="text-xs text-gray-500 mt-1">
                      Current password: <span className="font-mono font-semibold">{editingAgent.plainPassword || 'N/A'}</span>
                    </p>
                  )}
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    {editingAgent ? 'Update Agent' : 'Create Agent'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Minutes Adjustment Modal */}
        {showMinutesModal && selectedAgent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Adjust Minutes
                  </h2>
                  <button
                    onClick={() => {
                      setShowMinutesModal(false);
                      setSelectedAgent(null);
                      setMinuteAmount('');
                      setMinuteReason('');
                    }}
                    className="text-gray-400 hover:text-gray-600 transition"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Agent: <span className="font-semibold">{selectedAgent.name}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Current Balance: <span className="font-semibold text-primary-600">
                    {formatMinutes(selectedAgent.agentMinutes)} ({Number(selectedAgent.agentMinutes || 0).toLocaleString()} min)
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Total Earned: <span className="font-semibold text-green-600">
                    {formatMinutes(selectedAgent.totalMinutesEarned)} ({Number(selectedAgent.totalMinutesEarned || 0).toLocaleString()} min)
                  </span>
                </p>
              </div>

              <form onSubmit={handleMinuteSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adjustment Amount *
                  </label>
                  <div className="relative">
                    {parseInt(minuteAmount) > 0 ? (
                      <Plus className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 w-5 h-5" />
                    ) : parseInt(minuteAmount) < 0 ? (
                      <Minus className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-600 w-5 h-5" />
                    ) : null}
                    <input
                      type="number"
                      value={minuteAmount}
                      onChange={(e) => setMinuteAmount(e.target.value)}
                      required
                      placeholder="Enter positive to add, negative to deduct"
                      className={`w-full ${parseInt(minuteAmount) > 0 ? 'pl-10' : parseInt(minuteAmount) < 0 ? 'pl-10' : 'pl-4'} pr-4 py-3 border-2 ${
                        parseInt(minuteAmount) > 0 ? 'border-green-300' : 
                        parseInt(minuteAmount) < 0 ? 'border-red-300' : 
                        'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition`}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Positive number to add minutes, negative number to deduct minutes
                  </p>
                  {minuteAmount && parseInt(minuteAmount) !== 0 && (
                    <div className={`mt-2 p-3 rounded-lg ${
                      parseInt(minuteAmount) > 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}>
                      <p className="text-sm font-semibold">
                        New Balance: <span className={
                          parseInt(minuteAmount) > 0 ? 'text-green-700' : 'text-red-700'
                        }>
                          {formatMinutes((Number(selectedAgent.agentMinutes) || 0) + parseInt(minuteAmount))}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason *
                  </label>
                  <textarea
                    value={minuteReason}
                    onChange={(e) => setMinuteReason(e.target.value)}
                    required
                    rows="3"
                    placeholder="Enter reason for adjustment..."
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMinutesModal(false);
                      setSelectedAgent(null);
                      setMinuteAmount('');
                      setMinuteReason('');
                    }}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
                    disabled={adjusting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={adjusting || !minuteAmount || parseInt(minuteAmount) === 0}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {adjusting ? 'Adjusting...' : 'Adjust Minutes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Password Update Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Update Agent Password
                  </h2>
                  <button
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordData({ agentId: '', password: '' });
                    }}
                    className="text-gray-400 hover:text-gray-600 transition"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Agent: <span className="font-semibold">
                    {agents.find(a => a._id === passwordData.agentId)?.name || 'Unknown'}
                  </span>
                </p>
              </div>

              <form onSubmit={handleUpdatePassword} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password *
                  </label>
                  <input
                    type="text"
                    value={passwordData.password}
                    onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                    required
                    minLength={6}
                    placeholder="Enter new password (min 6 characters)"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Password must be at least 6 characters long
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordData({ agentId: '', password: '' });
                    }}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
                    disabled={updatingPassword}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingPassword || !passwordData.password || passwordData.password.length < 6}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {updatingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminAgents;
