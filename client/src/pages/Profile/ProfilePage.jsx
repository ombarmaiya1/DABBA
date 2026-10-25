import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getProfile, updateProfile } from '../../services/auth.service';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Shield, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getHomeRoute } from '../../components/auth/RouteGuards';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    gender: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      if (data?.user) {
        setProfile(data.user);
        setForm({
          fullName: data.user.fullName || '',
          phone: data.user.phone || '',
          gender: data.user.gender || 'Not specified',
        });
      }
    } catch (err) {
      toast.error('Failed to load profile details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.phone.trim()) {
      toast.error('Name and phone number are required');
      return;
    }

    try {
      setSaving(true);
      const res = await updateProfile({
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        gender: form.gender,
      });

      toast.success(res.message || 'Profile updated successfully!');
      if (res.user) {
        setProfile(res.user);
      }
      await refreshUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-24 text-center font-mono text-xs uppercase text-secondary">
        Loading profile ticket...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-background py-10 px-4 sm:px-6 lg:px-12 max-w-[800px] mx-auto">
      <div className="mb-6">
        <Link
          to={getHomeRoute(profile || user)}
          className="inline-flex items-center text-primary font-mono text-xs uppercase tracking-wider hover:opacity-80"
        >
          <ArrowLeft size={16} className="mr-1" /> Back to Home
        </Link>
      </div>

      <div className="mb-8">
        <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
          Account Dossier
        </span>
        <h1 className="font-headline font-black text-3xl sm:text-4xl mt-1 tracking-tight">
          User Profile<span className="text-primary">.</span>
        </h1>
        <p className="font-body text-secondary mt-1 text-sm">
          Manage your personal details, credentials, and DABBA platform permissions.
        </p>
      </div>

      <div className="bg-surface-container-lowest border-2 border-on-background p-6 sm:p-8 ticket-shadow tear-off">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-dashed border-outline-variant gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 border-2 border-on-background bg-surface-container-low flex items-center justify-center font-headline text-2xl font-black text-primary">
              {profile?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="font-headline font-bold text-2xl text-on-background">
                {profile?.fullName}
              </h2>
              <p className="font-mono text-xs text-secondary flex items-center gap-1 mt-0.5">
                <Mail size={12} /> {profile?.email}
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col sm:items-end gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-secondary">
              Platform Role
            </span>
            <span className="font-mono text-xs font-bold uppercase border-2 border-primary bg-primary text-on-primary px-3 py-1">
              {profile?.userType}
            </span>
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleUpdate} className="mt-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-mono text-xs">
            <div>
              <label className="block uppercase text-secondary font-bold mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full bg-surface-container-low border border-on-background p-3 focus:outline-none focus:border-primary font-body text-sm"
                required
              />
            </div>

            <div>
              <label className="block uppercase text-secondary font-bold mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-surface-container-low border border-on-background p-3 focus:outline-none focus:border-primary font-body text-sm"
                required
              />
            </div>

            <div>
              <label className="block uppercase text-secondary font-bold mb-2">
                Email (Fixed)
              </label>
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                className="w-full bg-surface-container-high border border-outline-variant p-3 font-body text-sm opacity-60 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block uppercase text-secondary font-bold mb-2">
                Account ID
              </label>
              <input
                type="text"
                value={profile?._id || ''}
                disabled
                className="w-full bg-surface-container-high border border-outline-variant p-3 font-mono text-xs opacity-60 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-dashed border-outline-variant flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-primary text-on-primary px-6 py-3 font-mono text-xs uppercase tracking-wider font-bold hover:opacity-90 active:scale-95 transition-all"
            >
              {saving ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
