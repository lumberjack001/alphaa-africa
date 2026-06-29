"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Toast from '@/components/Toast';
import {
  apiFetch,
  getStoredUser,
  setStoredUser,
  clearTokens,
  clearStoredUser,
  ApiError,
  type User
} from '@/lib/api';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Edit fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 5000);
  };

  // Fetch fresh profile from API on mount
  useEffect(() => {
    const fetchProfile = async () => {
      // If not logged in, redirect
      const stored = getStoredUser();
      if (!stored) {
        window.location.href = '/login';
        return;
      }

      setIsLoading(true);
      try {
        const data = await apiFetch<User>('/api/auth/me/');
        setUser(data);
        setStoredUser(data);
        setFirstName(data.first_name);
        setLastName(data.last_name);
        setPhone(data.phone_number || '');
      } catch (error) {
        // If 401, tokens invalid — redirect to login
        if (error instanceof ApiError && error.status === 401) {
          clearTokens();
          clearStoredUser();
          window.location.href = '/login';
        } else {
          // Use cached data as fallback
          setUser(stored);
          setFirstName(stored.first_name);
          setLastName(stored.last_name);
          setPhone(stored.phone_number || '');
          triggerToast("Using cached profile. Could not connect to server.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await apiFetch<User>('/api/auth/me/', {
        method: 'PATCH',
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          phone_number: phone,
        }),
      });
      setUser(updated);
      setStoredUser(updated);
      triggerToast("Profile updated successfully!");
    } catch (error) {
      if (error instanceof ApiError) {
        const details = error.data
          ? Object.entries(error.data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ')
          : error.message;
        triggerToast(`Update failed: ${details}`);
      } else {
        triggerToast("Network error. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return;
    setIsChangingPassword(true);
    try {
      await apiFetch('/api/auth/change-password/', {
        method: 'POST',
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
      });
      triggerToast("Password changed successfully!");
      setOldPassword('');
      setNewPassword('');
      setShowPasswordForm(false);
    } catch (error) {
      if (error instanceof ApiError) {
        const details = error.data?.old_password?.[0] || error.data?.detail || error.message;
        triggerToast(`Password change failed: ${details}`);
      } else {
        triggerToast("Network error. Please try again.");
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSignOut = () => {
    clearTokens();
    clearStoredUser();
    window.location.href = '/';
  };

  const userInitials = user
    ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase()
    : '??';

  return (
    <div className="bg-[#FAF8F5] text-slate-800 antialiased min-h-screen flex flex-col justify-between selection:bg-[#FA6432] selection:text-white">
      <Navbar
        onSwitchTab={() => {}}
        onReset={() => (window.location.href = '/')}
        activeTab=""
      />

      <main className="flex-grow">

        {/* Purple Banner Header */}
        <div className="bg-gradient-to-br from-[#4C1D5C] to-[#2E1238] text-white pt-16 pb-28 px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-black font-sans uppercase tracking-tight">
            My Profile
          </h1>
          <p className="text-sm text-purple-100 mt-2 font-semibold">
            Manage your account details and booking preferences
          </p>
        </div>

        {/* Profile Content Container */}
        <div className="max-w-2xl w-full mx-auto px-4 -mt-16 mb-20 relative z-10 space-y-6">

          {isLoading ? (
            // Loading skeleton
            <div className="bg-white rounded-3xl p-8 shadow-2xl border border-purple-50">
              <div className="flex items-center gap-5 mb-8">
                <div className="w-20 h-20 rounded-full bg-slate-100 animate-pulse"></div>
                <div className="space-y-2">
                  <div className="w-36 h-5 bg-slate-100 rounded animate-pulse"></div>
                  <div className="w-48 h-3 bg-slate-50 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-full h-12 bg-slate-50 rounded-xl animate-pulse"></div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Account Header Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-purple-50">
                <div className="flex items-center gap-5 pb-6 mb-6 border-b border-purple-50">
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-full bg-brand-purple flex items-center justify-center text-white text-xl font-black flex-shrink-0 ring-4 ring-brand-orange/20">
                    {userInitials}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-brand-purple">
                      {user?.first_name} {user?.last_name}
                    </h2>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">{user?.email}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {user?.is_verified ? (
                        <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                          ✓ Verified Account
                        </span>
                      ) : (
                        <span className="bg-amber-50 text-amber-600 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                          ⚠ Unverified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Edit Profile Form */}
                <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                  <h3 className="text-sm font-extrabold text-brand-purple uppercase tracking-wider font-sans">
                    Personal Information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-500 font-bold mb-1.5">First Name</label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        className="w-full bg-purple-50/20 border border-slate-200 rounded-xl p-3 text-brand-purple font-semibold focus:outline-none focus:border-brand-orange transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-1.5">Last Name</label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        className="w-full bg-purple-50/20 border border-slate-200 rounded-xl p-3 text-brand-purple font-semibold focus:outline-none focus:border-brand-orange transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-slate-400 font-semibold cursor-not-allowed"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Email address cannot be changed</span>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+2348000000000"
                      className="w-full bg-purple-50/20 border border-slate-200 rounded-xl p-3 text-brand-purple font-semibold focus:outline-none focus:border-brand-orange transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full bg-brand-orange hover:bg-brand-purple text-white font-black py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#FA6432]/10 cursor-pointer border-none flex items-center justify-center disabled:opacity-50"
                  >
                    {isSaving ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </form>
              </div>

              {/* Security Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-purple-50">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-sm font-extrabold text-brand-purple uppercase tracking-wider font-sans">Security</h3>
                    <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Update your account password</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPasswordForm(prev => !prev)}
                    className="text-xs font-bold text-brand-orange hover:underline cursor-pointer"
                  >
                    {showPasswordForm ? "Cancel" : "Change Password"}
                  </button>
                </div>

                {showPasswordForm && (
                  <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-slate-500 font-bold mb-1.5">Current Password</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••••••"
                        value={oldPassword}
                        onChange={e => setOldPassword(e.target.value)}
                        className="w-full bg-purple-50/20 border border-slate-200 rounded-xl p-3 text-brand-purple font-semibold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-1.5">New Password</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••••••"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="w-full bg-purple-50/20 border border-slate-200 rounded-xl p-3 text-brand-purple font-semibold focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="w-full bg-brand-purple hover:bg-brand-orange text-white font-black py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer border-none flex items-center justify-center disabled:opacity-50"
                    >
                      {isChangingPassword ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        "Update Password"
                      )}
                    </button>
                  </form>
                )}
              </div>

              {/* Danger Zone */}
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-red-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-red-500 uppercase tracking-wider font-sans">Sign Out</h3>
                    <p className="text-[11px] text-slate-400 font-semibold mt-0.5">End your current session on this device</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="text-xs font-black text-red-400 hover:text-red-600 border border-red-100 hover:border-red-300 hover:bg-red-50 px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              </div>

              {/* Back link */}
              <div className="text-center">
                <Link href="/" className="text-xs font-bold text-slate-400 hover:text-brand-orange underline transition-colors">
                  ← Back to Travel Hub
                </Link>
              </div>
            </>
          )}

        </div>
      </main>

      <Footer onSwitchTab={() => {}} triggerToast={triggerToast} />
      <Toast message={toastMessage} visible={toastVisible} />
    </div>
  );
}
