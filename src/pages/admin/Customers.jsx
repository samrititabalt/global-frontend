import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/axios';
import { Search, Plus, Minus, X, User, Mail, Clock, Package } from 'lucide-react';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [minuteAmount, setMinuteAmount] = useState('');
  const [minuteReason, setMinuteReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [searchTerm, customers]);

  const loadCustomers = async () => {
    try {
      const response = await api.get('/admin/customers');
      setCustomers(response.data.customers || []);
      setFilteredCustomers(response.data.customers || []);
    } catch (error) {
      console.error('Error loading customers:', error);
      alert('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustMinutes = (customer) => {
    setSelectedCustomer(customer);
    setMinuteAmount('');
    setMinuteReason('');
    setShowModal(true);
  };

  const handleMinuteSubmit = async (e) => {
    e.preventDefault();
    if (!minuteAmount || parseInt(minuteAmount) === 0) {
      alert('Please enter a valid amount (cannot be zero)');
      return;
    }

    setAdjusting(true);
    try {
      const response = await api.put(`/admin/customers/${selectedCustomer._id}/tokens`, {
        amount: parseInt(minuteAmount),
        reason: minuteReason || 'Admin adjustment'
      });

      if (response.data.success) {
        setShowModal(false);
        setSelectedCustomer(null);
        setMinuteAmount('');
        setMinuteReason('');
        loadCustomers();
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
      <Layout title="Manage Customers">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-800"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Manage Customers">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-blue-900 text-white rounded-3xl p-6 shadow-2xl">
          <h1 className="text-3xl font-bold mb-2">Customer Management</h1>
          <p className="text-gray-200">View and manage customer accounts and adjust their service minutes</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or email..."
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
                <p className="text-sm text-gray-500 uppercase tracking-wide">Total Customers</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{customers.length}</p>
              </div>
              <User className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wide">Total Minutes</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {customers.reduce((sum, c) => sum + (Number(c.tokenBalance) || 0), 0).toLocaleString()}
                </p>
              </div>
              <Clock className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wide">Active Plans</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {customers.filter(c => c.planStatus === 'approved').length}
                </p>
              </div>
              <Package className="w-12 h-12 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service Minutes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      {searchTerm ? 'No customers found matching your search.' : 'No customers found.'}
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                            <div className="text-sm text-gray-500">{customer.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {customer.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-green-600" />
                          <span className="text-sm font-semibold text-gray-900">
                            {formatMinutes(customer.tokenBalance)}
                          </span>
                          <span className="text-sm text-gray-500 ml-1">
                            ({Number(customer.tokenBalance ?? 0).toLocaleString()} min)
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.currentPlan?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          customer.planStatus === 'approved' ? 'bg-green-100 text-green-800' :
                          customer.planStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          customer.planStatus === 'expired' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {customer.planStatus || 'none'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleAdjustMinutes(customer)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Adjust Minutes
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Minutes Adjustment Modal */}
        {showModal && selectedCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Adjust Minutes
                  </h2>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedCustomer(null);
                      setMinuteAmount('');
                      setMinuteReason('');
                    }}
                    className="text-gray-400 hover:text-gray-600 transition"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Customer: <span className="font-semibold">{selectedCustomer.name}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Current Balance: <span className="font-semibold text-primary-600">
                    {formatMinutes(selectedCustomer.tokenBalance)} ({Number(selectedCustomer.tokenBalance ?? 0).toLocaleString()} min)
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
                          {formatMinutes((Number(selectedCustomer.tokenBalance) || 0) + parseInt(minuteAmount))}
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
                      setShowModal(false);
                      setSelectedCustomer(null);
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
      </div>
    </Layout>
  );
};

export default AdminCustomers;
