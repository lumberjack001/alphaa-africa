"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Toast from '@/components/Toast';
import { apiFetch, setTokens, setStoredUser, ApiError } from '@/lib/api';

type AuthView = 'login' | 'forgot_request' | 'forgot_confirm';

export default function LoginPage() {
  const router = useRouter();
  const [view, setView] = useState<AuthView>('login');

  // Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Reset Password Fields
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // UX State
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 5000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      triggerToast("Please enter email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const data = await apiFetch<{
        access: string;
        refresh: string;
        user: {
          id: number;
          email: string;
          first_name: string;
          last_name: string;
          phone_number: string;
          is_verified: boolean;
        };
      }>('/api/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      setTokens(data.access, data.refresh);
      setStoredUser(data.user);
      triggerToast(`Welcome back, ${data.user.first_name}!`);

      // Redirect to home dashboard
      setTimeout(() => {
        router.push('/');
      }, 1000);

    } catch (error) {
      if (error instanceof ApiError) {
        // Show validation or field messages
        const details = error.data?.detail || error.data?.non_field_errors?.[0] || error.message;
        triggerToast(`Login Failed: ${details}`);
      } else {
        triggerToast("An unexpected error occurred during sign-in.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      triggerToast("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    try {
      await apiFetch('/api/auth/password-reset/request/', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      triggerToast("Reset request sent! Please check your inbox for a verification code.");
      setView('forgot_confirm');
    } catch (error) {
      // Endpoint always returns success for privacy, but handle client/network faults
      triggerToast("Connection failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !resetCode || !newPassword) {
      triggerToast("Please fill in all recovery fields.");
      return;
    }

    setIsLoading(true);
    try {
      await apiFetch('/api/auth/password-reset/confirm/', {
        method: 'POST',
        body: JSON.stringify({
          email,
          code: resetCode,
          new_password: newPassword
        }),
      });

      triggerToast("Password reset successfully! You can now log in.");
      setView('login');
      setPassword('');
    } catch (error) {
      if (error instanceof ApiError) {
        const details = error.data?.detail || error.data?.code?.[0] || error.message;
        triggerToast(`Reset Failed: ${details}`);
      } else {
        triggerToast("An error occurred. Check your network and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = (provider: string) => {
    triggerToast(`Connecting secure sign-in with ${provider}...`);
  };

  return (
    <div className="bg-[#FAF8F5] text-slate-800 antialiased min-h-screen flex flex-col justify-between selection:bg-[#FA6432] selection:text-white">

      <Navbar
        onSwitchTab={() => { }}
        onReset={() => router.push('/')}
        activeTab=""
      />

      <main className="flex-grow">

        {/* Purple Banner Header */}
        <div className="bg-gradient-to-br from-[#4C1D5C] to-[#2E1238] text-white pt-16 pb-28 px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-black font-sans uppercase tracking-tight">
            {view === 'login' && "Welcome Back"}
            {view === 'forgot_request' && "Reset Password"}
            {view === 'forgot_confirm' && "Confirm Reset"}
          </h1>
          <p className="text-sm text-purple-100 mt-2 font-semibold">
            {view === 'login' && "Log in to manage your bookings and access exclusive deals"}
            {view === 'forgot_request' && "Enter your registered email to request a reset code"}
            {view === 'forgot_confirm' && "Enter verification code and set your new password"}
          </p>
        </div>

        {/* Form Overlay Container */}
        <div className="max-w-md w-full mx-auto px-4 -mt-16 mb-20 relative z-10">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-purple-50 text-left">

            {view === 'login' && (
              <>
                {/* Third-Party Authentication buttons */}
                {/* <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => handleOAuth('Google')}
                    className="w-full flex items-center justify-center py-3 border border-slate-200 hover:border-brand-orange hover:bg-slate-50 rounded-xl text-xs font-bold transition-all cursor-pointer bg-white"
                  >
                    <svg className="w-4 h-4 mr-2.5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    Continue with Google
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOAuth('Apple')}
                    className="w-full flex items-center justify-center py-3 border border-slate-200 hover:border-brand-orange hover:bg-slate-50 rounded-xl text-xs font-bold transition-all cursor-pointer bg-white"
                  >
                    <svg className="w-4 h-4 mr-2.5 text-black fill-current" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.49-.62.71-1.16 1.85-1.01 2.96 1.12.09 2.27-.58 2.94-1.39z"/>
                    </svg>
                    Continue with Apple
                  </button>
                </div>

                {/* Divider 
                <div className="flex items-center my-6">
                  <div className="flex-grow border-t border-slate-100"></div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mx-3">sign in with email</span>
                  <div className="flex-grow border-t border-slate-100"></div>
                </div> */}

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-slate-500 font-bold text-xs mb-1.5">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-purple-50/20 border border-slate-200 input-focus-effect rounded-xl p-3 text-brand-purple font-semibold text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-slate-500 font-bold text-xs">Password</label>
                      <button
                        type="button"
                        onClick={() => setView('forgot_request')}
                        className="text-[11px] font-bold text-brand-orange hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-purple-50/20 border border-slate-200 input-focus-effect rounded-xl p-3 text-brand-purple font-semibold text-xs focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-brand-orange hover:bg-brand-purple text-white font-black py-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#FA6432]/10 mt-2 cursor-pointer border-none flex items-center justify-center disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </form>

                {/* Toggle signup link */}
                <div className="text-center mt-6 text-xs text-slate-500 font-semibold">
                  Don't have an account?{' '}
                  <Link href="/signup" className="text-brand-orange hover:underline font-bold">
                    Sign up
                  </Link>
                </div>
              </>
            )}

            {view === 'forgot_request' && (
              <form onSubmit={handleForgotPasswordRequest} className="space-y-4">
                <div>
                  <label className="block text-slate-500 font-bold text-xs mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-purple-50/20 border border-slate-200 input-focus-effect rounded-xl p-3 text-brand-purple font-semibold text-xs focus:outline-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setView('login')}
                    className="w-1/3 border border-slate-200 hover:border-slate-300 font-bold py-4 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer text-center"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-2/3 bg-brand-orange hover:bg-brand-purple text-white font-black py-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#FA6432]/10 cursor-pointer border-none flex items-center justify-center disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      "Send Code"
                    )}
                  </button>
                </div>
              </form>
            )}

            {view === 'forgot_confirm' && (
              <form onSubmit={handleForgotPasswordConfirm} className="space-y-4">
                <div>
                  <label className="block text-slate-500 font-bold text-xs mb-1.5">Reset Verification Code</label>
                  <input
                    type="text"
                    required
                    placeholder="6-digit code"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    className="w-full bg-purple-50/20 border border-slate-200 input-focus-effect rounded-xl p-3 text-brand-purple font-semibold text-xs text-center tracking-widest focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold text-xs mb-1.5">New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-purple-50/20 border border-slate-200 input-focus-effect rounded-xl p-3 text-brand-purple font-semibold text-xs focus:outline-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setView('forgot_request')}
                    className="w-1/3 border border-slate-200 hover:border-slate-300 font-bold py-4 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer text-center"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-2/3 bg-brand-orange hover:bg-brand-purple text-white font-black py-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#FA6432]/10 cursor-pointer border-none flex items-center justify-center disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      "Set Password"
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>

      </main>

      <Footer onSwitchTab={() => { }} triggerToast={triggerToast} />

      <Toast message={toastMessage} visible={toastVisible} />

    </div>
  );
}
