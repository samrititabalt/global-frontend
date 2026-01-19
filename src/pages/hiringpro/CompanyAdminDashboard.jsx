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
  const [employeeEdit, setEmployeeEdit] = useState({ name: '', email: '', designation: '' });
  const [profileEdit, setProfileEdit] = useState({
    phone: '',
    emergencyContact: '',
    bloodGroup: '',
    currentAddress: '',
    highestQualification: '',
    previousEmployer: ''
  });
  const [savingEmployeeDetail, setSavingEmployeeDetail] = useState(false);
  const [salaryBreakup, setSalaryBreakup] = useState(null);
  const [salaryCurrency, setSalaryCurrency] = useState('USD');
  const [salaryGenerating, setSalaryGenerating] = useState(false);
  const [salarySaving, setSalarySaving] = useState(false);
  const [expenseTemplate, setExpenseTemplate] = useState(null);
  const [expenseTemplateSaving, setExpenseTemplateSaving] = useState(false);
  const [expenseTemplateGenerating, setExpenseTemplateGenerating] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [expenseComment, setExpenseComment] = useState('');
  const [expenseFilters, setExpenseFilters] = useState({
    status: '',
    employeeId: '',
    expenseType: '',
    from: '',
    to: ''
  });
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

  const fetchDocumentBlob = async (documentId, action = 'view') => {
    const response = await api.get(`/hiring-pro/company/documents/${documentId}/${action}`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    });
    return new Blob([response.data], { type: response.headers?.['content-type'] || 'application/octet-stream' });
  };

  const handleDownloadDocument = async (documentId, fileName) => {
    setError('');
    try {
      const blob = await fetchDocumentBlob(documentId, 'download');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${(fileName || 'document').replace(/\s+/g, '-')}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to download document');
    }
  };

  const handleDeleteDocument = async (documentId) => {
    setError('');
    try {
      await api.delete(`/hiring-pro/company/documents/${documentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployeeDetail((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          documents: prev.documents?.filter((doc) => doc._id !== documentId) || []
        };
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete document');
    }
  };

  const loadCompanyData = async (authToken) => {
    const [profile, employeeRes, offerRes, timesheetRes, holidayRes, expenseRes, templateRes] = await Promise.all([
      api.get('/hiring-pro/company/profile', { headers: { Authorization: `Bearer ${authToken}` } }),
      api.get('/hiring-pro/company/employees', { headers: { Authorization: `Bearer ${authToken}` } }),
      api.get('/hiring-pro/company/offer-letters', { headers: { Authorization: `Bearer ${authToken}` } }),
      api.get('/hiring-pro/company/timesheets', { headers: { Authorization: `Bearer ${authToken}` } }),
      api.get('/hiring-pro/company/holidays', { headers: { Authorization: `Bearer ${authToken}` } }),
      api.get('/hiring-pro/company/expenses', { headers: { Authorization: `Bearer ${authToken}` } }),
      api.get('/hiring-pro/company/expense-template', { headers: { Authorization: `Bearer ${authToken}` } })
    ]);
    setCompany(profile.data.company);
    setEmployees(employeeRes.data.employees || []);
    setOfferLetters(offerRes.data.offerLetters || []);
    setTimesheets(timesheetRes.data.timesheets || []);
    setHolidays(holidayRes.data.holidays || []);
    setExpenses(expenseRes.data.expenses || []);
    setExpenseTemplate(templateRes.data.template || null);
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

  const fetchOfferPdf = async (offerId) => {
    const response = await api.get(`/hiring-pro/company/offer-letters/${offerId}/download`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    });
    return new Blob([response.data], { type: 'application/pdf' });
  };

  const handleViewOffer = async (offerId) => {
    setOfferActionError('');
    const previewWindow = window.open('', '_blank', 'noopener,noreferrer');
    if (!previewWindow) {
      setOfferActionError('Pop-up blocked. Please allow pop-ups to view the offer letter.');
      return;
    }
    try {
      const blob = await fetchOfferPdf(offerId);
      const url = window.URL.createObjectURL(blob);
      previewWindow.location = url;
      setTimeout(() => window.URL.revokeObjectURL(url), 2000);
    } catch (err) {
      previewWindow.close();
      setOfferActionError(err.response?.data?.message || 'Unable to open offer letter');
    }
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
      setEmployeeEdit({
        name: response.data.employee?.name || '',
        email: response.data.employee?.email || '',
        designation: response.data.employee?.designation || ''
      });
      setProfileEdit({
        phone: response.data.profile?.phone || '',
        emergencyContact: response.data.profile?.emergencyContact || '',
        bloodGroup: response.data.profile?.bloodGroup || '',
        currentAddress: response.data.profile?.currentAddress || '',
        highestQualification: response.data.profile?.highestQualification || '',
        previousEmployer: response.data.profile?.previousEmployer || ''
      });
      if (response.data.profile?.salaryBreakup?.components?.length) {
        setSalaryBreakup(response.data.profile.salaryBreakup);
        setSalaryCurrency(response.data.profile.salaryBreakup.currency || 'USD');
      } else {
        setSalaryBreakup(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load employee profile');
    }
  };

  const normalizeSalaryBreakup = (payload) => {
    if (!payload) return null;
    const components = Array.isArray(payload.components) ? payload.components : [];
    const sanitized = components.map((item) => ({
      key: item.key || '',
      label: item.label || '',
      amount: Number(item.amount) || 0,
      description: item.description || '',
      category: item.category === 'deduction' ? 'deduction' : 'earning'
    }));
    const totalCtc = sanitized
      .filter((item) => item.category === 'earning')
      .reduce((sum, item) => sum + item.amount, 0);
    const totalDeductions = sanitized
      .filter((item) => item.category === 'deduction')
      .reduce((sum, item) => sum + item.amount, 0);
    return {
      currency: payload.currency || salaryCurrency || 'USD',
      components: sanitized,
      totalCtc,
      netPay: totalCtc - totalDeductions
    };
  };

  const handleGenerateSalaryBreakup = async () => {
    if (!employeeDetail?.employee?._id) return;
    setSalaryGenerating(true);
    setError('');
    try {
      const response = await api.post(
        `/hiring-pro/company/employees/${employeeDetail.employee._id}/salary-breakup/generate`,
        { currency: salaryCurrency },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const normalized = normalizeSalaryBreakup(response.data.salaryBreakup);
      setSalaryBreakup(normalized);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to generate salary breakup');
    } finally {
      setSalaryGenerating(false);
    }
  };

  const handleSaveSalaryBreakup = async () => {
    if (!employeeDetail?.employee?._id || !salaryBreakup) return;
    setSalarySaving(true);
    setError('');
    try {
      const normalized = normalizeSalaryBreakup(salaryBreakup);
      const response = await api.put(
        `/hiring-pro/company/employees/${employeeDetail.employee._id}/salary-breakup`,
        { salaryBreakup: normalized },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEmployeeDetail(response.data);
      setSalaryBreakup(response.data.profile?.salaryBreakup || normalized);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save salary breakup');
    } finally {
      setSalarySaving(false);
    }
  };

  const handleSaveEmployeeDetail = async () => {
    if (!employeeDetail?.employee?._id) return;
    setError('');
    setSavingEmployeeDetail(true);
    try {
      const response = await api.put(`/hiring-pro/company/employees/${employeeDetail.employee._id}/profile`, {
        employee: employeeEdit,
        profile: profileEdit
      }, { headers: { Authorization: `Bearer ${token}` } });
      setEmployeeDetail(response.data);
      setEmployees(prev => prev.map(emp => (
        emp._id === response.data.employee._id
          ? { ...emp, name: response.data.employee.name, email: response.data.employee.email }
          : emp
      )));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update employee details');
    } finally {
      setSavingEmployeeDetail(false);
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
      if (selectedExpense?._id === expenseId) {
        setSelectedExpense(response.data.expense);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update expense');
    }
  };

  const fetchExpenses = async (filters = expenseFilters) => {
    try {
      const response = await api.get('/hiring-pro/company/expenses', {
        headers: { Authorization: `Bearer ${token}` },
        params: filters
      });
      setExpenses(response.data.expenses || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load expenses');
    }
  };

  const handleGenerateExpenseTemplate = async () => {
    setExpenseTemplateGenerating(true);
    setError('');
    try {
      const response = await api.post('/hiring-pro/company/expense-template/generate', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExpenseTemplate(response.data.template);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to generate expense template');
    } finally {
      setExpenseTemplateGenerating(false);
    }
  };

  const handleSaveExpenseTemplate = async () => {
    if (!expenseTemplate) return;
    setExpenseTemplateSaving(true);
    setError('');
    try {
      const response = await api.put('/hiring-pro/company/expense-template', {
        fields: expenseTemplate.fields || []
      }, { headers: { Authorization: `Bearer ${token}` } });
      setExpenseTemplate(response.data.template);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save expense template');
    } finally {
      setExpenseTemplateSaving(false);
    }
  };

  const handleAddTemplateField = () => {
    setExpenseTemplate((prev) => {
      if (!prev) return prev;
      const nextFields = [...(prev.fields || [])];
      nextFields.push({
        key: `custom_field_${nextFields.length + 1}`,
        label: 'Custom Field',
        required: false,
        order: nextFields.length + 1
      });
      return { ...prev, fields: nextFields };
    });
  };

  const handleRemoveTemplateField = (index) => {
    setExpenseTemplate((prev) => {
      if (!prev) return prev;
      const nextFields = [...(prev.fields || [])];
      const field = nextFields[index];
      if (field?.required) return prev;
      nextFields.splice(index, 1);
      return { ...prev, fields: nextFields.map((item, idx) => ({ ...item, order: idx + 1 })) };
    });
  };

  const handleMoveTemplateField = (from, to) => {
    setExpenseTemplate((prev) => {
      if (!prev) return prev;
      const nextFields = [...(prev.fields || [])];
      const [moved] = nextFields.splice(from, 1);
      nextFields.splice(to, 0, moved);
      return { ...prev, fields: nextFields.map((item, idx) => ({ ...item, order: idx + 1 })) };
    });
  };

  const handleExpenseDownloadPdf = async (expenseId) => {
    setError('');
    try {
      const response = await api.get(`/hiring-pro/company/expenses/${expenseId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `expense-${expenseId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to download expense PDF');
    }
  };

  const getExpenseValue = (expense, key) => {
    const entry = expense?.values?.find((item) => item.key === key);
    return entry?.value || '—';
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
              <h4 className="font-semibold text-gray-900 mb-3">Edit employee details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-xs font-semibold text-gray-600">Name</label>
                  <input
                    value={employeeEdit.name}
                    onChange={(e) => setEmployeeEdit(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Email</label>
                  <input
                    value={employeeEdit.email}
                    onChange={(e) => setEmployeeEdit(prev => ({ ...prev, email: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Designation</label>
                  <input
                    value={employeeEdit.designation}
                    onChange={(e) => setEmployeeEdit(prev => ({ ...prev, designation: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Phone</label>
                  <input
                    value={profileEdit.phone}
                    onChange={(e) => setProfileEdit(prev => ({ ...prev, phone: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Emergency Contact</label>
                  <input
                    value={profileEdit.emergencyContact}
                    onChange={(e) => setProfileEdit(prev => ({ ...prev, emergencyContact: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Blood Group</label>
                  <input
                    value={profileEdit.bloodGroup}
                    onChange={(e) => setProfileEdit(prev => ({ ...prev, bloodGroup: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Current Address</label>
                  <input
                    value={profileEdit.currentAddress}
                    onChange={(e) => setProfileEdit(prev => ({ ...prev, currentAddress: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Qualification</label>
                  <input
                    value={profileEdit.highestQualification}
                    onChange={(e) => setProfileEdit(prev => ({ ...prev, highestQualification: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Previous Employer</label>
                  <input
                    value={profileEdit.previousEmployer}
                    onChange={(e) => setProfileEdit(prev => ({ ...prev, previousEmployer: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={handleSaveEmployeeDetail}
                  disabled={savingEmployeeDetail}
                  className="rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-semibold disabled:opacity-60"
                >
                  {savingEmployeeDetail ? 'Saving...' : 'Save Details'}
                </button>
                <button
                  onClick={() => handleEmployeeDetail(employeeDetail.employee._id)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-400"
                >
                  Reset
                </button>
              </div>
              <div className="mt-6 rounded-lg border border-gray-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">Salary Breakup</p>
                    <p className="text-xs text-gray-500">Generate, edit, and push the salary breakup to the employee.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={salaryCurrency}
                      onChange={(e) => setSalaryCurrency(e.target.value)}
                      className="rounded-md border border-gray-300 px-2 py-1 text-sm"
                    >
                      <option value="USD">USD</option>
                      <option value="GBP">GBP</option>
                      <option value="INR">INR</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleGenerateSalaryBreakup}
                      disabled={salaryGenerating}
                      className="rounded-md border border-indigo-200 px-3 py-1 text-sm font-semibold text-indigo-600 hover:border-indigo-300 disabled:opacity-60"
                    >
                      {salaryGenerating ? 'Generating...' : 'Generate Template'}
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveSalaryBreakup}
                      disabled={!salaryBreakup || salarySaving}
                      className="rounded-md bg-indigo-600 px-3 py-1 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {salarySaving ? 'Saving...' : 'Save & Push'}
                    </button>
                  </div>
                </div>
                {salaryBreakup ? (
                  <div className="mt-4 space-y-3">
                    {salaryBreakup.components.map((component, index) => (
                      <div key={`${component.key}-${index}`} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
                        <input
                          value={component.label}
                          onChange={(e) => {
                            const updated = { ...salaryBreakup };
                            updated.components[index] = { ...component, label: e.target.value };
                            setSalaryBreakup(normalizeSalaryBreakup(updated));
                          }}
                          className="rounded-md border border-gray-300 px-2 py-1 text-sm md:col-span-2"
                        />
                        <input
                          type="number"
                          value={component.amount}
                          onChange={(e) => {
                            const updated = { ...salaryBreakup };
                            updated.components[index] = { ...component, amount: Number(e.target.value) };
                            setSalaryBreakup(normalizeSalaryBreakup(updated));
                          }}
                          className="rounded-md border border-gray-300 px-2 py-1 text-sm"
                        />
                        <select
                          value={component.category}
                          onChange={(e) => {
                            const updated = { ...salaryBreakup };
                            updated.components[index] = { ...component, category: e.target.value };
                            setSalaryBreakup(normalizeSalaryBreakup(updated));
                          }}
                          className="rounded-md border border-gray-300 px-2 py-1 text-sm"
                        >
                          <option value="earning">Earning</option>
                          <option value="deduction">Deduction</option>
                        </select>
                        <input
                          value={component.description}
                          onChange={(e) => {
                            const updated = { ...salaryBreakup };
                            updated.components[index] = { ...component, description: e.target.value };
                            setSalaryBreakup(normalizeSalaryBreakup(updated));
                          }}
                          className="rounded-md border border-gray-300 px-2 py-1 text-sm md:col-span-2"
                        />
                      </div>
                    ))}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="rounded-md border border-gray-200 px-3 py-2">
                        <p className="text-xs text-gray-500">Total CTC</p>
                        <p className="font-semibold text-gray-900">
                          {salaryBreakup.currency} {salaryBreakup.totalCtc.toLocaleString()}
                        </p>
                      </div>
                      <div className="rounded-md border border-gray-200 px-3 py-2">
                        <p className="text-xs text-gray-500">Net Pay</p>
                        <p className="font-semibold text-gray-900">
                          {salaryBreakup.currency} {salaryBreakup.netPay.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {employeeDetail.profile?.salaryUpdatedAt && (
                      <p className="text-xs text-gray-500">
                        Last updated by admin on {new Date(employeeDetail.profile.salaryUpdatedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-gray-500">Generate a salary template to begin.</p>
                )}
              </div>
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
                    <div key={doc._id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                      <div>
                        <p className="text-gray-700 font-semibold">{doc.title}</p>
                        <p className="text-xs text-gray-500">{doc.type}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDownloadDocument(doc._id, doc.fileName || doc.title)}
                          className="rounded-md border border-gray-300 px-2 py-1 text-xs font-semibold text-gray-700 hover:border-gray-400"
                        >
                          Download
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDocument(doc._id)}
                          className="rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:border-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
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
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Employee Expense Tracker</h3>
            <p className="text-sm text-gray-500">Standard Expense Template (master format)</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleGenerateExpenseTemplate}
              disabled={expenseTemplateGenerating}
              className="rounded-md border border-indigo-200 px-3 py-1 text-sm font-semibold text-indigo-600 hover:border-indigo-300 disabled:opacity-60"
            >
              {expenseTemplateGenerating ? 'Generating...' : 'Generate Template'}
            </button>
            <button
              type="button"
              onClick={handleSaveExpenseTemplate}
              disabled={expenseTemplateSaving || !expenseTemplate}
              className="rounded-md bg-indigo-600 px-3 py-1 text-sm font-semibold text-white disabled:opacity-60"
            >
              {expenseTemplateSaving ? 'Saving...' : 'Save Template'}
            </button>
            <button
              type="button"
              onClick={handleAddTemplateField}
              disabled={!expenseTemplate}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm font-semibold text-gray-700 hover:border-gray-400 disabled:opacity-60"
            >
              Add Field
            </button>
          </div>
        </div>
        {expenseTemplate ? (
          <div className="space-y-3">
            {(expenseTemplate.fields || []).map((field, index) => (
              <div key={`${field.key}-${index}`} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center">
                <input
                  value={field.label}
                  onChange={(e) => {
                    const updated = { ...expenseTemplate };
                    updated.fields[index] = { ...field, label: e.target.value };
                    setExpenseTemplate(updated);
                  }}
                  className="rounded-md border border-gray-300 px-2 py-1 text-sm md:col-span-2"
                />
                <input
                  value={field.key}
                  onChange={(e) => {
                    const updated = { ...expenseTemplate };
                    updated.fields[index] = { ...field, key: e.target.value };
                    setExpenseTemplate(updated);
                  }}
                  className="rounded-md border border-gray-300 px-2 py-1 text-sm"
                />
                <select
                  value={field.required ? 'required' : 'optional'}
                  onChange={(e) => {
                    const updated = { ...expenseTemplate };
                    updated.fields[index] = { ...field, required: e.target.value === 'required' };
                    setExpenseTemplate(updated);
                  }}
                  className="rounded-md border border-gray-300 px-2 py-1 text-sm"
                >
                  <option value="required">Required</option>
                  <option value="optional">Optional</option>
                </select>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleMoveTemplateField(index, Math.max(0, index - 1))}
                    className="rounded-md border border-gray-300 px-2 py-1 text-xs font-semibold text-gray-700 hover:border-gray-400"
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveTemplateField(index, Math.min(expenseTemplate.fields.length - 1, index + 1))}
                    className="rounded-md border border-gray-300 px-2 py-1 text-xs font-semibold text-gray-700 hover:border-gray-400"
                  >
                    Down
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveTemplateField(index)}
                  className={`rounded-md border px-2 py-1 text-xs font-semibold ${field.required ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-red-200 text-red-600 hover:border-red-300'}`}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600">Generate a template to start.</p>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Expense Dashboard</h3>
        <div className="mb-4 grid grid-cols-1 md:grid-cols-5 gap-3 text-sm">
          <select
            value={expenseFilters.status}
            onChange={(e) => setExpenseFilters(prev => ({ ...prev, status: e.target.value }))}
            className="rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={expenseFilters.employeeId}
            onChange={(e) => setExpenseFilters(prev => ({ ...prev, employeeId: e.target.value }))}
            className="rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="">All Employees</option>
            {employees.map((employee) => (
              <option key={employee._id} value={employee._id}>{employee.name}</option>
            ))}
          </select>
          <input
            type="text"
            value={expenseFilters.expenseType}
            onChange={(e) => setExpenseFilters(prev => ({ ...prev, expenseType: e.target.value }))}
            placeholder="Expense type"
            className="rounded-md border border-gray-300 px-3 py-2"
          />
          <input
            type="date"
            value={expenseFilters.from}
            onChange={(e) => setExpenseFilters(prev => ({ ...prev, from: e.target.value }))}
            className="rounded-md border border-gray-300 px-3 py-2"
          />
          <input
            type="date"
            value={expenseFilters.to}
            onChange={(e) => setExpenseFilters(prev => ({ ...prev, to: e.target.value }))}
            className="rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fetchExpenses(expenseFilters)}
            className="rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white"
          >
            Apply Filters
          </button>
          <button
            type="button"
            onClick={() => {
              const resetFilters = { status: '', employeeId: '', expenseType: '', from: '', to: '' };
              setExpenseFilters(resetFilters);
              fetchExpenses(resetFilters);
            }}
            className="rounded-md border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700"
          >
            Clear
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2 pr-4">Employee</th>
                <th className="py-2 pr-4">Expense Type</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Invoice #</th>
                <th className="py-2 pr-4">Bill #</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Submitted</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense._id} className="border-b last:border-b-0">
                  <td className="py-3 pr-4 font-semibold text-gray-900">{expense.employeeId?.name || 'Employee'}</td>
                  <td className="py-3 pr-4">{expense.expenseType || getExpenseValue(expense, 'expense_type')}</td>
                  <td className="py-3 pr-4">{expense.amount}</td>
                  <td className="py-3 pr-4">{getExpenseValue(expense, 'invoice_number')}</td>
                  <td className="py-3 pr-4">{getExpenseValue(expense, 'bill_number')}</td>
                  <td className="py-3 pr-4 capitalize">{expense.status}</td>
                  <td className="py-3 pr-4">{new Date(expense.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedExpense(expense);
                          setExpenseComment(expense.adminComment || '');
                        }}
                        className="rounded-md border border-gray-300 px-2 py-1 text-xs font-semibold text-gray-700 hover:border-gray-400"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExpenseUpdate(expense._id, { status: 'approved', adminComment: expense.adminComment })}
                        className="rounded-md border border-emerald-200 px-2 py-1 text-xs font-semibold text-emerald-700 hover:border-emerald-300"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExpenseUpdate(expense._id, { status: 'rejected', adminComment: expense.adminComment })}
                        className="rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:border-red-300"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!expenses.length && (
            <p className="text-sm text-gray-600 mt-3">No expenses submitted yet.</p>
          )}
        </div>
        {selectedExpense && (
          <div className="mt-6 rounded-lg border border-gray-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-gray-900">{selectedExpense.employeeId?.name || 'Employee'}</p>
                <p className="text-xs text-gray-500">Expense Sheet Details</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedExpense(null)}
                className="text-xs font-semibold text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            <div className="mt-3 space-y-2 text-sm">
              {(selectedExpense.values || []).map((entry, index) => (
                <div key={`${entry.key}-${index}`} className="flex items-center justify-between gap-4">
                  <span className="text-gray-500">{entry.label}</span>
                  <span className="font-semibold text-gray-900">{entry.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <textarea
                value={expenseComment}
                onChange={(e) => setExpenseComment(e.target.value)}
                placeholder="Add admin comments..."
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExpenseUpdate(selectedExpense._id, { status: selectedExpense.status, adminComment: expenseComment })}
                  className="rounded-md border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:border-gray-400"
                >
                  Save Comment
                </button>
                <button
                  type="button"
                  onClick={() => handleExpenseDownloadPdf(selectedExpense._id)}
                  className="rounded-md border border-indigo-200 px-3 py-2 text-xs font-semibold text-indigo-600 hover:border-indigo-300"
                >
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        )}
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
                      onClick={() => handleViewOffer(letter._id)}
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
                        onClick={() => handleViewOffer(letter._id)}
                        className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-semibold text-gray-700 hover:border-gray-400"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadOffer(letter._id, letter.candidateName)}
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
