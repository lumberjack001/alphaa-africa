"use client";

import React, { useState, useEffect, useRef } from 'react';

interface TravellersSelectProps {
  adultsCount: number;
  setAdultsCount: React.Dispatch<React.SetStateAction<number>>;
  childrenCount: number;
  setChildrenCount: React.Dispatch<React.SetStateAction<number>>;
  infantsCount: number;
  setInfantsCount: React.Dispatch<React.SetStateAction<number>>;
  className?: string;
}

export default function TravellersSelect({
  adultsCount,
  setAdultsCount,
  childrenCount,
  setChildrenCount,
  infantsCount,
  setInfantsCount,
  className = ''
}: TravellersSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTravellersSummary = () => {
    const total = adultsCount + childrenCount + infantsCount;
    if (total === 1 && adultsCount === 1) return '1 Adult';
    const parts: string[] = [];
    if (adultsCount > 0) parts.push(`${adultsCount} Adult${adultsCount > 1 ? 's' : ''}`);
    if (childrenCount > 0) parts.push(`${childrenCount} Child${childrenCount > 1 ? 'ren' : ''}`);
    if (infantsCount > 0) parts.push(`${infantsCount} Infant${infantsCount > 1 ? 's' : ''}`);
    return parts.join(', ');
  };

  return (
    <div
      ref={containerRef}
      className={`custom-picker-container relative bg-purple-50/40 p-4 rounded-2xl border border-purple-100/60 hover:border-brand-orange focus-within:border-brand-orange transition-all duration-300 flex flex-col cursor-pointer select-none ${className}`}
      onClick={() => setIsOpen(prev => !prev)}
    >
      <label className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1">TRAVELLERS</label>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-slate-400 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
          <span className="text-brand-purple font-extrabold text-sm">{getTravellersSummary()}</span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </div>

      {isOpen && (
        <div
          className="absolute top-[102%] right-0 w-72 bg-white border border-purple-100 rounded-3xl shadow-2xl z-50 p-5 space-y-4 cursor-default animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Adults Row */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col text-left">
              <span className="text-xs font-extrabold text-slate-700">Adults</span>
              <span className="text-[9px] text-slate-400 font-bold">12+ years</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setAdultsCount(prev => Math.max(1, prev - 1))}
                className="w-8 h-8 rounded-full border border-purple-100 flex items-center justify-center text-slate-500 hover:border-brand-orange hover:text-brand-orange font-bold cursor-pointer transition-colors"
              >
                -
              </button>
              <span className="text-xs font-black text-slate-700 w-4 text-center">{adultsCount}</span>
              <button
                type="button"
                onClick={() => setAdultsCount(prev => Math.min(prev + 1, 9 - childrenCount - infantsCount))}
                className="w-8 h-8 rounded-full border border-purple-100 flex items-center justify-center text-slate-500 hover:border-brand-orange hover:text-brand-orange font-bold cursor-pointer transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Children Row */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col text-left">
              <span className="text-xs font-extrabold text-slate-700">Children</span>
              <span className="text-[9px] text-slate-400 font-bold">2-11 years</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setChildrenCount(prev => Math.max(0, prev - 1))}
                className="w-8 h-8 rounded-full border border-purple-100 flex items-center justify-center text-slate-500 hover:border-brand-orange hover:text-brand-orange font-bold cursor-pointer transition-colors"
              >
                -
              </button>
              <span className="text-xs font-black text-slate-700 w-4 text-center">{childrenCount}</span>
              <button
                type="button"
                onClick={() => setChildrenCount(prev => Math.min(prev + 1, 9 - adultsCount - infantsCount))}
                className="w-8 h-8 rounded-full border border-purple-100 flex items-center justify-center text-slate-500 hover:border-brand-orange hover:text-brand-orange font-bold cursor-pointer transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Infants Row */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col text-left">
              <span className="text-xs font-extrabold text-slate-700">Infants</span>
              <span className="text-[9px] text-slate-400 font-bold">Under 2</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setInfantsCount(prev => Math.max(0, prev - 1))}
                className="w-8 h-8 rounded-full border border-purple-100 flex items-center justify-center text-slate-500 hover:border-brand-orange hover:text-brand-orange font-bold cursor-pointer transition-colors"
              >
                -
              </button>
              <span className="text-xs font-black text-slate-700 w-4 text-center">{infantsCount}</span>
              <button
                type="button"
                onClick={() => setInfantsCount(prev => Math.min(prev + 1, Math.min(adultsCount, 9 - adultsCount - childrenCount)))}
                className="w-8 h-8 rounded-full border border-purple-100 flex items-center justify-center text-slate-500 hover:border-brand-orange hover:text-brand-orange font-bold cursor-pointer transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Done Button */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full bg-brand-purple hover:bg-brand-purple/95 text-white font-extrabold text-xs py-3 rounded-2xl uppercase tracking-wider transition-colors cursor-pointer mt-2"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
