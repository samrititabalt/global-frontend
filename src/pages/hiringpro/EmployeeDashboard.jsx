import React, { useEffect, useRef, useState } from 'react';
import { CalendarDays, ClipboardList, FileText, LayoutDashboard, UploadCloud, UserCircle, Wallet } from 'lucide-react';
import api from '../../utils/axios';
import Layout from '../../components/Layout';

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
    profileImageUrl: '',
    profileImagePublicId: '',
    phone: '',
    emergencyContact: '',
    bloodGroup: '',
    currentAddress: '',
    highestQualification: '',
    previousEmployer: ''
  });
  const [employeeInfo, setEmployeeInfo] = useState({ name: '', email: '' });
  const [profileImagePreview, setProfileImagePreview] = useState('');
  const [profileImageUploading, setProfileImageUploading] = useState(false);
  const [offerLetterFile, setOfferLetterFile] = useState(null);
  const [offerLetterUploading, setOfferLetterUploading] = useState(false);
  const [timesheetForm, setTimesheetForm] = useState({ weekStart: '', weekEnd: '', hoursWorked: '' });
  const [holidayForm, setHolidayForm] = useState({ startDate: '', endDate: '', reason: '' });
  const [documentForm, setDocumentForm] = useState({ title: '', type: '', file: null });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const profileImageInputRef = useRef(null);

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

  const handleProfileImageUpload = async (file) => {
    if (!file) return;
    setError('');
    setSuccess('');
    const previewUrl = URL.createObjectURL(file);
    setProfileImagePreview(previewUrl);
    setProfileImageUploading(true);
    try {
      const payload = new FormData();
      payload.append('avatar', file);
      const response = await api.post('/hiring-pro/employee/profile/image', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.profile) {
        setProfile(response.data.profile);
        setProfileImagePreview('');
        setSuccess('Profile image updated successfully.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to upload profile image');
    } finally {
      setProfileImageUploading(false);
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

  const fetchDocumentBlob = async (documentId, action = 'view') => {
    const response = await api.get(`/hiring-pro/employee/documents/${documentId}/${action}`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    });
    return new Blob([response.data], { type: response.headers?.['content-type'] || 'application/octet-stream' });
  };

  const handleViewDocument = async (documentId) => {
    setError('');
    const previewWindow = window.open('', '_blank', 'noopener,noreferrer');
    if (!previewWindow) {
      setError('Pop-up blocked. Please allow pop-ups to view the document.');
      return;
    }
    try {
      const blob = await fetchDocumentBlob(documentId, 'view');
      const url = window.URL.createObjectURL(blob);
      previewWindow.location = url;
      setTimeout(() => window.URL.revokeObjectURL(url), 2000);
    } catch (err) {
      previewWindow.close();
      setError(err.response?.data?.message || 'Unable to open document');
    }
  };

  const handleDownloadDocument = async (documentId, title) => {
    setError('');
    try {
      const blob = await fetchDocumentBlob(documentId, 'download');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${(title || 'document').replace(/\s+/g, '-')}`;
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
      await api.delete(`/hiring-pro/employee/documents/${documentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocuments(prev => prev.filter(doc => doc._id !== documentId));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete document');
    }
  };

  const fetchOfferLetterBlob = async (offerId, action = 'view') => {
    const response = await api.get(`/hiring-pro/employee/offer-letters/${offerId}/${action}`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    });
    return new Blob([response.data], { type: 'application/pdf' });
  };

  const handleViewOfferLetter = async (offerId) => {
    setError('');
    const previewWindow = window.open('', '_blank', 'noopener,noreferrer');
    if (!previewWindow) {
      setError('Pop-up blocked. Please allow pop-ups to view the offer letter.');
      return;
    }
    try {
      const blob = await fetchOfferLetterBlob(offerId, 'view');
      const url = window.URL.createObjectURL(blob);
      previewWindow.location = url;
      setTimeout(() => window.URL.revokeObjectURL(url), 2000);
    } catch (err) {
      previewWindow.close();
      setError(err.response?.data?.message || 'Unable to open offer letter');
    }
  };

  const handleDownloadOfferLetter = async (offerId, candidateName) => {
    setError('');
    try {
      const blob = await fetchOfferLetterBlob(offerId, 'download');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `offer-letter-${(candidateName || 'document').replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to download offer letter');
    }
  };

  const handleOfferLetterUpload = async () => {
    if (!offerLetterFile) {
      setError('Please choose a PDF offer letter to upload.');
      return;
    }
    setError('');
    setSuccess('');
    setOfferLetterUploading(true);
    try {
      const payload = new FormData();
      payload.append('offerLetter', offerLetterFile);
      const response = await api.post('/hiring-pro/employee/offer-letters/upload', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.offerLetter) {
        setOfferLetters(prev => [response.data.offerLetter, ...prev]);
        setOfferLetterFile(null);
        setSuccess('Offer letter uploaded successfully.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to upload offer letter');
    } finally {
      setOfferLetterUploading(false);
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

  useEffect(() => {
    return () => {
      if (profileImagePreview) {
        URL.revokeObjectURL(profileImagePreview);
      }
    };
  }, [profileImagePreview]);

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

  const resolvedProfileImage = profileImagePreview || profile.profileImageUrl;

  return (
    <Layout>
      <div className="bg-slate-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl p-8">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-50" />
            <div className="absolute -left-12 bottom-0 h-32 w-32 rounded-full bg-blue-50" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <LayoutDashboard className="h-8 w-8 text-indigo-600" />
                <h1 className="text-3xl font-bold text-gray-900">Employee Dashboard</h1>
              </div>
              <p className="text-gray-600 max-w-2xl">
                Access your personal profile, salary breakup, timesheets, and holiday requests in one secure place.
                Keep your records updated and track approvals in real time.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3">
                  <p className="text-xs text-indigo-600 font-semibold uppercase">Signed in as</p>
                  <p className="text-sm font-semibold text-gray-900">{employeeInfo.name || 'Employee'}</p>
                  <p className="text-xs text-gray-500">{employeeInfo.email}</p>
                </div>
              </div>
            </div>
          </div>

          {(error || success) && (
            <div className="flex flex-col gap-2">
              {error && <div className="text-sm text-red-600">{error}</div>}
              {success && <div className="text-sm text-green-600">{success}</div>}
            </div>
          )}

          <section className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <UserCircle className="h-6 w-6 text-indigo-600" />
              <h2 className="text-2xl font-semibold text-gray-900">Personal Details</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
              <div className="lg:col-span-1">
                <div className="h-48 w-full rounded-2xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden">
                  {resolvedProfileImage ? (
                    <img src={resolvedProfileImage} alt="Employee profile" className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-center text-sm text-gray-500 px-4">
                      No profile image uploaded yet.
                    </div>
                  )}
                </div>
                <input
                  ref={profileImageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleProfileImageUpload(e.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => profileImageInputRef.current?.click()}
                  disabled={profileImageUploading}
                  className={`mt-4 inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold ${profileImageUploading ? 'border-gray-200 text-gray-400' : 'border-gray-300 text-gray-700 hover:border-gray-400'}`}
                >
                  <UploadCloud className="h-4 w-4" />
                  {profileImageUploading ? 'Uploading...' : 'Add Image'}
                </button>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-4">
              <Wallet className="h-6 w-6 text-indigo-600" />
              <h2 className="text-2xl font-semibold text-gray-900">Salary Breakup</h2>
            </div>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{salaryBreakdown || 'No salary breakup available yet.'}</p>
          </section>

          <section className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-4">
              <ClipboardList className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-900">Weekly Timesheets</h2>
            </div>
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
          </section>

          <section className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-4">
              <CalendarDays className="h-6 w-6 text-indigo-600" />
              <h2 className="text-2xl font-semibold text-gray-900">Holiday Applications</h2>
            </div>
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
          </section>

          <section className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-4">
              <UploadCloud className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-900">Upload Documents</h2>
            </div>
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
                <div key={doc._id} className="rounded-lg border border-gray-200 p-3 text-sm flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{doc.title}</p>
                    <p className="text-xs text-gray-500">{doc.type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleViewDocument(doc._id)}
                      className="rounded-md border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 hover:border-gray-400"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadDocument(doc._id, doc.title)}
                      className="rounded-md border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 hover:border-gray-400"
                    >
                      Download
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDocument(doc._id)}
                      className="rounded-md border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:border-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-6 w-6 text-indigo-600" />
              <h2 className="text-2xl font-semibold text-gray-900">Offer Letters</h2>
            </div>
            <div className="space-y-3">
              {offerLetters.length === 0 && (
                <p className="text-sm text-gray-600">No offer letters available yet.</p>
              )}
              {offerLetters.map(letter => (
                <div key={letter._id} className="rounded-lg border border-gray-200 p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{letter.candidateName} — {letter.roleTitle}</p>
                    <p className="text-sm text-gray-600">Start Date: {letter.startDate}</p>
                    <p className="text-sm text-gray-600">Status: {letter.status}</p>
                  </div>
                  {letter.fileUrl && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleViewOfferLetter(letter._id)}
                        className="rounded-md border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 hover:border-gray-400"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadOfferLetter(letter._id, letter.candidateName)}
                        className="rounded-md border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 hover:border-gray-400"
                      >
                        Download
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 border-t border-gray-200 pt-4">
              <p className="text-sm font-semibold text-gray-900 mb-2">Upload your offer letter</p>
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setOfferLetterFile(e.target.files?.[0] || null)}
                  className="rounded-lg border border-gray-300 px-4 py-2"
                />
                <button
                  type="button"
                  onClick={handleOfferLetterUpload}
                  disabled={offerLetterUploading}
                  className={`rounded-lg px-4 py-2 font-semibold ${offerLetterUploading ? 'bg-gray-300 text-gray-600' : 'bg-indigo-600 text-white'}`}
                >
                  {offerLetterUploading ? 'Uploading...' : 'Upload Offer Letter'}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">PDF only. This file will be visible to your company admin.</p>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default EmployeeDashboard;
