import React, { useEffect, useState } from 'react';
import api from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import { 
  FileText, 
  Users, 
  Clock, 
  Calendar, 
  DollarSign, 
  Eye, 
  Download, 
  Trash2, 
  X,
  Building2,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader
} from 'lucide-react';

const CompanyAdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const legacyToken = localStorage.getItem('hiringProToken');
  const [token, setToken] = useState(localStorage.getItem('hiringProAdminToken') || legacyToken);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [offerLetters, setOfferLetters] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [employeeDetail, setEmployeeDetail] = useState(null);
  const [offerForm, setOfferForm] = useState({
    candidateName: '',
    roleTitle: '',
    startDate: '',
    salaryPackage: '',
    ctcBreakdown: '',
    notes: ''
  });
  const [offerContent, setOfferContent] = useState('');
  const [error, setError] = useState('');
  const [offerActionError, setOfferActionError] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoLoggingIn, setAutoLoggingIn] = useState(false);
  const [viewingOffer, setViewingOffer] = useState(null);
  const [viewingOfferUrl, setViewingOfferUrl] = useState(null);
  const [loadingOffer, setLoadingOffer] = useState(false);

  const loadCompanyData = async (authToken) => {
    const [profile, employeeRes, offerRes, timesheetRes, holidayRes, expenseRes] = await Promise.all([
      api.get('/hiring-pro/company/profile', { headers: { Authorization: `Bearer ${authToken}` } }),
      api.get('/hiring-pro/company/employees', { headers: { Authorization: `Bearer ${authToken}` } }),
      api.get('/hiring-pro/company/offer-letters', { headers: { Authorization: `Bearer ${authToken}` } }),
      api.get('/hiring-pro/company/timesheets', { headers: { Authorization: `Bearer ${authToken}` } }),
      api.get('/hiring-pro/company/holidays', { headers: { Authorization: `Bearer ${authToken}` } }),
      api.get('/hiring-pro/company/expenses', { headers: { Authorization: `Bearer ${authToken}` } })
    ]);
    setCompany(profile.data.company);
    setEmployees(employeeRes.data.employees || []);
    setOfferLetters(offerRes.data.offerLetters || []);
    setTimesheets(timesheetRes.data.timesheets || []);
    setHolidays(holidayRes.data.holidays || []);
    setExpenses(expenseRes.data.expenses || []);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/hiring-pro/auth/customer-login', { email, password });
      if (response.data.success) {
        localStorage.setItem('hiringProAdminToken', response.data.token);
        localStorage.removeItem('hiringProToken');
        setToken(response.data.token);
        await loadCompanyData(response.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateOffer = async () => {
    setError('');
    try {
      const response = await api.post('/hiring-pro/company/offer-letter/generate', offerForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOfferContent(response.data.content || '');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to generate offer letter');
    }
  };

  const handleSaveOffer = async () => {
    setError('');
    try {
      const response = await api.post('/hiring-pro/company/offer-letter', {
        ...offerForm,
        content: offerContent
      }, { headers: { Authorization: `Bearer ${token}` } });
      setOfferLetters(prev => [response.data.offerLetter, ...prev]);
      setOfferContent('');
      setOfferForm({
        candidateName: '',
        roleTitle: '',
        startDate: '',
        salaryPackage: '',
        ctcBreakdown: '',
        notes: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save offer letter');
    }
  };

  const handleDeleteOffer = async (offerId) => {
    const confirmDelete = window.confirm('Delete this offer letter? This cannot be undone.');
    if (!confirmDelete) return;
    setError('');
    try {
      await api.delete(`/hiring-pro/company/offer-letters/${offerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOfferLetters(prev => prev.filter(letter => letter._id !== offerId));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete offer letter');
    }
  };

  const fetchOfferPdf = async (offerId) => {
    const response = await api.get(`/hiring-pro/company/offer-letters/${offerId}/download`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    });
    return new Blob([response.data], { type: 'application/pdf' });
  };

  const handleViewOffer = async (offerId) => {
    setOfferActionError('');
    setLoadingOffer(true);
    setViewingOffer(offerId);
    try {
      const blob = await fetchOfferPdf(offerId);
      const url = window.URL.createObjectURL(blob);
      setViewingOfferUrl(url);
    } catch (err) {
      setOfferActionError(err.response?.data?.message || 'Unable to open offer letter');
      setViewingOffer(null);
    } finally {
      setLoadingOffer(false);
    }
  };

  const closeViewModal = () => {
    if (viewingOfferUrl) {
      window.URL.revokeObjectURL(viewingOfferUrl);
    }
    setViewingOffer(null);
    setViewingOfferUrl(null);
    setOfferActionError('');
  };

  const handleDownloadOffer = async (offerId, candidateName) => {
    setOfferActionError('');
    try {
      const blob = await fetchOfferPdf(offerId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `offer-letter-${(candidateName || 'document').replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (err) {
      setOfferActionError(err.response?.data?.message || 'Unable to download offer letter');
    }
  };

  const handleEmployeeDetail = async (employeeId) => {
    try {
      const response = await api.get(`/hiring-pro/company/employees/${employeeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployeeDetail(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load employee profile');
    }
  };

  const handleTimesheetUpdate = async (timesheetId, updates) => {
    try {
      const response = await api.put(`/hiring-pro/company/timesheets/${timesheetId}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTimesheets(prev => prev.map(item => item._id === timesheetId ? response.data.timesheet : item));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update timesheet');
    }
  };

  const handleHolidayUpdate = async (holidayId, updates) => {
    try {
      const response = await api.put(`/hiring-pro/company/holidays/${holidayId}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHolidays(prev => prev.map(item => item._id === holidayId ? response.data.holiday : item));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update holiday');
    }
  };

  const handleExpenseUpdate = async (expenseId, updates) => {
    try {
      const response = await api.put(`/hiring-pro/company/expenses/${expenseId}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExpenses(prev => prev.map(item => item._id === expenseId ? response.data.expense : item));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update expense');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      approved: { icon: CheckCircle2, color: 'bg-green-100 text-green-700 border-green-200' },
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      rejected: { icon: XCircle, color: 'bg-red-100 text-red-700 border-red-200' },
      edited: { icon: AlertCircle, color: 'bg-blue-100 text-blue-700 border-blue-200' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${config.color}`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  useEffect(() => {
    const exchangeCustomerSession = async () => {
      if (token || authLoading || user?.role !== 'customer') return;
      setAutoLoggingIn(true);
      setError('');
      try {
        const response = await api.post('/hiring-pro/auth/customer-session');
        if (response.data.success) {
          localStorage.setItem('hiringProAdminToken', response.data.token);
          localStorage.removeItem('hiringProToken');
          setToken(response.data.token);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to access Hiring Platform. Please sign in.');
      } finally {
        setAutoLoggingIn(false);
      }
    };
    exchangeCustomerSession();
  }, [token, user, authLoading]);

  useEffect(() => {
    if (token) {
      loadCompanyData(token).catch((err) => {
        setError(err.response?.data?.message || 'Unable to load company data');
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('hiringProAdminToken');
          setToken(null);
        }
      });
    }
  }, [token]);

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-gray-200 p-8">
          {autoLoggingIn ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader className="h-10 w-10 text-indigo-600 animate-spin" />
              <p className="mt-4 text-sm text-gray-600 font-medium">Opening Hiring Platform...</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <Building2 className="h-12 w-12 text-indigo-600 mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-gray-900">Company Admin Login</h2>
                <p className="text-sm text-gray-600 mt-2">Sign in to access your dashboard</p>
              </div>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="admin@company.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-indigo-600 text-white py-2.5 font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              {company?.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={`${company?.name || 'Company'} logo`}
                  className="h-16 w-16 rounded-lg object-contain border border-gray-200 bg-white p-2 shadow-sm"
                />
              ) : (
                <div className="h-16 w-16 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-indigo-600" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{company?.name || 'Company'}</h1>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Signing Authority:</span> {company?.signingAuthority?.name} ({company?.signingAuthority?.title})
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Offer Letter Generator */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Offer Letter Generator</h2>
            </div>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['candidateName', 'roleTitle', 'startDate', 'salaryPackage'].map(field => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {field.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <input
                      value={offerForm[field]}
                      onChange={(e) => setOfferForm(prev => ({ ...prev, [field]: e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">CTC Breakdown</label>
                <textarea
                  value={offerForm.ctcBreakdown}
                  onChange={(e) => setOfferForm(prev => ({ ...prev, ctcBreakdown: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  rows={3}
                  placeholder="Enter CTC breakdown details"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Additional Notes</label>
                <textarea
                  value={offerForm.notes}
                  onChange={(e) => setOfferForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  rows={2}
                  placeholder="Any additional notes or information"
                />
              </div>
              <button
                onClick={handleGenerateOffer}
                className="w-full rounded-lg bg-gray-900 text-white px-4 py-3 font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="h-5 w-5" />
                Generate Offer Letter
              </button>
              {offerContent && (
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Generated Content</label>
                  <textarea
                    value={offerContent}
                    onChange={(e) => setOfferContent(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    rows={10}
                  />
                  <button
                    onClick={handleSaveOffer}
                    className="w-full rounded-lg bg-indigo-600 text-white px-4 py-3 font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    Save Offer Letter
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Employee Personal Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Employee Personal Details</h2>
            </div>
            <div className="space-y-3">
              {employees.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No employees found</p>
              ) : (
                employees.map(employee => (
                  <div key={employee._id} className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:border-indigo-300 hover:shadow-sm transition-all">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{employee.name}</p>
                        <p className="text-sm text-gray-600">{employee.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleEmployeeDetail(employee._id)}
                      className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                      View profile
                    </button>
                  </div>
                ))
              )}
            </div>
            {employeeDetail && (
              <div className="mt-6 border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">{employeeDetail.employee.name}</h3>
                  <button
                    onClick={() => setEmployeeDetail(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600"><span className="font-medium">Email:</span> {employeeDetail.employee.email}</p>
                  <p className="text-gray-600"><span className="font-medium">Designation:</span> {employeeDetail.employee.designation || '—'}</p>
                  <p className="text-gray-600"><span className="font-medium">Phone:</span> {employeeDetail.profile?.phone || '—'}</p>
                  <p className="text-gray-600"><span className="font-medium">Emergency Contact:</span> {employeeDetail.profile?.emergencyContact || '—'}</p>
                  <p className="text-gray-600"><span className="font-medium">Blood Group:</span> {employeeDetail.profile?.bloodGroup || '—'}</p>
                  <p className="text-gray-600"><span className="font-medium">Current Address:</span> {employeeDetail.profile?.currentAddress || '—'}</p>
                  <p className="text-gray-600"><span className="font-medium">Qualification:</span> {employeeDetail.profile?.highestQualification || '—'}</p>
                  <p className="text-gray-600"><span className="font-medium">Previous Employer:</span> {employeeDetail.profile?.previousEmployer || '—'}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Timesheet CRM */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Timesheet CRM</h2>
          </div>
          <div className="space-y-3">
            {timesheets.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No timesheets submitted yet</p>
            ) : (
              timesheets.map(timesheet => (
                <div key={timesheet._id} className="rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{timesheet.employeeId?.name || 'Employee'}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(timesheet.weekStart).toLocaleDateString()} - {new Date(timesheet.weekEnd).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        defaultValue={timesheet.hoursWorked}
                        className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        onBlur={(e) => handleTimesheetUpdate(timesheet._id, { hoursWorked: e.target.value })}
                      />
                      <select
                        defaultValue={timesheet.status}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        onChange={(e) => handleTimesheetUpdate(timesheet._id, { status: e.target.value })}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="edited">Edited</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Holidays Tracker */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Holidays Tracker</h2>
          </div>
          <div className="space-y-3">
            {holidays.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No holiday requests yet</p>
            ) : (
              holidays.map(holiday => (
                <div key={holiday._id} className="rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{holiday.employeeId?.name || 'Employee'}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(holiday.startDate).toLocaleDateString()} - {new Date(holiday.endDate).toLocaleDateString()}
                        </p>
                        {holiday.notes && (
                          <p className="text-sm text-gray-500 mt-1">{holiday.notes}</p>
                        )}
                      </div>
                    </div>
                    <select
                      defaultValue={holiday.status}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      onChange={(e) => handleHolidayUpdate(holiday._id, { status: e.target.value })}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Employee Expense Tracker */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-yellow-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Employee Expense Tracker</h2>
          </div>
          <div className="space-y-3">
            {expenses.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No expenses submitted yet</p>
            ) : (
              expenses.map(expense => (
                <div key={expense._id} className="rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{expense.employeeId?.name || 'Employee'}</p>
                        <p className="text-sm text-gray-600">£{expense.amount} • {expense.description}</p>
                      </div>
                    </div>
                    <select
                      defaultValue={expense.status}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      onChange={(e) => handleExpenseUpdate(expense._id, { status: e.target.value })}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Offer Letters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <FileText className="h-5 w-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Offer Letters</h2>
          </div>
          {offerActionError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {offerActionError}
            </div>
          )}
          <div className="space-y-3">
            {offerLetters.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No offer letters created yet</p>
            ) : (
              offerLetters.map(letter => (
                <div key={letter._id} className="rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-all">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-lg">
                        {letter.candidateName} — {letter.roleTitle}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Start Date: {letter.startDate}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {letter.fileUrl ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleViewOffer(letter._id)}
                            className="inline-flex items-center gap-2 rounded-lg border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadOffer(letter._id, letter.candidateName)}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-500 px-3 py-2">Document not ready</span>
                      )}
                      <button
                        onClick={() => handleDeleteOffer(letter._id)}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* PDF View Modal */}
      {viewingOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Offer Letter Preview</h3>
              <button
                onClick={closeViewModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {loadingOffer ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Loader className="h-8 w-8 text-indigo-600 animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-600">Loading offer letter...</p>
                  </div>
                </div>
              ) : viewingOfferUrl ? (
                <iframe
                  src={viewingOfferUrl}
                  className="w-full h-full border-0"
                  title="Offer Letter PDF"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-gray-600">Unable to load offer letter</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyAdminDashboard;
