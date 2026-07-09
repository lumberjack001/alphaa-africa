"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CustomSelect from '@/components/CustomSelect';
import CustomDatePicker from '@/components/CustomDatePicker';
import Toast from '@/components/Toast';
import { visaService, type VisaCountry, type VisaCountryDetails } from '@/services/visaService';
import { getStoredUser, ApiError } from '@/lib/api';

function VisaContent() {
  const [countries, setCountries] = useState<VisaCountry[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<VisaCountryDetails | null>(null);
  
  // Loaders
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [travelPurpose, setTravelPurpose] = useState('tourism');
  const [preferredDate, setPreferredDate] = useState('2026-08-15');
  const [numApplicants, setNumApplicants] = useState(1);
  const [message, setMessage] = useState('');

  // UI status
  const [errorMessage, setErrorMessage] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 5000);
  };

  // Fetch Countries on Load
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setIsLoadingCountries(true);
        const list = await visaService.getAllCountries();
        setCountries(list);
      } catch (err) {
        console.error("Error fetching visa countries:", err);
        setErrorMessage("Unable to retrieve available visa assistance countries at this time.");
      } finally {
        setIsLoadingCountries(false);
      }
    };

    fetchCountries();

    // Auto-populate logged-in user profile if available
    const storedUser = getStoredUser();
    if (storedUser) {
      setFullName(`${storedUser.first_name || ''} ${storedUser.last_name || ''}`.trim());
      setEmail(storedUser.email || '');
      setPhone(storedUser.phone_number || '');
    }
  }, []);

  // Handle Country Card Click
  const handleSelectCountry = async (country: VisaCountry) => {
    setIsLoadingDetails(true);
    setErrorMessage('');
    try {
      const details = await visaService.getCountryDetails(country.slug);
      setSelectedCountry(details);
      
      // Auto scroll to application form
      setTimeout(() => {
        const el = document.getElementById('visa-application-form');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error("Error fetching country details:", err);
      // Fallback: mock detail using existing info
      setSelectedCountry({
        ...country,
        description: `Apply for visa consultation assistance for ${country.name}. Our dedicated team of visa specialists will review your application requirements, documentation, and guide you through the process.`
      });
      setTimeout(() => {
        const el = document.getElementById('visa-application-form');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Handle Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedCountry) {
      setErrorMessage("Please select a destination country for your visa consultation first.");
      return;
    }

    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setErrorMessage("Please complete your biographical details (Name, Email, and Phone).");
      return;
    }

    setIsSubmitting(true);
    triggerToast("Initiating consultation booking payload...");

    try {
      const payload = {
        country_id: Number(selectedCountry.id),
        full_name: fullName,
        email: email,
        phone: phone,
        travel_purpose: travelPurpose,
        preferred_date: preferredDate,
        num_applicants: Number(numApplicants),
        message: message,
        callback_url: `${window.location.origin}/api/payments/callback/?type=visa`
      };

      const response = await visaService.applyVisa(payload);
      
      if (response?.payment?.authorization_url) {
        triggerToast("Redirecting to Paystack secure portal...");
        window.location.href = response.payment.authorization_url;
      } else {
        throw new Error("Missing transaction gateway redirection URL.");
      }
    } catch (error) {
      console.error("Visa application error:", error);
      if (error instanceof ApiError) {
        const details = error.data 
          ? Object.entries(error.data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" | ") 
          : error.message;
        setErrorMessage(`Application submission failed: ${details}`);
      } else {
        setErrorMessage("Failed to establish secure payment connection. Please verify your fields and network.");
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 text-left">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
        <span className="bg-brand-orange/10 text-brand-orange font-black px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest inline-block font-sans">
          Expert Travel Advisory
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-brand-purple font-heading tracking-tight leading-none uppercase">
          Visa Assistance <span className="text-brand-orange">Services</span>
        </h1>
        <p className="text-sm text-slate-500 font-semibold leading-relaxed">
          Alphaa.Africa guides you through the complex visa pathways. Pick your destination country, submit your travel parameters, pay a ₦5,000 consultation fee, and start your official visa review callback.
        </p>
      </div>

      {/* Main Visa Selector Section */}
      <section className="mb-16">
        <h2 className="text-lg font-black text-brand-purple uppercase tracking-wider mb-8 font-sans border-l-4 border-brand-orange pl-3">
          1. Select Destination Country
        </h2>

        {isLoadingCountries ? (
          <div className="flex items-center justify-center p-12 min-h-[300px]">
            <div className="text-center space-y-4">
              <div className="w-10 h-10 border-4 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-500 font-semibold tracking-wider">Syncing global destination countries list...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {countries.map((country) => {
              const isSelected = selectedCountry?.id === country.id;
              return (
                <div
                  key={country.id}
                  onClick={() => handleSelectCountry(country)}
                  className={`bg-white rounded-3xl overflow-hidden border transition-all duration-300 cursor-pointer flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 ${
                    isSelected 
                      ? 'border-brand-orange ring-2 ring-brand-orange/30 shadow-md' 
                      : 'border-purple-100 shadow-sm'
                  }`}
                >
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    <img 
                      src={country.flag_image || 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=600&q=80'}
                      alt={`${country.name} Flag`}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-base font-black tracking-tight font-sans uppercase leading-none">{country.name}</h3>
                    </div>
                  </div>
                  <div className="p-5 space-y-4 text-xs">
                    <div className="flex justify-between items-center border-b border-purple-50 pb-2">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Consultation Fee</span>
                      <strong className="text-slate-900 font-black font-sans">
                        ₦{Number(country.consultation_fee).toLocaleString()}
                      </strong>
                    </div>
                    <div className="flex justify-between items-center border-b border-purple-50 pb-2">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Processing Time</span>
                      <span className="text-brand-purple font-extrabold">{country.processing_time}</span>
                    </div>
                    <button
                      type="button"
                      className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer border-none ${
                        isSelected 
                          ? 'bg-brand-purple text-white' 
                          : 'bg-purple-50 text-brand-purple hover:bg-brand-orange hover:text-white'
                      }`}
                    >
                      {isSelected ? '✓ Selected Country' : 'Select Destination'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Detail Section & Form */}
      {selectedCountry && (
        <section id="visa-application-form" className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start scroll-mt-24 animate-fadeIn">
          {/* Detail card */}
          <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-purple-100 shadow-md space-y-5">
            <h3 className="text-base font-black text-brand-purple font-sans uppercase tracking-wider border-b border-purple-50 pb-3">
              Selected Country Info
            </h3>
            
            <div className="relative h-40 rounded-2xl overflow-hidden bg-slate-100">
              <img 
                src={selectedCountry.flag_image} 
                alt={selectedCountry.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                <span className="text-white text-lg font-black uppercase font-sans tracking-wide">
                  {selectedCountry.name}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-500 font-medium">
              <p>{selectedCountry.description}</p>
              <div className="bg-purple-50/50 p-4 rounded-xl space-y-2 border border-purple-100/30">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-bold uppercase">Consultation Cost:</span>
                  <strong className="text-brand-purple font-black">₦{Number(selectedCountry.consultation_fee).toLocaleString()}</strong>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-bold uppercase">Estimated Wait:</span>
                  <strong className="text-brand-orange font-black">{selectedCountry.processing_time}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-md space-y-6">
            <h3 className="text-base font-black text-brand-purple font-sans uppercase tracking-wider border-b border-purple-50 pb-3">
              2. Applicant &amp; Travel Form
            </h3>

            {errorMessage && (
              <div className="bg-red-50 text-red-600 text-xs font-semibold p-4 rounded-2xl border border-red-100 leading-relaxed">
                ⚠️ {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1 text-left">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-purple-50/40 p-4 rounded-2xl border border-purple-100/60 focus:outline-none focus:border-brand-orange text-xs text-slate-800 font-bold"
                  />
                </div>
                <div className="flex flex-col space-y-1 text-left">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-purple-50/40 p-4 rounded-2xl border border-purple-100/60 focus:outline-none focus:border-brand-orange text-xs text-slate-800 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1 text-left">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +2348012345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-purple-50/40 p-4 rounded-2xl border border-purple-100/60 focus:outline-none focus:border-brand-orange text-xs text-slate-800 font-bold"
                  />
                </div>
                <div className="flex flex-col space-y-1 text-left">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Number of Applicants</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={numApplicants}
                    onChange={(e) => setNumApplicants(Number(e.target.value))}
                    className="bg-purple-50/40 p-4 rounded-2xl border border-purple-100/60 focus:outline-none focus:border-brand-orange text-xs text-slate-800 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CustomSelect
                  id="visa-travel-purpose"
                  label="Purpose of Travel"
                  value={travelPurpose}
                  options={[
                    { value: "tourism", label: "Tourism / Holiday" },
                    { value: "business", label: "Business Travel" },
                    { value: "study", label: "Educational Study" },
                    { value: "work", label: "Work / Employment" },
                    { value: "medical", label: "Medical Treatment" },
                    { value: "family", label: "Family Reunion" },
                    { value: "other", label: "Other Reasons" },
                  ]}
                  onChange={setTravelPurpose}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-slate-400 shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-.778.099-1.533.284-2.253" />
                    </svg>
                  }
                  className="w-full"
                />

                <CustomDatePicker
                  id="visa-preferred-date"
                  label="Preferred Travel Date"
                  value={preferredDate}
                  onChange={setPreferredDate}
                  className="w-full"
                />
              </div>

              <div className="flex flex-col space-y-1 text-left">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Additional Message / Context</label>
                <textarea
                  placeholder="Details about your travel plans, visa history, or guidance requests..."
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-purple-50/40 p-4 rounded-2xl border border-purple-100/60 focus:outline-none focus:border-brand-orange text-xs text-slate-800 font-bold resize-none"
                />
              </div>

              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex items-start space-x-3 text-slate-600 text-[10px] leading-relaxed font-semibold">
                <span className="text-base text-amber-600 select-none">ℹ️</span>
                <div>
                  <strong className="text-amber-800 block mb-0.5 uppercase tracking-wide">Visa Disclaimer Notice</strong>
                  Consultation fees are non-refundable. Embassy visa application fees are managed separately from this consultation. While our specialists assist with documentation audit reviews, actual visa decisions are at the sole discretion of the respective foreign embassy.
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#FA6432] hover:bg-[#4C1D5C] text-white font-extrabold py-4 rounded-2xl text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-lg shadow-[#FA6432]/10 cursor-pointer border-none disabled:bg-slate-300 disabled:shadow-none"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Connecting to Paystack Checkout...</span>
                  </>
                ) : (
                  <span>🔒 Submit &amp; Pay Consultation Fee (₦{Number(selectedCountry.consultation_fee).toLocaleString()})</span>
                )}
              </button>
            </form>
          </div>
        </section>
      )}

      {/* Toast notifications */}
      <Toast message={toastMessage} visible={toastVisible} />
    </div>
  );
}

export default function VisaPage() {
  return (
    <div className="bg-[#FAF8F5] text-slate-800 antialiased min-h-screen flex flex-col justify-between selection:bg-[#FA6432] selection:text-white font-sans">
      <Navbar
        onSwitchTab={() => (window.location.href = `/#booking-engine`)}
        onReset={() => (window.location.href = `/`)}
        activeTab="visa"
      />

      <main className="flex-grow navbar-offset">
        <Suspense fallback={
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
          </div>
        }>
          <VisaContent />
        </Suspense>
      </main>

      <Footer onSwitchTab={() => {}} triggerToast={() => {}} />
    </div>
  );
}
