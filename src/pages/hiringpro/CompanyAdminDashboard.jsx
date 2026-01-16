import React, { useEffect, useState } from 'react';
import api from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';

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

  const getDownloadUrl = (fileUrl) => {
    if (!fileUrl) return '';
    if (fileUrl.includes('/upload/')) {
      return fileUrl.replace('/upload/', '/upload/fl_attachment/');
    }
    return fileUrl;
  };

  const handleViewOffer = (fileUrl) => {
    setOfferActionError('');
    if (!fileUrl) {
      setOfferActionError('Offer letter file is missing.');
      return;
    }
    const previewWindow = window.open(fileUrl, '_blank', 'noopener,noreferrer');
    if (!previewWindow) {
      setOfferActionError('Pop-up blocked. Please allow pop-ups to view the offer letter.');
    }
  };

  const handleDownloadOffer = (fileUrl, candidateName) => {
    setOfferActionError('');
    if (!fileUrl) {
      setOfferActionError('Offer letter file is missing.');
      return;
    }
    const downloadUrl = getDownloadUrl(fileUrl);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.download = `offer-letter-${(candidateName || 'document').replace(/\s+/g, '-')}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
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
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        {autoLoggingIn ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-200 border-t-indigo-600"></div>
            <p className="mt-4 text-sm text-gray-600">Opening Hiring Platform...</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Company Admin Login</h2>
            {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2"
                placeholder="Admin email"
                required
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2"
                placeholder="Password"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-indigo-600 text-white py-2 font-semibold"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            {company?.logoUrl && (
              <img
                src={company.logoUrl}
                alt={`${company?.name || 'Company'} logo`}
                className="h-14 w-14 rounded-lg object-contain border border-gray-200 bg-white p-1"
              />
            )}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{company?.name}</h2>
              <p className="text-sm text-gray-600">
                Signing Authority: {company?.signingAuthority?.name} ({company?.signingAuthority?.title})
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">Offer Letter Generator</h3>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['candidateName', 'roleTitle', 'startDate', 'salaryPackage'].map(field => (
              <input
                key={field}
                value={offerForm[field]}
                onChange={(e) => setOfferForm(prev => ({ ...prev, [field]: e.target.value }))}
                className="rounded-lg border border-gray-300 px-4 py-2"
                placeholder={field.replace(/([A-Z])/g, ' $1')}
              />
            ))}
          </div>
          <textarea
            value={offerForm.ctcBreakdown}
            onChange={(e) => setOfferForm(prev => ({ ...prev, ctcBreakdown: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-4 py-2"
            rows={3}
            placeholder="CTC breakdown"
          />
          <textarea
            value={offerForm.notes}
            onChange={(e) => setOfferForm(prev => ({ ...prev, notes: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-4 py-2"
            rows={2}
            placeholder="Additional notes"
          />
          <button
            onClick={handleGenerateOffer}
            className="rounded-lg bg-gray-900 text-white px-4 py-2 font-semibold"
          >
            Generate Offer Letter
          </button>
          {offerContent && (
            <div className="space-y-3">
              <textarea
                value={offerContent}
                onChange={(e) => setOfferContent(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2"
                rows={10}
              />
              <button
                onClick={handleSaveOffer}
                className="rounded-lg bg-indigo-600 text-white px-4 py-2 font-semibold"
              >
                Save Offer Letter
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Employee Personal Details</h3>
          <div className="space-y-3">
            {employees.map(employee => (
              <div key={employee._id} className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                <div>
                  <p className="font-semibold">{employee.name}</p>
                  <p className="text-sm text-gray-600">{employee.email}</p>
                </div>
                <button
                  onClick={() => handleEmployeeDetail(employee._id)}
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  View profile
                </button>
              </div>
            ))}
          </div>
          {employeeDetail && (
            <div className="mt-6 border-t border-gray-200 pt-4">
              <h4 className="font-semibold text-gray-900">{employeeDetail.employee.name}</h4>
              <p className="text-sm text-gray-600">{employeeDetail.employee.email}</p>
              <p className="text-sm text-gray-600">Designation: {employeeDetail.employee.designation || '—'}</p>
              <p className="text-sm text-gray-600">Phone: {employeeDetail.profile?.phone || '—'}</p>
              <p className="text-sm text-gray-600">Emergency Contact: {employeeDetail.profile?.emergencyContact || '—'}</p>
              <p className="text-sm text-gray-600">Blood Group: {employeeDetail.profile?.bloodGroup || '—'}</p>
              <p className="text-sm text-gray-600">Current Address: {employeeDetail.profile?.currentAddress || '—'}</p>
              <p className="text-sm text-gray-600">Qualification: {employeeDetail.profile?.highestQualification || '—'}</p>
              <p className="text-sm text-gray-600">Previous Employer: {employeeDetail.profile?.previousEmployer || '—'}</p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="rounded-lg border border-gray-200 p-3">
                  <p className="font-semibold text-gray-900 mb-2">Offer Letters</p>
                  {employeeDetail.offerLetters?.length ? employeeDetail.offerLetters.map(letter => (
                    <p key={letter._id} className="text-gray-600">{letter.roleTitle} • {letter.startDate}</p>
                  )) : <p className="text-gray-500">No offer letters</p>}
                </div>
                <div className="rounded-lg border border-gray-200 p-3">
                  <p className="font-semibold text-gray-900 mb-2">Documents</p>
                  {employeeDetail.documents?.length ? employeeDetail.documents.map(doc => (
                    <p key={doc._id} className="text-gray-600">{doc.title} • {doc.type}</p>
                  )) : <p className="text-gray-500">No documents</p>}
                </div>
                <div className="rounded-lg border border-gray-200 p-3">
                  <p className="font-semibold text-gray-900 mb-2">Timesheets</p>
                  {employeeDetail.timesheets?.length ? employeeDetail.timesheets.map(sheet => (
                    <p key={sheet._id} className="text-gray-600">
                      {new Date(sheet.weekStart).toLocaleDateString()} • {sheet.hoursWorked} hrs • {sheet.status}
                    </p>
                  )) : <p className="text-gray-500">No timesheets</p>}
                </div>
                <div className="rounded-lg border border-gray-200 p-3">
                  <p className="font-semibold text-gray-900 mb-2">Holidays</p>
                  {employeeDetail.holidays?.length ? employeeDetail.holidays.map(holiday => (
                    <p key={holiday._id} className="text-gray-600">
                      {new Date(holiday.startDate).toLocaleDateString()} • {holiday.status}
                    </p>
                  )) : <p className="text-gray-500">No holidays</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Timesheet CRM</h3>
        <div className="space-y-3">
          {timesheets.map(timesheet => (
            <div key={timesheet._id} className="rounded-lg border border-gray-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">{timesheet.employeeId?.name || 'Employee'}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(timesheet.weekStart).toLocaleDateString()} - {new Date(timesheet.weekEnd).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    defaultValue={timesheet.hoursWorked}
                    className="w-24 rounded border border-gray-300 px-2 py-1 text-sm"
                    onBlur={(e) => handleTimesheetUpdate(timesheet._id, { hoursWorked: e.target.value })}
                  />
                  <select
                    defaultValue={timesheet.status}
                    className="rounded border border-gray-300 px-2 py-1 text-sm"
                    onChange={(e) => handleTimesheetUpdate(timesheet._id, { status: e.target.value })}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="edited">Edited</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Holidays Tracker</h3>
        <div className="space-y-3">
          {holidays.map(holiday => (
            <div key={holiday._id} className="rounded-lg border border-gray-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">{holiday.employeeId?.name || 'Employee'}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(holiday.startDate).toLocaleDateString()} - {new Date(holiday.endDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">{holiday.notes || '—'}</p>
                </div>
                <select
                  defaultValue={holiday.status}
                  className="rounded border border-gray-300 px-2 py-1 text-sm"
                  onChange={(e) => handleHolidayUpdate(holiday._id, { status: e.target.value })}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Employee Expense Tracker</h3>
        <div className="space-y-3">
          {expenses.map(expense => (
            <div key={expense._id} className="rounded-lg border border-gray-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">{expense.employeeId?.name || 'Employee'}</p>
                  <p className="text-sm text-gray-600">£{expense.amount} • {expense.description}</p>
                </div>
                <select
                  defaultValue={expense.status}
                  className="rounded border border-gray-300 px-2 py-1 text-sm"
                  onChange={(e) => handleExpenseUpdate(expense._id, { status: e.target.value })}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          ))}
          {!expenses.length && (
            <p className="text-sm text-gray-600">No expenses submitted yet.</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Offer Letters</h3>
        {offerActionError && <div className="mb-3 text-sm text-red-600">{offerActionError}</div>}
        <div className="space-y-3">
          {offerLetters.map(letter => (
            <div key={letter._id} className="rounded-lg border border-gray-200 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  {letter.fileUrl ? (
                    <button
                      type="button"
                      onClick={() => handleViewOffer(letter.fileUrl)}
                      className="font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      {letter.candidateName} — {letter.roleTitle}
                    </button>
                  ) : (
                    <p className="font-semibold">{letter.candidateName} — {letter.roleTitle}</p>
                  )}
                  <p className="text-sm text-gray-600">Start Date: {letter.startDate}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {letter.fileUrl ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleViewOffer(letter.fileUrl)}
                        className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-semibold text-gray-700 hover:border-gray-400"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadOffer(letter.fileUrl, letter.candidateName)}
                        className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-semibold text-gray-700 hover:border-gray-400"
                      >
                        Download
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-gray-500">Document not ready</span>
                  )}
                  <button
                    onClick={() => handleDeleteOffer(letter._id)}
                    className="rounded-lg border border-red-200 px-3 py-1 text-sm font-semibold text-red-600 hover:border-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompanyAdminDashboard;
