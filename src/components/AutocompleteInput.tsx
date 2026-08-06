"use client";

import React, { useState, useEffect, useRef } from 'react';

interface AutocompleteInputProps {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (val: string) => void;
  onSearchAsync?: (query: string) => Promise<{ value: string; label: string }[]>;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
}

export default function AutocompleteInput({
  id,
  label,
  value,
  options,
  onChange,
  onSearchAsync,
  placeholder = 'Type to search...',
  icon,
  className = ''
}: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [asyncOptions, setAsyncOptions] = useState<{ value: string; label: string }[]>([]);
  const [isLoadingAsync, setIsLoadingAsync] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activeOptions = onSearchAsync && asyncOptions.length > 0 ? asyncOptions : options;

  // Sync searchQuery with value from parent when it changes
  useEffect(() => {
    const selectedOpt = activeOptions.find(opt => opt.value === value);
    if (selectedOpt) {
      setSearchQuery(selectedOpt.label);
    } else {
      setSearchQuery(value || '');
    }
  }, [value, activeOptions]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        const selectedOpt = activeOptions.find(opt => opt.value === value);
        if (selectedOpt) {
          setSearchQuery(selectedOpt.label);
        } else {
          setSearchQuery(value || '');
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value, options, asyncOptions]);

  const filteredOptions = onSearchAsync && asyncOptions.length > 0
    ? asyncOptions
    : (searchQuery.trim() === ''
        ? options
        : options.filter(opt =>
            opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            opt.value.toLowerCase().includes(searchQuery.toLowerCase())
          ));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    setIsOpen(true);
    onChange(val);

    if (onSearchAsync && val.trim().length >= 2) {
      setIsLoadingAsync(true);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(async () => {
        try {
          const fetched = await onSearchAsync(val);
          setAsyncOptions(fetched);
        } catch (err) {
          console.error("Async search error:", err);
        } finally {
          setIsLoadingAsync(false);
        }
      }, 300);
    }
  };

  const handleSelectOption = (opt: { value: string; label: string }) => {
    onChange(opt.value);
    setSearchQuery(opt.label);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`custom-picker-container relative bg-purple-50/40 p-4 rounded-2xl border border-purple-100/60 hover:border-brand-orange focus-within:border-brand-orange transition-all duration-300 flex flex-col cursor-pointer select-none ${className}`}
    >
      <label className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1">{label}</label>
      <div className="flex items-center justify-between w-full min-w-0">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          {icon || (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-slate-400 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
          )}
          <input
            id={id}
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="w-full min-w-0 bg-transparent border-none outline-none text-brand-purple font-extrabold text-sm p-0 focus:ring-0 focus:outline-none placeholder:text-slate-400 font-sans truncate"
          />
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2.5"
          stroke="currentColor"
          className={`w-3.5 h-3.5 text-slate-400 transition-transform cursor-pointer shrink-0 ml-1.5 ${isOpen ? 'rotate-180' : ''}`}
          onClick={() => setIsOpen(prev => !prev)}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute top-[102%] left-0 w-full bg-white border border-purple-100 rounded-2xl shadow-xl z-50 overflow-hidden py-1.5 animate-fadeIn max-h-60 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-purple-100 [&::-webkit-scrollbar-thumb]:rounded-full">
          {filteredOptions.map((opt) => (
            <div
              key={opt.value}
              onClick={() => handleSelectOption(opt)}
              className={`px-4 py-2.5 text-xs font-bold transition-colors text-left hover:bg-purple-50 hover:text-brand-purple cursor-pointer ${
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
