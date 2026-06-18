"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Toast from '@/components/Toast';

export default function SignupPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);

  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 5000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
      triggerToast("Please fill in all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      triggerToast("Passwords do not match!");
      return;
    }
    if (!agree) {
      triggerToast("You must agree to the Terms & Conditions.");
      return;
    }
    
    triggerToast("Registration successful! Account created.");
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
            Create your account
          </h1>
          <p className="text-sm text-purple-100 mt-2 font-semibold">
            Join millions of travellers booking smarter with Alphaa.Africa
          </p>
        </div>

        {/* Form Overlay Container */}
        <div className="max-w-lg w-full mx-auto px-4 -mt-16 mb-20 relative z-10">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-purple-50 text-left">
            
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Names row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-bold mb-1.5">First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-purple-50/20 border border-slate-200 input-focus-effect rounded-xl p-3 text-brand-purple font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1.5">Last Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-purple-50/20 border border-slate-200 input-focus-effect rounded-xl p-3 text-brand-purple font-semibold focus:outline-none"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-slate-500 font-bold mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-purple-50/20 border border-slate-200 input-focus-effect rounded-xl p-3 text-brand-purple font-semibold focus:outline-none"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-slate-500 font-bold mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+234 800 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-purple-50/20 border border-slate-200 input-focus-effect rounded-xl p-3 text-brand-purple font-semibold focus:outline-none"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-slate-500 font-bold mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-purple-50/20 border border-slate-200 input-focus-effect rounded-xl p-3 text-brand-purple font-semibold focus:outline-none"
                />
                <span className="block text-[10px] text-slate-400 mt-1 font-semibold">
                  At least 8 characters with a mix of letters, numbers and symbols
                </span>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-slate-500 font-bold mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-purple-50/20 border border-slate-200 input-focus-effect rounded-xl p-3 text-brand-purple font-semibold focus:outline-none"
                />
              </div>

              {/* Agreement Checkbox */}
              <div className="flex items-start space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="agree-checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="accent-brand-orange w-4 h-4 cursor-pointer mt-0.5"
                />
                <label htmlFor="agree-checkbox" className="text-slate-500 font-semibold cursor-pointer select-none leading-relaxed">
                  I agree to the{' '}
                  <a href="#" className="text-brand-orange hover:underline font-bold">Terms & Conditions</a>
                  {' '}and{' '}
                  <a href="#" className="text-brand-orange hover:underline font-bold">Privacy Policy</a>
                </label>
              </div>

              {/* Button */}
              <button
                type="submit"
                className="w-full bg-brand-orange hover:bg-brand-purple text-white font-black py-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#FA6432]/10 mt-4 cursor-pointer border-none"
              >
                Create Account
              </button>

            </form>

            {/* Toggle login link */}
            <div className="text-center mt-6 text-xs text-slate-500 font-semibold border-t border-slate-100 pt-5">
              Already have an account?{' '}
              <Link href="/login" className="text-brand-orange hover:underline font-bold">
                Log in
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
