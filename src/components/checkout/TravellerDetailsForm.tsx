"use client";

import React from 'react';
import Link from 'next/link';

export interface PassengerFormData {
  id: string;
  type: 'ADULT' | 'CHILD' | 'HELD_INFANT' | 'INFANT';
  label: string;
  title: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dobDay: string;
  dobMonth: string;
  dobYear: string;
  gender: string;
  nationality: string;
  passportNumber?: string;
  passportExpiryDay?: string;
  passportExpiryMonth?: string;
  passportExpiryYear?: string;
}

export interface ContactFormData {
  email: string;
  phoneCountryCode: string;
  phone: string;
  createProfile: boolean;
  termsAgreed: boolean;
}

interface TravellerDetailsFormProps {
  contactInfo: ContactFormData;
  setContactInfo: React.Dispatch<React.SetStateAction<ContactFormData>>;
  passengers: PassengerFormData[];
  setPassengers: React.Dispatch<React.SetStateAction<PassengerFormData[]>>;
  isInternational?: boolean;
  isLoggedIn?: boolean;
  fieldErrors?: Record<string, string>;
  clearFieldError?: (key: string) => void;
}

const COUNTRY_CODES = [
  { code: '+234', label: 'NG (+234)' },
  { code: '+1', label: 'US (+1)' },
  { code: '+44', label: 'UK (+44)' },
  { code: '+27', label: 'ZA (+27)' },
  { code: '+254', label: 'KE (+254)' },
  { code: '+233', label: 'GH (+233)' },
  { code: '+971', label: 'AE (+971)' },
  { code: '+33', label: 'FR (+33)' },
  { code: '+49', label: 'DE (+49)' },
];

export const NATIONALITIES = [
  { code: 'NG', name: 'Nigeria' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'KE', name: 'Kenya' },
  { code: 'GH', name: 'Ghana' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'AU', name: 'Australia' },
  { code: 'IN', name: 'India' },
  { code: 'CN', name: 'China' },
  { code: 'JP', name: 'Japan' },
  { code: 'EG', name: 'Egypt' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'UG', name: 'Uganda' },
  { code: 'RW', name: 'Rwanda' },
];

const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
const MONTHS = [
  { val: '01', label: 'Jan' }, { val: '02', label: 'Feb' }, { val: '03', label: 'Mar' },
  { val: '04', label: 'Apr' }, { val: '05', label: 'May' }, { val: '06', label: 'Jun' },
  { val: '07', label: 'Jul' }, { val: '08', label: 'Aug' }, { val: '09', label: 'Sep' },
  { val: '10', label: 'Oct' }, { val: '11', label: 'Nov' }, { val: '12', label: 'Dec' },
];

const CURRENT_YEAR = new Date().getFullYear();
const DOB_YEARS_ADULT = Array.from({ length: 90 }, (_, i) => String(CURRENT_YEAR - 18 - i));
const DOB_YEARS_CHILD = Array.from({ length: 16 }, (_, i) => String(CURRENT_YEAR - 2 - i));
const DOB_YEARS_INFANT = Array.from({ length: 2 }, (_, i) => String(CURRENT_YEAR - i));
const PASSPORT_EXPIRY_YEARS = Array.from({ length: 15 }, (_, i) => String(CURRENT_YEAR + i));

