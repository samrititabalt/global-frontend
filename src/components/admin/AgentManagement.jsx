import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, DollarSign, Plus, X, Edit2, Trash2, User, Sun, Briefcase } from 'lucide-react';
import api from '../../utils/axios';

const AgentManagement = () => {
  const [activeTab, setActiveTab] = useState('holidays');
  const [holidays, setHolidays] = useState([]);
  const [hours, setHours] = useState([]);
  const [agents, setAgents] = useState([]);
  const [calendarData, setCalendarData] = useState({ holidays: [], hours: [], leads: [] });
  const [loading, setLoading] = useState(true);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [editingHours, setEditingHours] = useState(null);
  const [holidayForm, setHolidayForm] = useState({ agent: '', startDate: '', endDate: '', notes: '' });
  const [hoursForm, setHoursForm] = useState({ agent: '', payRate: '', hoursWorked: '', date: new Date().toISOString().split('T')[0], notes: '' });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [updatingAgentId, setUpdatingAgentId] = useState(null);

  useEffect(() => {
    loadAgents();
    if (activeTab === 'holidays') loadHolidays();
    if (activeTab === 'hours') loadHours();
    if (activeTab === 'calendar') loadCalendar();
  }, [activeTab]);

  const loadAgents = async () => {
    try {
      const response = await api.get('/admin/crm/agents');
      setAgents(response.data.agents || []);
    } catch (error) {
      console.error('Error loading agents:', error);
    }
  };

  const loadHolidays = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/agent-management/holidays');
      setHolidays(response.data.holidays || []);
    } catch (error) {
      console.error('Error loading holidays:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHours = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/agent-management/hours');
      setHours(response.data.hours || []);
    } catch (error) {
      console.error('Error loading hours:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCalendar = async () => {
    try {
      setLoading(true);
      const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
      const response = await api.get(`/admin/agent-management/calendar?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
      setCalendarData(response.data.calendar || { holidays: [], hours: [], leads: [] });
    } catch (error) {
      console.error('Error loading calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHolidaySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingHoliday) {
        await api.put(`/admin/agent-management/holidays/${editingHoliday._id}`, holidayForm);
      } else {
        await api.post('/admin/agent-management/holidays', holidayForm);
      }
      setShowHolidayModal(false);
      setEditingHoliday(null);
      setHolidayForm({ agent: '', startDate: '', endDate: '', notes: '' });
      loadHolidays();
      if (activeTab === 'calendar') loadCalendar();
    } catch (error) {
      console.error('Error saving holiday:', error);
      alert('Failed to save holiday');
    }
  };

  const handleHoursSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingHours) {
        await api.put(`/admin/agent-management/hours/${editingHours._id}`, hoursForm);
      } else {
        await api.post('/admin/agent-management/hours', hoursForm);
      }
      setShowHoursModal(false);
      setEditingHours(null);
      setHoursForm({ agent: '', payRate: '', hoursWorked: '', date: new Date().toISOString().split('T')[0], notes: '' });
      loadHours();
      if (activeTab === 'calendar') loadCalendar();
    } catch (error) {
      console.error('Error saving hours:', error);
      alert('Failed to save hours');
    }
  };

  const handleDeleteHoliday = async (id) => {
    if (!window.confirm('Are you sure you want to delete this holiday?')) return;
    try {
      await api.delete(`/admin/agent-management/holidays/${id}`);
      loadHolidays();
      if (activeTab === 'calendar') loadCalendar();
    } catch (error) {
      console.error('Error deleting holiday:', error);
      alert('Failed to delete holiday');
    }
  };

  const handleDeleteHours = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hours entry?')) return;
    try {
      await api.delete(`/admin/agent-management/hours/${id}`);
      loadHours();
      if (activeTab === 'calendar') loadCalendar();
    } catch (error) {
      console.error('Error deleting hours:', error);
      alert('Failed to delete hours entry');
    }
  };

  const getAgentName = (agentId) => {
    const agent = agents.find(a => a._id === agentId);
    return agent ? agent.name : 'Unknown';
  };

  const handleToggleProAccess = async (agentId, enabled) => {
    try {
      setUpdatingAgentId(agentId);
      const response = await api.put(`/admin/agents/${agentId}/pro-access`, { enabled });
      if (response.data?.success) {
        setAgents(prev => prev.map(agent => (
          agent._id === agentId
            ? { ...agent, pro_access_enabled: response.data.agent.pro_access_enabled }
            : agent
        )));
      }
    } catch (error) {
      console.error('Error updating pro access:', error);
      alert('Failed to update Pro access');
    } finally {
      setUpdatingAgentId(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Briefcase className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Agent Management</h2>
          <p className="text-sm text-gray-500">Manage agent holidays, hours, and remuneration</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('holidays')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'holidays'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4" />
            Holidays
          </div>
        </button>
        <button
          onClick={() => setActiveTab('hours')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'hours'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Hours & Remuneration
          </div>
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'calendar'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            Calendar View
          </div>
        </button>
        <button
          onClick={() => setActiveTab('pro-access')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'pro-access'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Pro Access
          </div>
        </button>
      </div>

      {activeTab === 'pro-access' && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pro Access</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {agents.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No agents found</td>
                </tr>
              ) : (
                agents.map((agent) => (
                  <tr key={agent._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{agent.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agent.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        agent.pro_access_enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {agent.pro_access_enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleProAccess(agent._id, !agent.pro_access_enabled)}
                        disabled={updatingAgentId === agent._id}
                        className={`px-3 py-1.5 text-sm rounded-lg font-semibold transition ${
                          agent.pro_access_enabled
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        } ${updatingAgentId === agent._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {agent.pro_access_enabled ? 'Disable Pro Access' : 'Enable Pro Access'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Holidays Tab */}
      {activeTab === 'holidays' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => {
                setEditingHoliday(null);
                setHolidayForm({ agent: '', startDate: '', endDate: '', notes: '' });
                setShowHolidayModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              Add Holiday
            </button>
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {holidays.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No holidays found</td>
                    </tr>
                  ) : (
                    holidays.map((holiday) => (
                      <tr key={holiday._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {holiday.agent?.name || getAgentName(holiday.agent)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(holiday.startDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(holiday.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{holiday.notes || '-'}</td>
                        <td className="px-6 py-4 text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingHoliday(holiday);
                                setHolidayForm({
                                  agent: holiday.agent._id || holiday.agent,
                                  startDate: new Date(holiday.startDate).toISOString().split('T')[0],
                                  endDate: new Date(holiday.endDate).toISOString().split('T')[0],
                                  notes: holiday.notes || ''
                                });
                                setShowHolidayModal(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteHoliday(holiday._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Hours Tab */}
      {activeTab === 'hours' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => {
                setEditingHours(null);
                setHoursForm({ agent: '', payRate: '', hoursWorked: '', date: new Date().toISOString().split('T')[0], notes: '' });
                setShowHoursModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              Add Hours
            </button>
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pay Rate (£/hr)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours Worked</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Pay</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {hours.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No hours entries found</td>
                    </tr>
                  ) : (
                    hours.map((hour) => (
                      <tr key={hour._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {hour.agent?.name || getAgentName(hour.agent)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">£{hour.payRate.toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{hour.hoursWorked.toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">£{hour.totalPay.toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(hour.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingHours(hour);
                                setHoursForm({
                                  agent: hour.agent._id || hour.agent,
                                  payRate: hour.payRate.toString(),
                                  hoursWorked: hour.hoursWorked.toString(),
                                  date: new Date(hour.date).toISOString().split('T')[0],
                                  notes: hour.notes || ''
                                });
                                setShowHoursModal(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteHours(hour._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <div>
          <div className="mb-4 flex items-center gap-4">
            <input
              type="month"
              value={`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`}
              onChange={(e) => {
                const [year, month] = e.target.value.split('-');
                setSelectedDate(new Date(year, month - 1, 1));
                setTimeout(() => loadCalendar(), 100);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Holidays</h3>
                  <div className="space-y-2">
                    {calendarData.holidays.length === 0 ? (
                      <p className="text-sm text-gray-500">No holidays this month</p>
                    ) : (
                      calendarData.holidays.map((holiday) => (
                        <div key={holiday._id} className="text-sm bg-white rounded p-2">
                          <div className="font-medium">{holiday.agent?.name || getAgentName(holiday.agent)}</div>
                          <div className="text-gray-600">
                            {new Date(holiday.startDate).toLocaleDateString()} - {new Date(holiday.endDate).toLocaleDateString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">Hours Entries</h3>
                  <div className="space-y-2">
                    {calendarData.hours.length === 0 ? (
                      <p className="text-sm text-gray-500">No hours entries this month</p>
                    ) : (
                      calendarData.hours.map((hour) => (
                        <div key={hour._id} className="text-sm bg-white rounded p-2">
                          <div className="font-medium">{hour.agent?.name || getAgentName(hour.agent)}</div>
                          <div className="text-gray-600">
                            {hour.hoursWorked.toFixed(2)}h - £{hour.totalPay.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">{new Date(hour.date).toLocaleDateString()}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-2">Leads Captured</h3>
                  <div className="space-y-2">
                    {calendarData.leads.length === 0 ? (
                      <p className="text-sm text-gray-500">No leads this month</p>
                    ) : (
                      <div className="text-sm">
                        <div className="font-medium text-lg">{calendarData.leads.length} leads</div>
                        <div className="text-gray-600">captured this month</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Holiday Modal */}
      {showHolidayModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold">{editingHoliday ? 'Edit Holiday' : 'Add Holiday'}</h3>
              <button onClick={() => { setShowHolidayModal(false); setEditingHoliday(null); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleHolidaySubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agent *</label>
                <select
                  required
                  value={holidayForm.agent}
                  onChange={(e) => setHolidayForm({ ...holidayForm, agent: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Agent</option>
                  {agents.map((agent) => (
                    <option key={agent._id} value={agent._id}>{agent.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={holidayForm.startDate}
                    onChange={(e) => setHolidayForm({ ...holidayForm, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={holidayForm.endDate}
                    onChange={(e) => setHolidayForm({ ...holidayForm, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={holidayForm.notes}
                  onChange={(e) => setHolidayForm({ ...holidayForm, notes: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => { setShowHolidayModal(false); setEditingHoliday(null); }} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  {editingHoliday ? 'Update' : 'Create'} Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hours Modal */}
      {showHoursModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold">{editingHours ? 'Edit Hours' : 'Add Hours'}</h3>
              <button onClick={() => { setShowHoursModal(false); setEditingHours(null); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleHoursSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agent *</label>
                <select
                  required
                  value={hoursForm.agent}
                  onChange={(e) => setHoursForm({ ...hoursForm, agent: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Agent</option>
                  {agents.map((agent) => (
                    <option key={agent._id} value={agent._id}>{agent.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pay Rate (£/hr) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={hoursForm.payRate}
                    onChange={(e) => setHoursForm({ ...hoursForm, payRate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hours Worked *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={hoursForm.hoursWorked}
                    onChange={(e) => setHoursForm({ ...hoursForm, hoursWorked: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={hoursForm.date}
                  onChange={(e) => setHoursForm({ ...hoursForm, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={hoursForm.notes}
                  onChange={(e) => setHoursForm({ ...hoursForm, notes: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {hoursForm.payRate && hoursForm.hoursWorked && (
                <div className="bg-indigo-50 rounded-lg p-4">
                  <div className="text-sm text-indigo-900">
                    <strong>Total Pay:</strong> £{(parseFloat(hoursForm.payRate || 0) * parseFloat(hoursForm.hoursWorked || 0)).toFixed(2)}
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => { setShowHoursModal(false); setEditingHours(null); }} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  {editingHours ? 'Update' : 'Create'} Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentManagement;
