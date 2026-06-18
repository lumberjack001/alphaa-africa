"use client";

import React, { useState } from 'react';

interface FooterProps {
  onSwitchTab: (tabId: string) => void;
  triggerToast: (msg: string) => void;
}

export default function Footer({ onSwitchTab, triggerToast }: FooterProps) {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() === '') return;
    triggerToast('Subscription active! Fare alert updates enabled.');
    setEmail('');
  };

  return (
    <footer className="bg-[#4C1D5C] text-purple-100 py-16 px-4 sm:px-8 border-t border-purple-950 mt-20 text-left">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
        
        {/* Brand Profile column */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            {/* Custom Vector Logo white version */}
            <svg className="w-10 h-10" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="48" fill="#5E2870" />
              <path d="M52 25C37.5 25 26 36.5 26 51C26 65.5 37.5 77 52 77C58 77 64 74.5 67.5 70.5L62.5 62C57 65.5 52 65.5 52 65.5C44 65.5 38 59 38 51C38 43 44 36.5 52 36.5C59.5 39.5 63 39.5 63 39.5L67.5 35C63.5 27.5 58 25 52 25Z" fill="#ffffff" />
              <path d="M68.5 77C70 75 57 41 53.5 39C50.5 39 45.5 52.5 45.5 52.5L53.5 44.5L64.5 73.5H68.5Z" fill="#FA6432" />
            </svg>
            <div>
              <span className="text-sm font-black tracking-tight block text-white uppercase font-sans">ALPHAA<span className="text-brand-orange">.</span>AFRICA</span>
              <span className="text-[8px] font-bold text-brand-orange block tracking-widest uppercase">Travel & Tours</span>
            </div>
          </div>
          <p className="leading-relaxed text-purple-200 font-semibold">
            Alphaa.Africa modernizes traditional booking pathways across the West African continent through real-time GDS pipelines and instant auto-delivered ticketing.
          </p>
          <span className="text-[9px] text-purple-300 block">© 2026 Alphaa.Africa Travel & Tours.</span>
        </div>

        {/* Services Column */}
        <div>
          <h4 className="font-extrabold text-white mb-4 uppercase tracking-wider text-sm font-sans">Services Engine</h4>
          <ul className="space-y-2 text-purple-200 font-semibold">
            <li>
              <a
                href="#booking-engine"
                onClick={() => onSwitchTab('flights')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Domestic Air Travel bookings
              </a>
            </li>
            <li>
              <a
                href="#booking-engine"
                onClick={() => onSwitchTab('hotels')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Global Hotel Integrator
              </a>
            </li>
            <li>
              <a
                href="#booking-engine"
                onClick={() => onSwitchTab('tours')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Safaris & Curated Tours
              </a>
            </li>
            <li>
              <a
                href="#booking-engine"
                onClick={() => onSwitchTab('cars')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Premium Chauffeur Fleets
              </a>
            </li>
          </ul>
        </div>

        {/* Webhook Infrastructure */}
        <div>
          <h4 className="font-extrabold text-white mb-4 uppercase tracking-wider text-sm font-sans">Fintech & Integrity</h4>
          <ul className="space-y-2 text-purple-200 font-semibold">
            <li>60-Second Auto PDF Ticket Delivery</li>
            <li>Paystack Webhook Signatures</li>
            <li>AES 256 Data Encryption</li>
            <li>Zero Hidden Aggregator Fees</li>
          </ul>
        </div>

        {/* Newsletter subscription */}
        <div>
          <h4 className="font-extrabold text-white mb-4 uppercase tracking-wider text-sm font-sans">Get Flight Fare Alerts</h4>
          <p className="leading-relaxed text-purple-200 mb-3 font-semibold">Receive direct, dynamic airfare promotional codes right to your inbox.</p>
          <form onSubmit={handleSubscribe} className="flex items-center bg-[#5E2870] rounded-xl overflow-hidden p-1.5 border border-purple-400/20">
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent px-3 py-2 text-white placeholder-purple-300 focus:outline-none text-xs"
              required
            />
            <button
              type="submit"
              className="bg-brand-orange hover:bg-brand-purple text-white px-4 py-2 rounded-lg font-black uppercase tracking-wider transition-all cursor-pointer border-none"
            >
              Go
            </button>
          </form>
        </div>

      </div>
    </footer>
  );
}