export default function TravellerDetailsForm({
  contactInfo,
  setContactInfo,
  passengers,
  setPassengers,
  isInternational = true,
  isLoggedIn = false,
  fieldErrors = {},
  clearFieldError
}: TravellerDetailsFormProps) {

  const updatePassenger = (index: number, field: keyof PassengerFormData, value: string) => {
    setPassengers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });

    if (clearFieldError) {
      if (field === 'firstName') clearFieldError(`passenger_${index}_firstName`);
      if (field === 'lastName') clearFieldError(`passenger_${index}_lastName`);
      if (field === 'dobDay' || field === 'dobMonth' || field === 'dobYear') clearFieldError(`passenger_${index}_dob`);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-purple-950/5 border border-purple-100/80 mb-8">
      {/* Step Header */}
      <div className="flex items-center gap-3.5 pb-6 mb-6 border-b border-purple-100/70">
        <div className="w-9 h-9 rounded-2xl bg-brand-purple text-white font-black flex items-center justify-center text-base shadow-md shadow-purple-900/20">
          2
        </div>
        <div>
          <h2 className="text-xl font-black text-brand-purple font-heading tracking-tight uppercase">Traveller Details</h2>
          <p className="text-xs text-slate-500 font-semibold">Enter contact recipient and passenger passport information</p>
        </div>
      </div>

      {/* Quick Login Banner (Only shown if user is not logged in) */}
      {!isLoggedIn && (
        <div className="mb-8 p-4 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-700 font-bold">
            <span className="text-base">👤</span>
            <span>Have an account? <Link href="/login?next=/flights/checkout" className="text-brand-orange font-black hover:underline">Log in for faster checkout</Link></span>
          </div>
        </div>
      )}

      {/* Contact Information */}
      <div className="mb-8 bg-purple-50/30 p-5 sm:p-6 rounded-2xl border border-purple-100/80">
        <h3 className="text-base font-black text-brand-purple font-heading uppercase tracking-wide mb-1">Contact Information</h3>
        <p className="text-xs text-slate-500 font-semibold mb-4">Booking confirmation and automated E-tickets will be sent to this contact.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={contactInfo.email}
              onChange={(e) => {
                setContactInfo({ ...contactInfo, email: e.target.value });
                if (clearFieldError) clearFieldError('contact_email');
              }}
              className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium transition-all outline-none bg-white ${
                fieldErrors['contact_email']
                  ? 'border-rose-500 bg-rose-50/20 text-rose-900 ring-1 ring-rose-500'
                  : 'border-purple-100 focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple'
              }`}
              required
            />
            {fieldErrors['contact_email'] && (
              <span className="text-[11px] font-bold text-rose-500 mt-1 block">
                {fieldErrors['contact_email']}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <div className={`flex rounded-2xl border bg-white overflow-hidden ${
              fieldErrors['contact_phone']
                ? 'border-rose-500 ring-1 ring-rose-500'
                : 'border-purple-100 focus-within:ring-2 focus-within:ring-brand-purple/20 focus-within:border-brand-purple'
            }`}>
              <select
                value={contactInfo.phoneCountryCode}
                onChange={(e) => setContactInfo({ ...contactInfo, phoneCountryCode: e.target.value })}
                className="px-3 py-3 border-r border-purple-100 text-xs font-bold bg-purple-50/50 text-slate-800 outline-none shrink-0"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
              <input
                type="tel"
                placeholder="800 000 0000"
                value={contactInfo.phone}
                onChange={(e) => {
                  setContactInfo({ ...contactInfo, phone: e.target.value });
                  if (clearFieldError) clearFieldError('contact_phone');
                }}
                className="w-full min-w-0 px-4 py-3 text-sm font-medium outline-none bg-transparent"
                required
              />
            </div>
            {fieldErrors['contact_phone'] && (
              <span className="text-[11px] font-bold text-rose-500 mt-1 block">
                {fieldErrors['contact_phone']}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Passenger Forms */}
      <div className="space-y-6">
        {passengers.map((p, idx) => {
          const isInfant = p.type === 'HELD_INFANT' || p.type === 'INFANT';
          const yearsList = p.type === 'CHILD' ? DOB_YEARS_CHILD : isInfant ? DOB_YEARS_INFANT : DOB_YEARS_ADULT;
          const firstNameErr = fieldErrors[`passenger_${idx}_firstName`];
          const lastNameErr = fieldErrors[`passenger_${idx}_lastName`];
          const dobErr = fieldErrors[`passenger_${idx}_dob`];

          return (
            <div key={p.id} className="p-5 sm:p-6 rounded-2xl border border-purple-100 bg-white space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-purple-100">
                <div className="flex items-center gap-2.5">
                  <h4 className="font-black text-brand-purple font-heading text-base">{p.label}</h4>
                  <span className="text-[11px] bg-purple-100 text-brand-purple px-2.5 py-0.5 rounded-full font-black uppercase">
                    {isInfant ? 'HELD INFANT' : p.type}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-semibold">Names must match passport / ID</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Title</label>
                  <select
                    value={p.title}
                    onChange={(e) => updatePassenger(idx, 'title', e.target.value)}
                    className="w-full px-3.5 py-3 rounded-2xl border border-purple-100 text-sm font-bold bg-purple-50/30 focus:ring-2 focus:ring-brand-purple/20 outline-none"
                  >
                    <option value="Mr">Mr</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Ms">Ms</option>
                    <option value="Dr">Dr</option>
                    <option value="Master">Master</option>
                  </select>
                </div>

                {/* First Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="As on passport / ID"
                    value={p.firstName}
                    onChange={(e) => updatePassenger(idx, 'firstName', e.target.value)}
                    className={`w-full px-3.5 py-3 rounded-2xl border text-sm font-medium transition-all outline-none ${
                      firstNameErr
                        ? 'border-rose-500 bg-rose-50/20 text-rose-900 ring-1 ring-rose-500'
                        : 'border-purple-100 focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple'
                    }`}
                    required
                  />
                  {firstNameErr && (
                    <span className="text-[11px] font-bold text-rose-500 mt-1 block">
                      {firstNameErr}
                    </span>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="As on passport / ID"
                    value={p.lastName}
                    onChange={(e) => updatePassenger(idx, 'lastName', e.target.value)}
                    className={`w-full px-3.5 py-3 rounded-2xl border text-sm font-medium transition-all outline-none ${
                      lastNameErr
                        ? 'border-rose-500 bg-rose-50/20 text-rose-900 ring-1 ring-rose-500'
                        : 'border-purple-100 focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple'
                    }`}
                    required
                  />
                  {lastNameErr && (
                    <span className="text-[11px] font-bold text-rose-500 mt-1 block">
                      {lastNameErr}
                    </span>
                  )}
                </div>

                {/* Middle Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Middle Name <span className="text-slate-400 font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="As on passport / ID"
                    value={p.middleName || ''}
                    onChange={(e) => updatePassenger(idx, 'middleName', e.target.value)}
                    className="w-full px-3.5 py-3 rounded-2xl border border-purple-100 text-sm font-medium focus:ring-2 focus:ring-brand-purple/20 outline-none"
                  />
                </div>
              </div>

              {/* DOB, Gender, Nationality */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* DOB Selectors */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Date of Birth <span className="text-rose-500">*</span>
                  </label>
                  <div className={`grid grid-cols-3 gap-1.5 p-1 rounded-2xl border ${
                    dobErr
                      ? 'border-rose-500 bg-rose-50/20 ring-1 ring-rose-500'
                      : 'border-transparent'
                  }`}>
                    <select
                      value={p.dobDay}
                      onChange={(e) => updatePassenger(idx, 'dobDay', e.target.value)}
                      className="px-2 py-3 rounded-xl border border-purple-100 text-xs font-bold bg-purple-50/30 outline-none"
                    >
                      <option value="">Day</option>
                      {DAYS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <select
                      value={p.dobMonth}
                      onChange={(e) => updatePassenger(idx, 'dobMonth', e.target.value)}
                      className="px-2 py-3 rounded-xl border border-purple-100 text-xs font-bold bg-purple-50/30 outline-none"
                    >
                      <option value="">Month</option>
                      {MONTHS.map((m) => (
                        <option key={m.val} value={m.val}>{m.label}</option>
                      ))}
                    </select>
                    <select
                      value={p.dobYear}
                      onChange={(e) => updatePassenger(idx, 'dobYear', e.target.value)}
                      className="px-2 py-3 rounded-xl border border-purple-100 text-xs font-bold bg-purple-50/30 outline-none"
                    >
                      <option value="">Year</option>
                      {yearsList.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  {dobErr && (
                    <span className="text-[11px] font-bold text-rose-500 mt-1 block">
                      {dobErr}
                    </span>
                  )}
                </div>

                {/* Gender Pills */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Gender <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-2 pt-0.5">
                    {['MALE', 'FEMALE'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => updatePassenger(idx, 'gender', g)}
                        className={`flex-1 py-3 px-3 rounded-2xl border text-xs font-black transition-all cursor-pointer ${
                          p.gender === g
                            ? 'bg-brand-purple text-white border-brand-purple shadow-md shadow-purple-900/20'
                            : 'bg-white text-slate-700 border-purple-100 hover:bg-purple-50'
                        }`}
                      >
                        {g === 'MALE' ? 'Male' : 'Female'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nationality (ISO 2-letter codes) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nationality <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={p.nationality}
                    onChange={(e) => updatePassenger(idx, 'nationality', e.target.value)}
                    className="w-full px-3.5 py-3 rounded-2xl border border-purple-100 text-xs font-bold bg-purple-50/30 outline-none focus:ring-2 focus:ring-brand-purple/20"
                  >
                    {NATIONALITIES.map((nat) => (
                      <option key={nat.code} value={nat.code}>{nat.name} ({nat.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Passport Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-purple-100/60">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Passport Number <span className="text-slate-400 font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. A12345678"
                    value={p.passportNumber || ''}
                    onChange={(e) => updatePassenger(idx, 'passportNumber', e.target.value)}
                    className="w-full px-3.5 py-3 rounded-2xl border border-purple-100 text-sm font-mono focus:ring-2 focus:ring-brand-purple/20 outline-none uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Passport Expiry Date
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <select
                      value={p.passportExpiryDay || ''}
                      onChange={(e) => updatePassenger(idx, 'passportExpiryDay', e.target.value)}
                      className="px-2 py-3 rounded-2xl border border-purple-100 text-xs font-bold bg-purple-50/30 outline-none"
                    >
                      <option value="">Day</option>
                      {DAYS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <select
                      value={p.passportExpiryMonth || ''}
                      onChange={(e) => updatePassenger(idx, 'passportExpiryMonth', e.target.value)}
                      className="px-2 py-3 rounded-2xl border border-purple-100 text-xs font-bold bg-purple-50/30 outline-none"
                    >
                      <option value="">Month</option>
                      {MONTHS.map((m) => (
                        <option key={m.val} value={m.val}>{m.label}</option>
                      ))}
                    </select>
                    <select
                      value={p.passportExpiryYear || ''}
                      onChange={(e) => updatePassenger(idx, 'passportExpiryYear', e.target.value)}
                      className="px-2 py-3 rounded-2xl border border-purple-100 text-xs font-bold bg-purple-50/30 outline-none"
                    >
                      <option value="">Year</option>
                      {PASSPORT_EXPIRY_YEARS.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Profile Creation Opt-in Card */}
      {!isLoggedIn && (
        <div className="mt-6 p-4 rounded-2xl border border-purple-200 bg-purple-50/50 flex items-start gap-3">
          <input
            type="checkbox"
            id="createProfile"
            checked={contactInfo.createProfile}
            onChange={(e) => setContactInfo({ ...contactInfo, createProfile: e.target.checked })}
            className="mt-1 w-4 h-4 text-brand-purple rounded border-purple-300 focus:ring-brand-purple cursor-pointer"
          />
          <label htmlFor="createProfile" className="text-xs text-slate-700 cursor-pointer">
            <span className="font-extrabold text-brand-purple">Create a profile for me</span>{' '}
            <span className="bg-brand-orange text-white font-black px-2 py-0.5 rounded text-[10px] ml-1 uppercase tracking-wider">Prime Perks</span>
            <p className="text-slate-500 mt-0.5 font-medium">
              Save your details for faster checkout next time, track bookings from your dashboard, and unlock member-only fares.
            </p>
          </label>
        </div>
      )}

      {/* Terms & Privacy Consent */}
      <div className="mt-4">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="termsAgreed"
            checked={contactInfo.termsAgreed}
            onChange={(e) => {
              setContactInfo({ ...contactInfo, termsAgreed: e.target.checked });
              if (clearFieldError) clearFieldError('terms_agreed');
            }}
            className="mt-0.5 w-4 h-4 text-brand-purple rounded border-purple-300 focus:ring-brand-purple cursor-pointer"
          />
          <label htmlFor="termsAgreed" className="text-xs text-slate-600 font-medium cursor-pointer">
            By proceeding, you agree that you have read and accepted our{' '}
            <a href="#" className="text-brand-purple font-bold hover:underline">Terms & Conditions</a> and{' '}
            <a href="#" className="text-brand-purple font-bold hover:underline">Privacy Policy</a>.
          </label>
        </div>
        {fieldErrors['terms_agreed'] && (
          <span className="text-[11px] font-bold text-rose-500 mt-1 block ml-7">
            {fieldErrors['terms_agreed']}
          </span>
        )}
      </div>
    </div>
  );
}
