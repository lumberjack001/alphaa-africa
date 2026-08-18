"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { getOrderHistory, type OrderItem } from '@/services/orderService';

export interface PaymentRecord {
  id: string;
  reference: string;
  serviceName: string;
  serviceType: 'hotel' | 'flight' | 'car' | 'visa' | 'package';
  amount: number;
  currency: string;
  date: string;
  status: 'successful' | 'pending' | 'failed';
  callbackUrl: string;
}

const MOCK_PAYMENT_HISTORY: PaymentRecord[] = [
  {
    id: 'pay-101',
    reference: 'HTL-REF-984210',
    serviceName: 'Transcorp Hilton Abuja - Executive Suite',
    serviceType: 'hotel',
    amount: 310000,
    currency: 'NGN',
    date: 'Jul 28, 2026',
    status: 'successful',
    callbackUrl: '/hotels/callback?reference=HTL-REF-984210',
  },
  {
    id: 'pay-102',
    reference: 'FLT-REF-662301',
    serviceName: 'Air Peace Flight (LOS → ABV)',
    serviceType: 'flight',
    amount: 120000,
    currency: 'NGN',
    date: 'Jul 25, 2026',
    status: 'successful',
    callbackUrl: '/hotels/callback?reference=FLT-REF-662301',
  },
  {
    id: 'pay-103',
    reference: 'VSA-REF-441092',
    serviceName: 'Schengen Business Visa Consultation',
    serviceType: 'visa',
    amount: 150000,
    currency: 'NGN',
    date: 'Jul 20, 2026',
    status: 'pending',
    callbackUrl: '/hotels/callback?reference=VSA-REF-441092',
  },
  {
    id: 'pay-104',
    reference: 'CAR-REF-119283',
    serviceName: 'Toyota Land Cruiser Prado (Chauffeur Hire)',
    serviceType: 'car',
    amount: 85000,
    currency: 'NGN',
    date: 'Jul 15, 2026',
    status: 'failed',
    callbackUrl: '/hotels/callback?reference=CAR-REF-119283',
  },
  {
    id: 'pay-105',
    reference: 'PKG-REF-773019',
    serviceName: 'Zanzibar Beach & Safari Holiday Package',
    serviceType: 'package',
    amount: 850000,
    currency: 'NGN',
    date: 'Jul 02, 2026',
    status: 'successful',
    callbackUrl: '/hotels/callback?reference=PKG-REF-773019',
  },
];

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Side Panel Navigation State
  const [activeSideTab, setActiveSideTab] = useState<'account' | 'payment'>('account');

  // Payment/Order Status Filter State
  const [statusFilter, setStatusFilter] = useState<'all' | 'successful' | 'pending' | 'failed'>('all');

  // Live Orders State & Pagination
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

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

  const handleFilterChange = (filter: 'all' | 'successful' | 'pending' | 'failed') => {
    setStatusFilter(filter);
    setCurrentPage(1);
  };

  const fetchOrders = async () => {
    setIsOrdersLoading(true);
    setOrdersError(null);
    try {
      const res = await getOrderHistory();
      setOrders(res.orders || []);
    } catch (err: any) {
      console.error("Error fetching order history:", err);
      setOrdersError(err?.message || "Failed to load order history.");
    } finally {
      setIsOrdersLoading(false);
    }
  };

  // Fetch fresh profile from API on mount
  useEffect(() => {
    const fetchProfile = async () => {
      const stored = getStoredUser();
      if (!stored) {
        router.push('/login');
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
        
        // Also fetch live order history
        fetchOrders();
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          clearTokens();
          clearStoredUser();
          router.push('/login');
        } else {
          setUser(stored);
          setFirstName(stored.first_name);
          setLastName(stored.last_name);
          setPhone(stored.phone_number || '');
          triggerToast("Using cached profile. Could not connect to server.");
          fetchOrders();
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

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
    router.push('/');
  };

  const handleOrderClick = (order: OrderItem) => {
    router.push(`/order?reference=${encodeURIComponent(order.reference)}`);
  };

  const userInitials = user
    ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase()
    : '??';

  const filteredOrders = orders.filter(o => {
    if (statusFilter === 'all') return true;
    const status = (o.payment_status || '').toLowerCase();
    if (statusFilter === 'successful') return status === 'success' || status === 'successful';
    return status === statusFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getServiceIcon = (type: string) => {
    const lowerType = (type || '').toLowerCase();
    switch (lowerType) {
      case 'hotel': return '🏨';
      case 'flight': return '✈️';
      case 'car': return '🚗';
      case 'visa': return '📄';
      case 'package': return '🏝️';
      default: return '💳';
    }
  };

  return (
    <div className="bg-[#FAF8F5] text-slate-800 antialiased min-h-screen flex flex-col justify-between selection:bg-[#FA6432] selection:text-white">
      <Navbar
        onSwitchTab={(tabId) => router.push(`/?tab=${tabId}`)}
        onReset={() => router.push('/')}
        activeTab=""
      />

      <main className="flex-grow navbar-offset">

        {/* Purple Banner Header */}
        <div className="bg-gradient-to-br from-[#4C1D5C] to-[#2E1238] text-white pt-16 pb-28 px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-black font-sans uppercase tracking-tight">
            My Account
          </h1>
          <p className="text-sm text-purple-100 mt-2 font-semibold">
            Manage your personal details, security settings, and payment history
          </p>
        </div>

        {/* Side Panel + Main View Layout */}
        <div className="max-w-6xl w-full mx-auto px-4 -mt-16 mb-20 relative z-10">

          {isLoading ? (
            /* Loading Skeleton matching the 2-column Side Panel layout */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Side Panel Skeleton */}
              <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-xl border border-purple-50 space-y-6">
                <div className="flex items-center gap-4 pb-6 border-b border-purple-50">
                  <div className="w-14 h-14 rounded-full bg-slate-100 animate-pulse flex-shrink-0"></div>
                  <div className="space-y-2 flex-grow">
                    <div className="w-28 h-4 bg-slate-100 rounded animate-pulse"></div>
                    <div className="w-36 h-3 bg-slate-50 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="w-full h-14 bg-slate-100 rounded-2xl animate-pulse"></div>
                  <div className="w-full h-14 bg-slate-50 rounded-2xl animate-pulse"></div>
                </div>
              </div>

              {/* Right Main Content Skeleton */}
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-purple-50 space-y-6">
                  <div className="space-y-2 pb-4 border-b border-purple-50">
                    <div className="w-40 h-5 bg-slate-100 rounded animate-pulse"></div>
                    <div className="w-64 h-3 bg-slate-50 rounded animate-pulse"></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="w-full h-12 bg-slate-50 rounded-xl animate-pulse"></div>
                    <div className="w-full h-12 bg-slate-50 rounded-xl animate-pulse"></div>
                  </div>
                  <div className="w-full h-12 bg-slate-50 rounded-xl animate-pulse"></div>
                  <div className="w-full h-12 bg-slate-50 rounded-xl animate-pulse"></div>
                  <div className="w-full h-12 bg-slate-100 rounded-xl animate-pulse"></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              {/* LEFT SIDE PANEL NAVIGATION */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white rounded-3xl p-6 shadow-xl border border-purple-50">
                  
                  {/* User Brief Card */}
                  <div className="flex items-center gap-4 pb-6 mb-6 border-b border-purple-50">
                    <div className="w-14 h-14 rounded-full bg-brand-purple flex items-center justify-center text-white text-lg font-black flex-shrink-0 ring-4 ring-brand-orange/20">
                      {userInitials}
                    </div>
                    <div className="overflow-hidden">
                      <h2 className="text-base font-black text-brand-purple truncate">
                        {user?.first_name} {user?.last_name}
                      </h2>
                      <p className="text-xs text-slate-400 font-semibold truncate mt-0.5">{user?.email}</p>
                      <div className="mt-1">
                        {user?.is_verified ? (
                          <span className="inline-block bg-emerald-50 text-emerald-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                            ✓ Verified
                          </span>
                        ) : (
                          <span className="inline-block bg-amber-50 text-amber-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                            ⚠ Unverified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="space-y-2">
                    {/* Account Tab */}
                    <button
                      type="button"
                      onClick={() => setActiveSideTab('account')}
                      className={`w-full text-left p-3.5 rounded-2xl flex items-center justify-between transition-all cursor-pointer border-none font-sans ${
                        activeSideTab === 'account'
                          ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/20'
                          : 'bg-slate-50/80 hover:bg-purple-50/50 text-slate-700 font-bold'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm ${
                          activeSideTab === 'account' ? 'bg-white/20 text-white' : 'bg-purple-100/70 text-brand-purple'
                        }`}>
                          👤
                        </div>
                        <div>
                          <span className="text-xs font-black uppercase tracking-wider block">Account</span>
                          <span className={`text-[10px] block font-semibold ${
                            activeSideTab === 'account' ? 'text-purple-200' : 'text-slate-400'
                          }`}>Personal & Security</span>
                        </div>
                      </div>
                      <span className="text-xs">→</span>
                    </button>

                    {/* My Orders Tab */}
                    <button
                      type="button"
                      onClick={() => setActiveSideTab('payment')}
                      className={`w-full text-left p-3.5 rounded-2xl flex items-center justify-between transition-all cursor-pointer border-none font-sans ${
                        activeSideTab === 'payment'
                          ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/20'
                          : 'bg-slate-50/80 hover:bg-purple-50/50 text-slate-700 font-bold'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm ${
                          activeSideTab === 'payment' ? 'bg-white/20 text-white' : 'bg-purple-100/70 text-brand-purple'
                        }`}>
                          🛍️
                        </div>
                        <div>
                          <span className="text-xs font-black uppercase tracking-wider block">My Orders</span>
                          <span className={`text-[10px] block font-semibold ${
                            activeSideTab === 'payment' ? 'text-purple-200' : 'text-slate-400'
                          }`}>History & Status</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        activeSideTab === 'payment' ? 'bg-brand-orange text-white' : 'bg-purple-100 text-brand-purple'
                      }`}>
                        {orders.length}
                      </span>
                    </button>
                  </div>

                </div>

                {/* Return to Home Link */}
                <div className="text-center pt-2">
                  <Link href="/" className="text-xs font-bold text-slate-400 hover:text-brand-orange underline transition-colors">
                    ← Back to Travel Hub
                  </Link>
                </div>
              </div>

              {/* RIGHT MAIN CONTENT AREA */}
              <div className="lg:col-span-8">

                {/* ================= TAB 1: ACCOUNT DETAILS ================= */}
                {activeSideTab === 'account' && (
                  <div className="space-y-6 animate-fadeIn">
                    
                    {/* Personal Info Card */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-purple-50">
                      <div className="mb-6">
                        <h3 className="text-base font-black text-brand-purple uppercase tracking-tight font-sans">
                          Personal Details
                        </h3>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">
                          Update your official account information
                        </p>
                      </div>

                      <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
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
                            "Save Account Changes"
                          )}
                        </button>
                      </form>
                    </div>

                    {/* Security Card */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-purple-50">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-base font-black text-brand-purple uppercase tracking-tight font-sans">
                            Security & Password
                          </h3>
                          <p className="text-xs text-slate-400 font-semibold mt-0.5">Manage your credentials</p>
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
                        <form onSubmit={handleChangePassword} className="space-y-4 text-xs animate-fadeIn">
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

                  </div>
                )}

                {/* ================= TAB 2: MY ORDERS ================= */}
                {activeSideTab === 'payment' && (
                  <div className="space-y-6 animate-fadeIn">
                    
                    {/* Orders Header Card */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-purple-50">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-purple-50">
                        <div>
                          <h3 className="text-base font-black text-brand-purple uppercase tracking-tight font-sans">
                            My Orders
                          </h3>
                          <p className="text-xs text-slate-400 font-semibold mt-0.5">
                            Track all your booking transactions, receipts, and order statuses
                          </p>
                        </div>
                        <div className="bg-purple-50/80 px-4 py-2 rounded-2xl text-right">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Orders</span>
                          <span className="text-sm font-black text-brand-purple">{orders.length} Orders</span>
                        </div>
                      </div>

                      {/* Status Filters */}
                      <div className="flex flex-wrap items-center gap-2 pt-6">
                        <span className="text-xs font-bold text-slate-400 mr-2 uppercase tracking-wider">Filter:</span>
                        
                        {(['all', 'successful', 'pending', 'failed'] as const).map(filter => {
                          const count = filter === 'all'
                            ? orders.length
                            : orders.filter(o => {
                                const st = (o.payment_status || '').toLowerCase();
                                if (filter === 'successful') return st === 'success' || st === 'successful';
                                return st === filter;
                              }).length;

                          const isActive = statusFilter === filter;

                          return (
                            <button
                              key={filter}
                              type="button"
                              onClick={() => handleFilterChange(filter)}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-none flex items-center space-x-1.5 ${
                                isActive
                                  ? 'bg-brand-purple text-white shadow-md'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                              }`}
                            >
                              <span>{filter.charAt(0).toUpperCase() + filter.slice(1)}</span>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                                isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                              }`}>
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Orders List */}
                    <div className="space-y-4">
                      {isOrdersLoading ? (
                        <div className="bg-white rounded-3xl p-8 text-center border border-purple-50 shadow-sm space-y-3">
                          <div className="w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto"></div>
                          <p className="text-xs text-slate-400 font-semibold">Loading orders...</p>
                        </div>
                      ) : ordersError ? (
                        <div className="bg-red-50/70 border border-red-200 rounded-3xl p-6 text-center text-red-600 text-xs font-bold">
                          {ordersError}
                        </div>
                      ) : filteredOrders.length === 0 ? (
                        <div className="bg-white rounded-3xl p-12 text-center border border-purple-50 shadow-sm">
                          <div className="text-4xl mb-3">🛍️</div>
                          <h4 className="text-sm font-black text-brand-purple uppercase">No Orders Found</h4>
                          <p className="text-xs text-slate-400 font-semibold mt-1">
                            {orders.length === 0 ? "You haven't placed any orders yet." : "No orders match the selected filter."}
                          </p>
                        </div>
                      ) : (
                        paginatedOrders.map(order => {
                          const status = (order.payment_status || '').toLowerCase();
                          const isSuccessful = status === 'success' || status === 'successful';
                          const isPending = status === 'pending';
                          const isFailed = status === 'failed';

                          const formattedAmount = order.amount
                            ? `${order.currency || 'NGN'} ${Number(order.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : '';

                          const formattedDate = order.paid_at
                            ? new Date(order.paid_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                            : order.created_at
                            ? new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                            : '';

                          return (
                            <div
                              key={order.reference}
                              onClick={() => handleOrderClick(order)}
                              className="bg-white rounded-3xl p-5 sm:p-6 border border-purple-50 hover:border-brand-orange/40 hover:shadow-xl cursor-pointer transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                              {/* Left Info */}
                              <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-xl flex-shrink-0">
                                  {getServiceIcon(order.booking_type)}
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <h4 className="text-sm font-black text-brand-purple">
                                      {order.title || `Booking Reference: ${order.reference}`}
                                    </h4>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 font-semibold">
                                    <span className="font-mono text-purple-900/70">{order.reference}</span>
                                    {formattedDate && (
                                      <>
                                        <span>•</span>
                                        <span>{formattedDate}</span>
                                      </>
                                    )}
                                    {order.booking_type && (
                                      <>
                                        <span>•</span>
                                        <span className="capitalize text-slate-500">{order.booking_type}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Right Amount & Status Badge */}
                              <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                                <span className="text-base font-black text-slate-900">
                                  {formattedAmount}
                                </span>

                                <div className="mt-1">
                                  {isSuccessful && (
                                    <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-600 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                                      <span>✓ Successful</span>
                                      <span className="text-xs">→</span>
                                    </span>
                                  )}

                                  {isPending && (
                                    <span className="inline-flex items-center space-x-1 bg-amber-50 text-amber-600 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                                      <span>⏳ Pending</span>
                                      <span className="text-xs">→</span>
                                    </span>
                                  )}

                                  {isFailed && (
                                    <span className="inline-flex items-center space-x-1 bg-red-50 text-red-500 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                                      <span>✕ Failed</span>
                                      <span className="text-xs">→</span>
                                    </span>
                                  )}

                                  {!isSuccessful && !isPending && !isFailed && (
                                    <span className="inline-flex items-center space-x-1 bg-slate-100 text-slate-600 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                                      <span>{order.payment_status}</span>
                                      <span className="text-xs">→</span>
                                    </span>
                                  )}
                                </div>
                              </div>

                            </div>
                          );
                        })
                      )}

                      {/* Pagination Bar */}
                      {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-purple-50">
                          <span className="text-xs text-slate-400 font-semibold">
                            Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredOrders.length)} of {filteredOrders.length} orders
                          </span>
                          <div className="flex items-center space-x-1">
                            <button
                              type="button"
                              disabled={currentPage === 1}
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border-none cursor-pointer"
                            >
                              ← Prev
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                              <button
                                key={page}
                                type="button"
                                onClick={() => setCurrentPage(page)}
                                className={`w-8 h-8 rounded-lg text-xs font-black border-none cursor-pointer transition-all ${
                                  currentPage === page
                                    ? 'bg-brand-purple text-white shadow-md'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                }`}
                              >
                                {page}
                              </button>
                            ))}
                            <button
                              type="button"
                              disabled={currentPage === totalPages}
                              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border-none cursor-pointer"
                            >
                              Next →
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                )}

              </div>

            </div>
          )}

        </div>
      </main>

      <Footer onSwitchTab={() => {}} triggerToast={triggerToast} />
      <Toast message={toastMessage} visible={toastVisible} />
    </div>
  );
}
