import React, { useState, useEffect, useMemo } from 'react';
import Layout from '../../components/Layout';
import { Calendar, Plus, Save, Edit2, Trash2, Search, Filter } from 'lucide-react';
import api from '../../utils/axios';

const TimesheetCalculator = () => {
  const [timesheets, setTimesheets] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAgent, setFilterAgent] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    loadAgents();
    loadTimesheets();
  }, []);

  const loadAgents = async () => {
    try {
      const response = await api.get('/admin/agents');
      setAgents(response.data.agents || []);
    } catch (error) {
      console.error('Error loading agents:', error);
    }
  };

  const loadTimesheets = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/timesheets');
      setTimesheets(response.data.timesheets || []);
    } catch (error) {
      console.error('Error loading timesheets:', error);
      // If endpoint doesn't exist yet, initialize with empty array
      setTimesheets([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get week number and date range
  const getWeekInfo = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const year = d.getFullYear();
    const month = d.toLocaleString('default', { month: 'short' });
    
    // Get the first day of the week (Sunday = 0)
    const firstDay = new Date(d);
    const dayOfWeek = firstDay.getDay();
    firstDay.setDate(d.getDate() - dayOfWeek);
    firstDay.setHours(0, 0, 0, 0);
    
    // Get the last day of the week (Saturday)
    const lastDay = new Date(firstDay);
    lastDay.setDate(firstDay.getDate() + 6);
    lastDay.setHours(23, 59, 59, 999);
    
    // Calculate week number within the month (1-based)
    const firstDayOfMonth = new Date(firstDay.getFullYear(), firstDay.getMonth(), 1);
    const daysFromMonthStart = Math.floor((firstDay - firstDayOfMonth) / (1000 * 60 * 60 * 24));
    const weekNumber = Math.floor(daysFromMonthStart / 7) + 1;
    
    const startMonth = firstDay.toLocaleString('default', { month: 'short' });
    const endMonth = lastDay.toLocaleString('default', { month: 'short' });
    const startYear = firstDay.getFullYear();
    const endYear = lastDay.getFullYear();
    
    const dateRange = startMonth === endMonth && startYear === endYear
      ? `${startMonth} ${firstDay.getDate()}–${lastDay.getDate()}, ${startYear}`
      : `${startMonth} ${firstDay.getDate()}, ${startYear} – ${endMonth} ${lastDay.getDate()}, ${endYear}`;
    
    return {
      weekNumber: `Week ${weekNumber} of ${month} ${year}`,
      dateRange: dateRange,
      weekStart: firstDay,
      weekEnd: lastDay
    };
  };

  // Generate all weeks from Dec 2025 to Dec 2030
  const generateAllWeeks = () => {
    const weeks = [];
    const startDate = new Date('2025-12-01');
    const endDate = new Date('2030-12-31');
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const weekInfo = getWeekInfo(current);
      weeks.push({
        id: `week-${current.getTime()}`,
        date: new Date(current),
        ...weekInfo
      });
      // Move to next week
      current.setDate(current.getDate() + 7);
    }
    
    return weeks;
  };

  const allWeeks = useMemo(() => generateAllWeeks(), []);

  // Initialize timesheet entry
  const initializeTimesheet = (agentId, weekDate) => {
    const weekInfo = getWeekInfo(weekDate);
    return {
      agentId: agentId,
      weekStart: weekInfo.weekStart.toISOString(),
      weekEnd: weekInfo.weekEnd.toISOString(),
      weekNumber: weekInfo.weekNumber,
      dateRange: weekInfo.dateRange,
      hoursWorked: 0,
      hourlyRate: 0,
      totalAmount: 0,
      approvalStatus: 'Not Approved',
      conditionalComment: '',
      paidToBank: 'No'
    };
  };

  // Find or create timesheet entry
  const getTimesheetEntry = (agentId, weekDate) => {
    const weekInfo = getWeekInfo(weekDate);
    const weekStart = weekInfo.weekStart.toISOString();
    
    const existing = timesheets.find(
      ts => ts.agentId === agentId && 
      new Date(ts.weekStart).getTime() === weekInfo.weekStart.getTime()
    );
    
    if (existing) {
      return existing;
    }
    
    return initializeTimesheet(agentId, weekDate);
  };

  const handleDateChange = (timesheetId, newDate) => {
    if (!newDate) return;
    const weekInfo = getWeekInfo(newDate);
    updateTimesheet(timesheetId, {
      weekStart: weekInfo.weekStart.toISOString(),
      weekEnd: weekInfo.weekEnd.toISOString(),
      weekNumber: weekInfo.weekNumber,
      dateRange: weekInfo.dateRange
    });
  };

  const handleHoursChange = (timesheetId, hours) => {
    const timesheet = timesheets.find(ts => ts._id === timesheetId);
    if (!timesheet) return;
    
    const totalAmount = parseFloat(hours) * parseFloat(timesheet.hourlyRate || 0);
    updateTimesheet(timesheetId, {
      hoursWorked: parseFloat(hours) || 0,
      totalAmount: totalAmount
    });
  };

  const handleRateChange = (timesheetId, rate) => {
    const timesheet = timesheets.find(ts => ts._id === timesheetId);
    if (!timesheet) return;
    
    const totalAmount = parseFloat(timesheet.hoursWorked || 0) * parseFloat(rate);
    updateTimesheet(timesheetId, {
      hourlyRate: parseFloat(rate) || 0,
      totalAmount: totalAmount
    });
  };

  const updateTimesheet = (timesheetId, updates) => {
    setTimesheets(prev => prev.map(ts => 
      ts._id === timesheetId ? { ...ts, ...updates } : ts
    ));
  };

  const handleAddEntry = () => {
    if (!agents.length) {
      alert('Please load agents first');
      return;
    }
    
    const newEntry = initializeTimesheet(agents[0]._id, new Date());
    setTimesheets(prev => [...prev, { ...newEntry, _id: `temp-${Date.now()}` }]);
    setEditingId(`temp-${Date.now()}`);
  };

  const handleSave = async (timesheet) => {
    try {
      if (timesheet._id && timesheet._id.startsWith('temp-')) {
        // New entry
        const response = await api.post('/admin/timesheets', timesheet);
        setTimesheets(prev => prev.map(ts => 
          ts._id === timesheet._id ? response.data.timesheet : ts
        ));
      } else {
        // Update existing
        await api.put(`/admin/timesheets/${timesheet._id}`, timesheet);
      }
      setEditingId(null);
      loadTimesheets();
    } catch (error) {
      console.error('Error saving timesheet:', error);
      alert(error.response?.data?.message || 'Failed to save timesheet');
    }
  };

  const handleDelete = async (timesheetId) => {
    if (!window.confirm('Are you sure you want to delete this timesheet entry?')) {
      return;
    }
    
    try {
      await api.delete(`/admin/timesheets/${timesheetId}`);
      setTimesheets(prev => prev.filter(ts => ts._id !== timesheetId));
    } catch (error) {
      console.error('Error deleting timesheet:', error);
      alert(error.response?.data?.message || 'Failed to delete timesheet');
    }
  };

  // Filter timesheets
  const filteredTimesheets = useMemo(() => {
    return timesheets.filter(ts => {
      const agent = agents.find(a => a._id === ts.agentId);
      const agentName = agent?.name || '';
      
      const matchesSearch = !searchTerm || 
        agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ts.weekNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesAgent = !filterAgent || ts.agentId === filterAgent;
      const matchesStatus = !filterStatus || ts.approvalStatus === filterStatus;
      
      return matchesSearch && matchesAgent && matchesStatus;
    });
  }, [timesheets, agents, searchTerm, filterAgent, filterStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredTimesheets.length / itemsPerPage);
  const paginatedTimesheets = filteredTimesheets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getAgentName = (agentId) => {
    const agent = agents.find(a => a._id === agentId);
    return agent?.name || 'Unknown Agent';
  };

  return (
    <Layout title="Timesheet Calculator">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="bg-white/80 rounded-3xl shadow-lg border border-white/60 p-6 backdrop-blur">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Timesheet Management</h2>
              <p className="text-sm text-gray-600 mt-1">
                Manage weekly timesheets for agents from December 2025 to December 2030
              </p>
            </div>
            <button
              onClick={handleAddEntry}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Add Entry
            </button>
          </div>

          {/* Filters */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by agent or week..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterAgent}
              onChange={(e) => setFilterAgent(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Agents</option>
              {agents.map(agent => (
                <option key={agent._id} value={agent._id}>{agent.name}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Not Approved">Not Approved</option>
              <option value="Conditionally Approved">Conditionally Approved</option>
            </select>
          </div>
        </div>

        {/* Timesheet Table */}
        <div className="bg-white/80 rounded-3xl shadow-lg border border-white/60 backdrop-blur overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Agent Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Week
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Range
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hours Worked
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hourly Rate (USD)
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Approval Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Paid to Bank
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedTimesheets.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                          No timesheet entries found. Click "Add Entry" to create one.
                        </td>
                      </tr>
                    ) : (
                      paginatedTimesheets.map((timesheet) => {
                        const isEditing = editingId === timesheet._id;
                        const weekDate = timesheet.weekStart ? new Date(timesheet.weekStart) : new Date();
                        
                        return (
                          <tr key={timesheet._id} className="hover:bg-gray-50 transition-colors">
                            {/* Agent Name */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              {isEditing ? (
                                <select
                                  value={timesheet.agentId || ''}
                                  onChange={(e) => updateTimesheet(timesheet._id, { agentId: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="">Select Agent</option>
                                  {agents.map(agent => (
                                    <option key={agent._id} value={agent._id}>{agent.name}</option>
                                  ))}
                                </select>
                              ) : (
                                <div className="text-sm font-medium text-gray-900">
                                  {getAgentName(timesheet.agentId)}
                                </div>
                              )}
                            </td>

                            {/* Week Selector */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              {isEditing ? (
                                <div className="relative">
                                  <input
                                    type="date"
                                    value={weekDate.toISOString().split('T')[0]}
                                    onChange={(e) => handleDateChange(timesheet._id, e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                              ) : (
                                <div className="text-sm text-gray-900">
                                  {timesheet.weekNumber || 'N/A'}
                                </div>
                              )}
                            </td>

                            {/* Date Range */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">
                                {timesheet.dateRange || 'N/A'}
                              </div>
                            </td>

                            {/* Hours Worked */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              {isEditing ? (
                                <input
                                  type="number"
                                  min="0"
                                  step="0.25"
                                  value={timesheet.hoursWorked || 0}
                                  onChange={(e) => handleHoursChange(timesheet._id, e.target.value)}
                                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              ) : (
                                <div className="text-sm text-gray-900">
                                  {timesheet.hoursWorked || 0}
                                </div>
                              )}
                            </td>

                            {/* Hourly Rate */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              {isEditing ? (
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={timesheet.hourlyRate || 0}
                                  onChange={(e) => handleRateChange(timesheet._id, e.target.value)}
                                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              ) : (
                                <div className="text-sm text-gray-900">
                                  ${timesheet.hourlyRate || 0}
                                </div>
                              )}
                            </td>

                            {/* Total Amount */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-900">
                                ${(timesheet.totalAmount || 0).toFixed(2)}
                              </div>
                            </td>

                            {/* Approval Status */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              {isEditing ? (
                                <div className="space-y-2">
                                  <select
                                    value={timesheet.approvalStatus || 'Not Approved'}
                                    onChange={(e) => updateTimesheet(timesheet._id, { 
                                      approvalStatus: e.target.value,
                                      conditionalComment: e.target.value !== 'Conditionally Approved' ? '' : timesheet.conditionalComment
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="Approved">Approved</option>
                                    <option value="Not Approved">Not Approved</option>
                                    <option value="Conditionally Approved">Conditionally Approved</option>
                                  </select>
                                  {timesheet.approvalStatus === 'Conditionally Approved' && (
                                    <textarea
                                      placeholder="Enter comment..."
                                      value={timesheet.conditionalComment || ''}
                                      onChange={(e) => updateTimesheet(timesheet._id, { conditionalComment: e.target.value })}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                      rows="2"
                                    />
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                    timesheet.approvalStatus === 'Approved' 
                                      ? 'bg-green-100 text-green-800'
                                      : timesheet.approvalStatus === 'Conditionally Approved'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {timesheet.approvalStatus || 'Not Approved'}
                                  </span>
                                  {timesheet.conditionalComment && (
                                    <span className="text-xs text-gray-500" title={timesheet.conditionalComment}>
                                      💬
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>

                            {/* Paid to Bank */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              {isEditing ? (
                                <select
                                  value={timesheet.paidToBank || 'No'}
                                  onChange={(e) => updateTimesheet(timesheet._id, { paidToBank: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="Yes">Yes</option>
                                  <option value="No">No</option>
                                </select>
                              ) : (
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  timesheet.paidToBank === 'Yes' 
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {timesheet.paidToBank || 'No'}
                                </span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {isEditing ? (
                                  <>
                                    <button
                                      onClick={() => handleSave(timesheet)}
                                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                      title="Save"
                                    >
                                      <Save className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => setEditingId(null)}
                                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition"
                                      title="Cancel"
                                    >
                                      ✕
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => setEditingId(timesheet._id)}
                                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                      title="Edit"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(timesheet._id)}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                  <div className="text-sm text-gray-700">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredTimesheets.length)} of {filteredTimesheets.length} entries
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TimesheetCalculator;

