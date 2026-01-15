import React, { useEffect, useState } from 'react';
import api from '../../utils/axios';

const EmployeeDashboard = () => {
  const legacyToken = localStorage.getItem('hiringProToken');
  const [token, setToken] = useState(localStorage.getItem('hiringProEmployeeToken') || legacyToken);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [offerLetters, setOfferLetters] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [salaryBreakdown, setSalaryBreakdown] = useState('');
  const [profile, setProfile] = useState({
    phone: '',
    emergencyContact: '',
    bloodGroup: '',
    currentAddress: '',
    highestQualification: '',
    previousEmployer: ''
  });
  const [employeeInfo, setEmployeeInfo] = useState({ name: '', email: '' });
  const [timesheetForm, setTimesheetForm] = useState({ weekStart: '', weekEnd: '', hoursWorked: '' });
  const [holidayForm, setHolidayForm] = useState({ startDate: '', endDate: '', reason: '' });
  const [documentForm, setDocumentForm] = useState({ title: '', type: '', file: null });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/hiring-pro/auth/login', { email, password, role: 'employee' });
      if (response.data.success) {
        localStorage.setItem('hiringProEmployeeToken', response.data.token);
        localStorage.removeItem('hiringProToken');
        setToken(response.data.token);
        const [offers, timesheetRes, holidayRes, docRes, salaryRes, profileRes] = await Promise.all([
          api.get('/hiring-pro/employee/offer-letters', { headers: { Authorization: `Bearer ${response.data.token}` } }),
          api.get('/hiring-pro/employee/timesheets', { headers: { Authorization: `Bearer ${response.data.token}` } }),
          api.get('/hiring-pro/employee/holidays', { headers: { Authorization: `Bearer ${response.data.token}` } }),
          api.get('/hiring-pro/employee/documents', { headers: { Authorization: `Bearer ${response.data.token}` } }),
          api.get('/hiring-pro/employee/salary-breakdown', { headers: { Authorization: `Bearer ${response.data.token}` } }),
          api.get('/hiring-pro/employee/profile', { headers: { Authorization: `Bearer ${response.data.token}` } })
        ]);
        setOfferLetters(offers.data.offerLetters || []);
        setTimesheets(timesheetRes.data.timesheets || []);
        setHolidays(holidayRes.data.holidays || []);
        setDocuments(docRes.data.documents || []);
        setSalaryBreakdown(salaryRes.data.ctcBreakdown || '');
        if (profileRes.data.employee) {
          setEmployeeInfo({ name: profileRes.data.employee.name || '', email: profileRes.data.employee.email || '' });
        }
        if (profileRes.data.profile) {
          setProfile(profileRes.data.profile);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleSubmitTimesheet = async () => {
    try {
      setSuccess('');
      const response = await api.post('/hiring-pro/employee/timesheets', timesheetForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTimesheets(prev => [response.data.timesheet, ...prev]);
      setTimesheetForm({ weekStart: '', weekEnd: '', hoursWorked: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to submit timesheet');
    }
  };

  const handleSubmitHoliday = async () => {
    try {
      setSuccess('');
      const response = await api.post('/hiring-pro/employee/holidays', holidayForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHolidays(prev => [response.data.holiday, ...prev]);
      setHolidayForm({ startDate: '', endDate: '', reason: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to submit holiday');
    }
  };

  const handleProfileSave = async () => {
    try {
      setError('');
      setSuccess('');
      const response = await api.put('/hiring-pro/employee/profile', profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.profile) {
        setProfile(response.data.profile);
        setSuccess('Personal details saved successfully.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update profile');
    }
  };

  const handleDocumentUpload = async () => {
    try {
      setError('');
      setSuccess('');
      if (!documentForm.file) {
        setError('Please choose a document before uploading.');
        return;
      }
      const payload = new FormData();
      payload.append('title', documentForm.title);
      payload.append('type', documentForm.type);
      if (documentForm.file) payload.append('document', documentForm.file);
      const response = await api.post('/hiring-pro/employee/documents', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocuments(prev => [response.data.document, ...prev]);
      setDocumentForm({ title: '', type: '', file: null });
      setSuccess('Document uploaded successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to upload document');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!token) return;
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [offers, timesheetRes, holidayRes, docRes, salaryRes, profileRes] = await Promise.all([
          api.get('/hiring-pro/employee/offer-letters', { headers }),
          api.get('/hiring-pro/employee/timesheets', { headers }),
          api.get('/hiring-pro/employee/holidays', { headers }),
          api.get('/hiring-pro/employee/documents', { headers }),
          api.get('/hiring-pro/employee/salary-breakdown', { headers }),
          api.get('/hiring-pro/employee/profile', { headers })
        ]);
        setOfferLetters(offers.data.offerLetters || []);
        setTimesheets(timesheetRes.data.timesheets || []);
        setHolidays(holidayRes.data.holidays || []);
        setDocuments(docRes.data.documents || []);
        setSalaryBreakdown(salaryRes.data.ctcBreakdown || '');
        if (profileRes.data.employee) {
          setEmployeeInfo({ name: profileRes.data.employee.name || '', email: profileRes.data.employee.email || '' });
        }
        if (profileRes.data.profile) {
          setProfile(profileRes.data.profile);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load employee data');
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('hiringProEmployeeToken');
          setToken(null);
        }
      }
    };
    loadData();
  }, [token]);

  if (!token) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Employee Login</h2>
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2"
            placeholder="Employee email"
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
            className="w-full rounded-lg bg-blue-600 text-white py-2 font-semibold"
          >
            Sign In
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && <div className="text-sm text-red-600">{error}</div>}
      {success && <div className="text-sm text-green-600">{success}</div>}

      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Weekly Timesheets</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            type="date"
            value={timesheetForm.weekStart}
            onChange={(e) => setTimesheetForm(prev => ({ ...prev, weekStart: e.target.value }))}
            className="rounded-lg border border-gray-300 px-4 py-2"
          />
          <input
            type="date"
            value={timesheetForm.weekEnd}
            onChange={(e) => setTimesheetForm(prev => ({ ...prev, weekEnd: e.target.value }))}
            className="rounded-lg border border-gray-300 px-4 py-2"
          />
          <input
            type="number"
            value={timesheetForm.hoursWorked}
            onChange={(e) => setTimesheetForm(prev => ({ ...prev, hoursWorked: e.target.value }))}
            placeholder="Hours worked"
            className="rounded-lg border border-gray-300 px-4 py-2"
          />
        </div>
        <button
          onClick={handleSubmitTimesheet}
          className="rounded-lg bg-blue-600 text-white px-4 py-2 font-semibold"
        >
          Submit Timesheet
        </button>
        <div className="mt-4 space-y-2">
          {timesheets.map(sheet => (
            <div key={sheet._id} className="rounded-lg border border-gray-200 p-3 text-sm">
              {new Date(sheet.weekStart).toLocaleDateString()} - {new Date(sheet.weekEnd).toLocaleDateString()} • {sheet.hoursWorked} hrs • {sheet.status}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Holiday Applications</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            type="date"
            value={holidayForm.startDate}
            onChange={(e) => setHolidayForm(prev => ({ ...prev, startDate: e.target.value }))}
            className="rounded-lg border border-gray-300 px-4 py-2"
          />
          <input
            type="date"
            value={holidayForm.endDate}
            onChange={(e) => setHolidayForm(prev => ({ ...prev, endDate: e.target.value }))}
            className="rounded-lg border border-gray-300 px-4 py-2"
          />
          <input
            type="text"
            value={holidayForm.reason}
            onChange={(e) => setHolidayForm(prev => ({ ...prev, reason: e.target.value }))}
            placeholder="Reason"
            className="rounded-lg border border-gray-300 px-4 py-2"
          />
        </div>
        <button
          onClick={handleSubmitHoliday}
          className="rounded-lg bg-indigo-600 text-white px-4 py-2 font-semibold"
        >
          Submit Holiday Request
        </button>
        <div className="mt-4 space-y-2">
          {holidays.map(holiday => (
            <div key={holiday._id} className="rounded-lg border border-gray-200 p-3 text-sm">
              {new Date(holiday.startDate).toLocaleDateString()} - {new Date(holiday.endDate).toLocaleDateString()} • {holiday.status}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Personal Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            value={employeeInfo.name}
            disabled
            className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-gray-600"
            placeholder="Name"
          />
          <input
            value={employeeInfo.email}
            disabled
            className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-gray-600"
            placeholder="Email"
          />
          {['phone', 'emergencyContact', 'bloodGroup', 'currentAddress', 'highestQualification', 'previousEmployer'].map(field => (
            <input
              key={field}
              value={profile[field]}
              onChange={(e) => setProfile(prev => ({ ...prev, [field]: e.target.value }))}
              placeholder={field.replace(/([A-Z])/g, ' $1')}
              className="rounded-lg border border-gray-300 px-4 py-2"
            />
          ))}
        </div>
        <button
          onClick={handleProfileSave}
          className="rounded-lg bg-gray-900 text-white px-4 py-2 font-semibold"
        >
          Save Details
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Upload Documents</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            value={documentForm.title}
            onChange={(e) => setDocumentForm(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Document title"
            className="rounded-lg border border-gray-300 px-4 py-2"
          />
          <input
            type="text"
            value={documentForm.type}
            onChange={(e) => setDocumentForm(prev => ({ ...prev, type: e.target.value }))}
            placeholder="Type (PAN, Photo, etc.)"
            className="rounded-lg border border-gray-300 px-4 py-2"
          />
          <input
            type="file"
            onChange={(e) => setDocumentForm(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
            className="rounded-lg border border-gray-300 px-4 py-2"
          />
        </div>
        <button
          onClick={handleDocumentUpload}
          className="rounded-lg bg-blue-600 text-white px-4 py-2 font-semibold"
        >
          Upload Document
        </button>
        <div className="mt-4 space-y-2">
          {documents.map(doc => (
            <div key={doc._id} className="rounded-lg border border-gray-200 p-3 text-sm">
              {doc.title} • {doc.type}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Offer Letters</h2>
        <div className="space-y-3">
          {offerLetters.length === 0 && (
            <p className="text-sm text-gray-600">No offer letters available yet.</p>
          )}
          {offerLetters.map(letter => (
            <div key={letter._id} className="rounded-lg border border-gray-200 p-4">
              <p className="font-semibold">{letter.candidateName} — {letter.roleTitle}</p>
              <p className="text-sm text-gray-600">Start Date: {letter.startDate}</p>
              <p className="text-sm text-gray-600">Status: {letter.status}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Salary Breakup</h2>
        <p className="text-sm text-gray-600 whitespace-pre-wrap">{salaryBreakdown || 'No salary breakup available yet.'}</p>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
