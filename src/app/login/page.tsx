"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Toast from '@/components/Toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 5000);
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    triggerToast(`Verification link sent to ${email}!`);
  };

  const handleOAuth = (provider: string) => {
    triggerToast(`Connecting secure sign-in with ${provider}...`);
  };

  return (
    <div className="bg-[#FAF8F5] text-slate-800 antialiased min-h-screen flex flex-col justify-between selection:bg-[#FA6432] selection:text-white">
      
      <Navbar
        onSwitchTab={() => {}}
        onReset={() => window.location.href = '/'}
        activeTab=""
      />

      <main className="flex-grow">
        
        {/* Purple Banner Header */}
        <div className="bg-gradient-to-br from-[#4C1D5C] to-[#2E1238] text-white pt-16 pb-28 px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-black font-sans uppercase tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-purple-100 mt-2 font-semibold">
            Log in to manage your bookings and access exclusive deals
          </p>
        </div>

        {/* Form Overlay Container */}
        <div className="max-w-md w-full mx-auto px-4 -mt-16 mb-20 relative z-10">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-purple-50 text-left">
            
            {/* Third-Party Authentication buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleOAuth('Google')}
                className="w-full flex items-center justify-center py-3 border border-slate-200 hover:border-brand-orange hover:bg-slate-50 rounded-xl text-xs font-bold transition-all cursor-pointer bg-white"
              >
                {/* Google SVG Logo */}
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
                {/* Apple SVG Logo */}
                <svg className="w-4 h-4 mr-2.5 text-black fill-current" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.49-.62.71-1.16 1.85-1.01 2.96 1.12.09 2.27-.58 2.94-1.39z"/>
                </svg>
                Continue with Apple
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mx-3">or sign in with email</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            {/* Email form */}
            <form onSubmit={handleContinue} className="space-y-4">
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

              <button
                type="submit"
                className="w-full bg-brand-orange hover:bg-brand-purple text-white font-black py-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#FA6432]/10 mt-2 cursor-pointer border-none"
              >
                Continue
              </button>
            </form>

            {/* Toggle signup link */}
            <div className="text-center mt-6 text-xs text-slate-500 font-semibold">
              Don't have an account?{' '}
              <Link href="/signup" className="text-brand-orange hover:underline font-bold">
                Sign up
              </Link>
            </div>

          </div>
        </div>

      </main>

      <Footer onSwitchTab={() => {}} triggerToast={triggerToast} />

      <Toast message={toastMessage} visible={toastVisible} />

    </div>
  );
}
