import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

const StatChip = ({ label, value }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
    <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
    <p className="mt-2 text-lg font-semibold text-gray-900 break-all">{value ?? '—'}</p>
  </div>
);

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [formState, setFormState] = useState({
    name: '',
    phone: '',
    country: '',
    serviceCategory: '',
    isAvailable: true,
  });
  const [services, setServices] = useState([]);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const role = user?.role || 'customer';

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data } = await authAPI.getCurrentUser();
      const current = data.user;
      setProfile(current);
      setFormState({
        name: current.name || '',
        phone: current.phone || '',
        country: current.country || '',
        serviceCategory: current.serviceCategory?._id || current.serviceCategory || '',
        isAvailable: typeof current.isAvailable === 'boolean' ? current.isAvailable : true,
      });
      setAvatarPreview(current.avatar || '');
    } catch (error) {
      console.error('Failed to load profile:', error);
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Failed to load profile data',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      const { data } = await authAPI.getServices();
      setServices(data.services || []);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (role === 'agent') {
      loadServices();
    }
  }, [role]);

  useEffect(() => {
    return () => {
      if (avatarFile && avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarFile, avatarPreview]);

  const summaryChips = useMemo(() => {
    if (!profile) return [];

    const chips = [
      { label: 'Email', value: profile.email },
      { label: 'Role', value: profile.role },
      { label: 'Country', value: profile.country },
    ];

    if (profile.role === 'customer') {
      chips.push(
        { label: 'Service Minutes', value: `${profile.tokenBalance ?? 0} min` },
        { label: 'Plan Status', value: profile.planStatus || 'None' },
        { label: 'Current Plan', value: profile.currentPlan?.name || 'Not subscribed' }
      );
    }

    if (profile.role === 'agent') {
      chips.push(
        { label: 'Service Category', value: profile.serviceCategory?.name || 'Unassigned' },
        { label: 'Availability', value: profile.isAvailable ? 'Available' : 'Not available' }
      );
    }

    if (profile.role === 'admin') {
      chips.push({ label: 'Account Status', value: profile.isActive ? 'Active' : 'Suspended' });
    }

    return chips;
  }, [profile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvailabilityToggle = () => {
    setFormState((prev) => ({ ...prev, isAvailable: !prev.isAvailable }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (avatarPreview && avatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus({ type: '', message: '' });

    try {
      const payload = new FormData();
      payload.append('name', formState.name);
      payload.append('phone', formState.phone);
      payload.append('country', formState.country);

      if (role === 'agent') {
        if (formState.serviceCategory) {
          payload.append('serviceCategory', formState.serviceCategory);
        }
        payload.append('isAvailable', formState.isAvailable);
      }

      if (avatarFile) {
        payload.append('avatar', avatarFile);
      }

      await authAPI.updateProfile(payload);
      await refreshUser();
      await loadProfile();
      setAvatarFile(null);
      setStatus({ type: 'success', message: 'Profile updated successfully.' });
    } catch (error) {
      console.error('Failed to update profile:', error);
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Failed to update profile',
      });
    } finally {
      setSaving(false);
    }
  };

  const avatarFallback = useMemo(() => {
    if (avatarPreview) return avatarPreview;
    if (profile?.avatar) return profile.avatar;
    if (profile?.name) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=0D8ABC&color=fff`;
    }
    return 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff';
  }, [avatarPreview, profile]);

  if (loading) {
    return (
      <Layout title="Profile">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Profile">
      <div className="space-y-8">
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-center">
          <div className="flex flex-col items-center gap-4">
            <img
              src={avatarFallback}
              alt={profile?.name || 'User avatar'}
              className="w-28 h-28 rounded-3xl object-cover border border-gray-100 shadow-md"
            />
            <label className="cursor-pointer text-sm font-medium text-primary-600 hover:text-primary-700">
              Change photo
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
            <h2 className="text-3xl font-semibold text-gray-900">{profile?.name}</h2>
            <p className="text-gray-600">{profile?.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800 uppercase tracking-wide">
                {profile?.role}
              </span>
              {role === 'customer' && (
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800">
                  {profile?.tokenBalance ?? 0} min
                </span>
              )}
              {role === 'agent' && (
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    profile?.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                  }`}
                >
                  {profile?.isAvailable ? 'Available' : 'Not available'}
                </span>
              )}
            </div>
          </div>
        </div>

        {status.message && (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
              status.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
          >
            {status.message}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {summaryChips.map((chip) => (
            <StatChip key={chip.label} label={chip.label} value={chip.value} />
          ))}
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Edit profile</h3>
            <p className="text-sm text-gray-500 mt-1">Update your personal details and preferences.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full name</label>
              <input
                type="text"
                name="name"
                value={formState.name}
                onChange={handleInputChange}
                className="w-full rounded-2xl border-gray-200 focus:border-primary-500 focus:ring-primary-500"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone number</label>
              <input
                type="tel"
                name="phone"
                value={formState.phone}
                onChange={handleInputChange}
                className="w-full rounded-2xl border-gray-200 focus:border-primary-500 focus:ring-primary-500"
                placeholder="Enter phone number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <input
                type="text"
                name="country"
                value={formState.country}
                onChange={handleInputChange}
                className="w-full rounded-2xl border-gray-200 focus:border-primary-500 focus:ring-primary-500"
                placeholder="Country of residence"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email (read-only)</label>
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                className="w-full rounded-2xl border-gray-200 bg-gray-50 text-gray-500"
              />
            </div>
          </div>

          {role === 'agent' && (
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service category</label>
                <select
                  name="serviceCategory"
                  value={formState.serviceCategory || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border-gray-200 focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="">Select service</option>
                  {services.map((service) => (
                    <option key={service._id} value={service._id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Availability</label>
                <button
                  type="button"
                  onClick={handleAvailabilityToggle}
                  className={`w-full rounded-2xl border px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                    formState.isAvailable
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-orange-200 bg-orange-50 text-orange-700'
                  }`}
                >
                  <span
                    className={`inline-flex h-2.5 w-2.5 rounded-full ${
                      formState.isAvailable ? 'bg-emerald-500' : 'bg-orange-500'
                    }`}
                  />
                  {formState.isAvailable ? 'Available for new chats' : 'Not available'}
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-2xl bg-primary-600 text-white font-semibold shadow-sm hover:bg-primary-700 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default Profile;
