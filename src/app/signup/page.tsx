"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Toast from '@/components/Toast';
import { apiFetch, ApiError } from '@/lib/api';

type SignupStep = 'register' | 'verify';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<SignupStep>('register');
  
  // Registration Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);

  // Verification OTP Field
  const [otpCode, setOtpCode] = useState('');

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

  const handleRegister = async (e: React.FormEvent) => {
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

    setIsLoading(true);
    try {
      await apiFetch('/api/auth/register/', {
        method: 'POST',
        body: JSON.stringify({
          email,
          first_name: firstName,
          last_name: lastName,
          phone_number: phone,
          password,
          password2: confirmPassword,
        }),
      });

      triggerToast("Registration successful! A verification code has been sent to your email.");
      setStep('verify');
    } catch (error) {
      if (error instanceof ApiError) {
        const details = error.data ? Object.entries(error.data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" | ") : error.message;
        triggerToast(`Signup Failed: ${details}`);
      } else {
        triggerToast("Failed to connect to registration servers.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) {
      triggerToast("Please enter the verification code.");
      return;
    }

    setIsLoading(true);
    try {
      await apiFetch('/api/auth/verify/confirm/', {
        method: 'POST',
        body: JSON.stringify({
          email,
          code: otpCode,
        }),
      });

      triggerToast("Email verified successfully! You can now log in.");
      
      // Redirect to login page
      setTimeout(() => {
        router.push('/login');
      }, 1500);

    } catch (error) {
      if (error instanceof ApiError) {
        const details = error.data?.detail || error.data?.code?.[0] || error.message;
        triggerToast(`Verification Failed: ${details}`);
      } else {
        triggerToast("Network error. Could not verify code.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;
    setIsLoading(true);
    try {
      await apiFetch('/api/auth/verify/request/', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      triggerToast("A new verification code has been dispatched.");
    } catch (error) {
      triggerToast("Could not request a new verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#FAF8F5] text-slate-800 antialiased min-h-screen flex flex-col justify-between selection:bg-[#FA6432] selection:text-white">
      
      <Navbar
        onSwitchTab={() => {}}
        onReset={() => router.push('/')}
        activeTab=""
      />

      <main className="flex-grow">
        
        {/* Purple Banner Header */}
        <div className="bg-gradient-to-br from-[#4C1D5C] to-[#2E1238] text-white pt-16 pb-28 px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-black font-sans uppercase tracking-tight">
            {step === 'register' ? "Create your account" : "Verify your email"}
          </h1>
          <p className="text-sm text-purple-100 mt-2 font-semibold">
            {step === 'register' 
              ? "Join millions of travellers booking smarter with Alphaa.Africa" 
              : `We sent a 6-digit confirmation code to ${email}`}
          </p>
        </div>

        {/* Form Overlay Container */}
        <div className="max-w-lg w-full mx-auto px-4 -mt-16 mb-20 relative z-10">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-purple-50 text-left">
            
            {step === 'register' ? (
              <form onSubmit={handleRegister} className="space-y-4 text-xs">
                
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
                    placeholder="+2348000000000"
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
                  disabled={isLoading}
                  className="w-full bg-brand-orange hover:bg-brand-purple text-white font-black py-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#FA6432]/10 mt-4 cursor-pointer border-none flex items-center justify-center disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Create Account"
                  )}
                </button>

              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-6 text-xs text-center">
                <div>
                  <label className="block text-slate-500 font-bold text-xs mb-3">Verification Code</label>
                  <input
                    type="text"
                    required
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-48 bg-purple-50/20 border border-slate-200 input-focus-effect rounded-xl p-4 text-brand-purple font-black text-lg text-center tracking-[0.4em] focus:outline-none font-mono mx-auto"
                  />
                </div>

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-brand-orange hover:bg-brand-purple text-white font-black py-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#FA6432]/10 cursor-pointer border-none flex items-center justify-center disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      "Verify & Activate"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="text-xs font-bold text-slate-400 hover:text-brand-orange underline cursor-pointer"
                  >
                    Resend Code
                  </button>
                </div>
              </form>
            )}

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
