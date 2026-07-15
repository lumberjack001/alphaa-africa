"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface FooterProps {
  onSwitchTab: (tabId: string) => void;
  triggerToast: (msg: string) => void;
}

export default function Footer({ onSwitchTab, triggerToast }: FooterProps) {
  const [email, setEmail] = useState('');
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  const handleTabNav = (tabId: string) => {
    onSwitchTab(tabId);
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      router.push(`/?tab=${tabId}`);
    } else {
      const el = document.getElementById('booking-engine');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() === '') return;
    triggerToast('Subscription active! Fare alert updates enabled.');
    setEmail('');
  };

  const whatsappUrl = "https://api.whatsapp.com/send?phone=2347066851051&text=Hello%20Alphaa.Africa%2C%0AI%27d%20like%20to%20book%3A%201.%20Flight%202.%20Hotel%203.%20Visa%20Assistance%204.Airport%20Transfer";

  return (
    <>
      <footer className="bg-[#0f0f1a] text-slate-400 py-16 px-4 sm:px-8 border-t border-white/5 mt-20 text-left">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">

          {/* Brand Profile column */}
          <div className="space-y-5">
            <div className="flex items-center space-x-2">
              <img
                src="/logo.png"
                alt="Alphaa.Africa Logo"
                className="w-10 h-10 object-contain"
              />
              <div>
                <span className="text-sm font-black tracking-tight block text-white uppercase font-sans">ALPHAA<span className="text-brand-orange">.</span>AFRICA</span>
                <span className="text-[8px] font-bold text-brand-orange block tracking-widest uppercase">Travel & Tours</span>
              </div>
            </div>
            <p className="leading-relaxed text-slate-400">
              Your trusted travel partner for seamless journeys across the globe. Experience the world with confidence and comfort.
            </p>
            {/* Social media icons */}
            <div className="flex space-x-3 mt-4">
              <a
                href="https://www.instagram.com/alphaa_africatravelandtours?igsh=dnNqY2wwbWc0b21l"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                title="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/share/1Hba4rkBpC/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                title="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8H7v4h2v12h5V12h3.642l.358-4H14V6.333C14 5.378 14.192 5 15.115 5H18V0h-3.808C10.596 0 9 1.583 9 4.615V8z" />
                </svg>
              </a>
              <a
                href="https://vm.tiktok.com/ZS9MgLjPaqucr-eZPfO/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                title="TikTok"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.92-1.88 2.63-5.22 3.61-8.15 2.77-2.93-.85-5.07-3.58-5.19-6.62-.18-4.2 3.48-7.85 7.7-7.64.71.02 1.41.17 2.08.4v4.06c-1.12-.47-2.44-.45-3.52.12-.91.49-1.54 1.46-1.63 2.51-.15 1.69 1.05 3.23 2.73 3.5 1.69.29 3.39-.73 3.79-2.4.15-.6.18-1.23.17-1.85-.01-3.95-.01-7.9-.01-11.85z" />
                </svg>
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                title="WhatsApp"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202 0 6.212 1.248 8.477 3.518 2.266 2.27 3.51 5.284 3.507 8.49-.007 6.66-5.347 11.998-11.957 11.998-1.994-.003-3.96-.502-5.713-1.458L0 24zm6.335-1.662c1.746.953 3.71 1.455 5.703 1.458h.005c5.789 0 10.501-4.707 10.505-10.495.002-2.807-1.086-5.447-3.066-7.43C17.558 3.887 14.916 2.79 12.11 2.79c-5.799 0-10.513 4.706-10.517 10.494-.002 2.061.536 4.07 1.554 5.864l-.24 1.344z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-4">
            <h4 className="font-extrabold text-white uppercase tracking-wider text-sm font-sans">Quick Links</h4>
            <ul className="space-y-2.5 text-slate-400 ">
              <li>
                <button onClick={() => router.push('/')} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none text-left ">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => handleTabNav('flights')} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none text-left ">
                  Services
                </button>
              </li>
              <li>
                <button onClick={() => handleTabNav('flights')} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none text-left ">
                  Flight Deals
                </button>
              </li>
              <li>
                <button onClick={() => router.push('/packages')} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none text-left ">
                  Tour Packages
                </button>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors block ">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors block ">
                  Testimonials
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors block ">
                  Blog
                </a>
              </li>
              <li>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors block ">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Our Services Column */}
          <div className="space-y-4">
            <h4 className="font-extrabold text-white uppercase tracking-wider text-sm font-sans">Our Services</h4>
            <ul className="space-y-2.5 text-slate-400 ">
              <li>
                <button onClick={() => handleTabNav('flights')} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none text-left ">
                  Flight Booking
                </button>
              </li>
              <li>
                <button onClick={() => handleTabNav('hotels')} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none text-left ">
                  Hotel Bookings
                </button>
              </li>
              <li>
                <button onClick={() => router.push('/visa')} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none text-left ">
                  Visa Assistance
                </button>
              </li>
              <li>
                <button onClick={() => router.push('/packages')} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none text-left ">
                  Tour Packages
                </button>
              </li>
              <li>
                <button onClick={() => handleTabNav('cars')} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none text-left ">
                  Car Rentals
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-4">
            <h4 className="font-extrabold text-white uppercase tracking-wider text-sm font-sans">Newsletter</h4>
            <p className="leading-relaxed text-slate-400 ">
              Subscribe to get exclusive deals and travel updates directly to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="flex items-center space-x-2 mt-2">
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-orange"
                required
              />
              <button
                type="submit"
                className="bg-[#ff6736] hover:bg-[#ff855c] text-white px-4 py-3 rounded-xl transition-all cursor-pointer border-none flex items-center justify-center shrink-0"
              >
                <svg className="w-4 h-4 fill-current text-white transform rotate-45" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </form>
          </div>

        </div>

        {/* Bottom divider & copyright */}
        <div className="max-w-7xl mx-auto border-t border-white/5 pt-8 mt-12 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-500 ">
          <span>© {currentYear} Alphaa.Africa. All Rights Reserved.</span>
        </div>
      </footer>

      {/* Floating WhatsApp Chat Now widget */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 transition-all duration-300 flex items-center justify-center cursor-pointer group hover:-translate-y-1"
      >
        <div className="bg-[#1ebd56] group-hover:bg-[#19a34a] text-white font-black px-5 py-3 rounded-full flex items-center space-x-2 text-[10px] sm:text-xs uppercase tracking-wider transition-all duration-300 shadow-xl">
          <svg className="w-4.5 h-4.5 fill-current text-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          <span className="font-sans font-black">Chat Now</span>
        </div>
      </a>
    </>
  );
}
