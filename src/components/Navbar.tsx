"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface NavbarProps {
  onSwitchTab: (tabId: string) => void;
  onReset: () => void;
  onScrollToWidget?: () => void;
  activeTab: string;
}

export default function Navbar({ onSwitchTab, onReset, activeTab }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const tabs = [
    { id: 'flights', label: 'Flights' },
    { id: 'hotels', label: 'Hotels' },
    { id: 'tours', label: 'Packages' },
    { id: 'booking', label: 'Manage Booking' },
  ];

  return (
    <header className="relative sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-purple-100 py-3.5 px-4 sm:px-8 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

        {/* Brand Logo - Scalable Vector Reconstructed */}
        <button onClick={onReset} className="flex items-center space-x-3 group text-left cursor-pointer">
          <Image
            src="/logo.jpeg"
            alt="Alphaa.Africa Logo"
            width={48}
            height={48}
            priority
            className="object-contain rounded-xl transition-transform duration-300 group-hover:scale-105"
          />
          <div>
            <span className="text-lg font-black tracking-tight block text-brand-purple leading-none uppercase font-heading">ALPHAA<span className="text-brand-orange">.</span>AFRICA</span>
            <span className="text-[9px] font-bold tracking-[0.25em] text-brand-orange block mt-0.5 uppercase">Travel & Tours</span>
          </div>
        </button>

        {/* Navigation Paths (Desktop viewport) */}
        <nav className="hidden md:flex items-center space-x-8 text-xs font-bold uppercase tracking-wider">
          {tabs.map(tab => (
            <a
              key={tab.id}
              href="#booking-engine"
              onClick={() => onSwitchTab(tab.id)}
              className={`${activeTab === tab.id
                ? 'text-brand-purple hover:text-brand-orange font-extrabold border-b border-brand-orange pb-1'
                : 'text-slate-500 hover:text-brand-purple'
                } transition-colors`}
            >
              {tab.label}
            </a>
          ))}
        </nav>

        {/* Auth Actions: Sign Up then Login (Desktop Viewport) */}
        <div className="hidden md:flex items-center space-x-5">
          <Link
            href="/signup"
            className="bg-brand-orange hover:bg-brand-purple text-white text-xs font-black px-5 py-3.5 rounded-xl uppercase tracking-wider shadow-lg shadow-[#FA6432]/10 transition-all hover:-translate-y-0.5 cursor-pointer text-center inline-block"
          >
            Sign Up
          </Link>
          <Link
            href="/login"
            className="text-slate-500 hover:text-brand-purple text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors text-center inline-block"
          >
            Login
          </Link>
        </div>

        {/* Hamburger Menu Icon (Mobile Viewport) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-brand-purple hover:text-brand-orange focus:outline-none transition-colors cursor-pointer"
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

      {/* Mobile Dropdown Overlay Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-[100%] left-0 w-full bg-white border-b border-purple-100 shadow-xl p-5 space-y-4 flex flex-col z-30 animate-fadeIn duration-200">
          {tabs.map(tab => (
            <a
              key={tab.id}
              href="#booking-engine"
              onClick={() => {
                onSwitchTab(tab.id);
                setIsOpen(false);
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
          </div>
        </div>
      )}
    </header>
  );
}
