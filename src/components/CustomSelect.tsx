"use client";

import React, { useState, useEffect, useRef } from 'react';

interface CustomSelectProps {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (val: string) => void;
  icon?: React.ReactNode;
  className?: string;
}

export default function CustomSelect({
  id,
  label,
  value,
  options,
  onChange,
  icon,
  className = ''
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOpt = options.find(opt => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`custom-picker-container relative bg-purple-50/40 p-4 rounded-2xl border border-purple-100/60 hover:border-brand-orange focus-within:border-brand-orange transition-all duration-300 flex flex-col cursor-pointer select-none ${className}`}
      onClick={() => setIsOpen(prev => !prev)}
    >
      <label className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1">{label}</label>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-2">
          {icon || (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-slate-400 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
          )}
          <span className="text-brand-purple font-extrabold text-sm">{selectedOpt ? selectedOpt.label : value}</span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute top-[102%] left-0 w-full bg-white border border-purple-100 rounded-2xl shadow-xl z-50 overflow-hidden py-1.5 animate-fadeIn">
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={(e) => {
                e.stopPropagation();
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`px-4 py-2.5 text-xs font-bold transition-colors text-left hover:bg-purple-50 hover:text-brand-purple ${
                value === opt.value ? 'bg-purple-50 text-brand-purple font-black' : 'text-slate-600'
              }`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
