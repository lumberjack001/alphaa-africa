"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getStoredUser, clearTokens, clearStoredUser, type User } from '@/lib/api';

interface NavbarProps {
  onSwitchTab: (tabId: string) => void;
  onReset: () => void;
  onScrollToWidget?: () => void;
  activeTab: string;
}

export default function Navbar({ onSwitchTab, onReset, activeTab }: NavbarProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { id: 'flights', label: 'Flights' },
    { id: 'hotels', label: 'Hotels' },
    { id: 'tours', label: 'Packages' },
    { id: 'visa', label: 'Visa' },
    // { id: 'booking', label: 'Manage Booking' },
  ];

  // Load user from local storage
  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  // Track scroll position to toggle transparent ↔ solid navbar
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    // Set initial state in case page loads mid-scroll
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    clearTokens();
    clearStoredUser();
    setUser(null);
    setIsProfileOpen(false);
    router.push('/');
  };

  const userInitials = user
    ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase()
    : '';

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 py-3.5 px-4 sm:px-8 transition-all duration-300 ${
      isScrolled
        ? 'bg-white/95 backdrop-blur-md border-b border-purple-100 shadow-sm'
        : 'bg-transparent border-b border-transparent'
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

        {/* Brand Logo */}
        <button onClick={onReset} className="flex items-center space-x-3 group text-left cursor-pointer">
          <Image
            src="/logo.png"
            alt="Alphaa.Africa Logo"
            width={48}
            height={48}
            priority
            className="object-contain rounded-xl transition-transform duration-300 group-hover:scale-105"
          />
          <div>
            <span className={`text-lg font-black tracking-tight block leading-none uppercase font-heading transition-colors duration-300 ${
              isScrolled ? 'text-brand-purple' : 'text-white'
            }`}>ALPHAA<span className="text-brand-orange">.</span>AFRICA</span>
            <span className="text-[9px] font-bold tracking-[0.25em] text-brand-orange block mt-0.5 uppercase">Travel & Tours</span>
          </div>
        </button>

        <nav className="hidden md:flex items-center space-x-8 text-xs font-bold uppercase tracking-wider">
          {tabs.map(tab => (
            <a
              key={tab.id}
              href={tab.id === 'tours' ? '/packages' : (tab.id === 'visa' ? '/visa' : `/?tab=${tab.id}#booking-engine`)}
              onClick={(e) => {
                if (tab.id === 'tours' || tab.id === 'visa') {
                  return;
                }
                if (typeof window !== 'undefined' && window.location.pathname === '/') {
                  e.preventDefault();
                  onSwitchTab(tab.id);
                  const el = document.getElementById('booking-engine');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className={`transition-colors ${
                activeTab === tab.id
                  ? isScrolled
                    ? 'text-brand-purple hover:text-brand-orange font-extrabold border-b border-brand-orange pb-1'
                    : 'text-white font-extrabold border-b border-brand-orange pb-1'
                  : isScrolled
                    ? 'text-slate-500 hover:text-brand-purple'
                    : 'text-white/80 hover:text-white'
              }`}
            >
              {tab.label}
            </a>
          ))}
        </nav>

        {/* Auth Actions (Desktop) */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            // Authenticated user: avatar + name + hover dropdown
            <div ref={profileRef} className="relative">
              <button
                onMouseEnter={() => setIsProfileOpen(true)}
                onClick={() => setIsProfileOpen(prev => !prev)}
                className="flex items-center space-x-2.5 group cursor-pointer"
              >
                {/* Avatar circle with initials */}
                <div className="w-9 h-9 rounded-full bg-brand-purple flex items-center justify-center text-white text-[11px] font-black flex-shrink-0 ring-2 ring-brand-orange/30 group-hover:ring-brand-orange/60 transition-all">
                  {userInitials}
                </div>
                <div className="text-left">
                  <span className={`text-[11px] font-black block leading-none group-hover:text-brand-orange transition-colors ${
                    isScrolled ? 'text-brand-purple' : 'text-white'
                  }`}>
                    {user.first_name} {user.last_name}
                  </span>
                  <span className={`text-[9px] font-bold block mt-0.5 truncate max-w-28 ${
                    isScrolled ? 'text-slate-400' : 'text-white/60'
                  }`}>{user.email}</span>
                </div>
                {/* Chevron */}
                <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''} ${
                  isScrolled ? 'text-slate-400' : 'text-white/70'
                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div
                  onMouseLeave={() => setIsProfileOpen(false)}
                  className="absolute right-0 top-full mt-2 w-44 bg-white rounded-2xl shadow-xl border border-purple-100 py-2 z-50 animate-fadeIn"
                >
                  <Link
                    href="/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-[11px] font-bold text-slate-600 hover:text-brand-purple hover:bg-purple-50/50 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    My Profile
                  </Link>
                  <div className="border-t border-purple-50 mx-3 my-1"></div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[11px] font-bold text-slate-400 hover:text-red-500 hover:bg-red-50/40 transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Guest: Sign Up + Login
            <>
              <Link
                href="/signup"
                className="bg-brand-orange hover:bg-brand-purple text-white text-xs font-black px-5 py-3.5 rounded-xl uppercase tracking-wider shadow-lg shadow-[#FA6432]/10 transition-all hover:-translate-y-0.5 cursor-pointer text-center inline-block"
              >
                Sign Up
              </Link>
              <Link
                href="/login"
                className={`text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors text-center inline-block ${
                  isScrolled ? 'text-slate-500 hover:text-brand-purple' : 'text-white/90 hover:text-white'
                }`}
              >
                Login
              </Link>
            </>
          )}
        </div>

        {/* Hamburger (Mobile) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`md:hidden p-2 focus:outline-none transition-colors cursor-pointer ${
            isScrolled ? 'text-brand-purple hover:text-brand-orange' : 'text-white hover:text-white/70'
          }`}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

      </div>

      {/* Mobile Dropdown Overlay */}
      {isOpen && (
        <div className="md:hidden absolute top-[100%] left-0 w-full bg-white border-b border-purple-100 shadow-xl p-5 space-y-4 flex flex-col z-30 animate-fadeIn duration-200">
          {tabs.map(tab => (
            <a
              key={tab.id}
              href={tab.id === 'tours' ? '/packages' : (tab.id === 'visa' ? '/visa' : `/?tab=${tab.id}#booking-engine`)}
              onClick={(e) => {
                if (tab.id === 'tours' || tab.id === 'visa') {
                  setIsOpen(false);
                  return;
                }
                if (typeof window !== 'undefined' && window.location.pathname === '/') {
                  e.preventDefault();
                  onSwitchTab(tab.id);
                  setIsOpen(false);
                  const el = document.getElementById('booking-engine');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  setIsOpen(false);
                }
              }}
              className={`block text-xs font-black uppercase tracking-wider py-2 transition-colors ${activeTab === tab.id
                ? 'text-brand-purple border-l-2 border-brand-orange pl-3'
                : 'text-slate-500 hover:text-brand-purple pl-3'
                }`}
            >
              {tab.label}
            </a>
          ))}
          <hr className="border-purple-100 my-2" />
          <div className="flex flex-col gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-1 py-2">
                  <div className="w-9 h-9 rounded-full bg-brand-purple flex items-center justify-center text-white text-[11px] font-black flex-shrink-0">
                    {userInitials}
                  </div>
                  <div>
                    <span className="text-sm font-black text-brand-purple block">{user.first_name} {user.last_name}</span>
                    <span className="text-[10px] text-slate-400">{user.email}</span>
                  </div>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="w-full border border-purple-100 hover:border-brand-purple text-slate-600 hover:text-brand-purple text-xs font-bold py-3.5 rounded-xl uppercase tracking-wider cursor-pointer transition-colors text-center block"
                >
                  My Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full border border-red-100 hover:bg-red-50 text-red-400 hover:text-red-600 text-xs font-bold py-3.5 rounded-xl uppercase tracking-wider cursor-pointer transition-colors text-center"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signup"
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-brand-orange hover:bg-brand-purple text-white text-xs font-black py-3.5 rounded-xl uppercase tracking-wider shadow-lg shadow-[#FA6432]/10 transition-all cursor-pointer text-center block"
                >
                  Sign Up
                </Link>
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full border border-purple-100 hover:border-brand-purple text-slate-500 hover:text-brand-purple text-xs font-bold py-3.5 rounded-xl uppercase tracking-wider cursor-pointer transition-colors text-center block"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
