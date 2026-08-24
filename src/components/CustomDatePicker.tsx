"use client";

import React, { useState, useEffect, useRef } from 'react';

interface CustomDatePickerProps {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  className?: string;
  alignRight?: boolean;
  minDate?: string;
  startDate?: string;
}

export default function CustomDatePicker({
  id,
  label,
  value,
  onChange,
  className = '',
  alignRight = false,
  minDate,
  startDate
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const formatDateIso = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayIso = formatDateIso(new Date());
  const effectiveMinDate = minDate || todayIso;
  const activeStartDate = startDate || (minDate && minDate !== todayIso ? minDate : undefined);

  const getMinYearMonth = (minStr: string) => {
    if (!minStr) return null;
    const parts = minStr.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      if (!isNaN(y) && !isNaN(m)) return { year: y, month: m };
    }
    return null;
  };

  // Initialize month/year from value or minDate
  const initialDate = new Date(value || new Date());
  const [calMonth, setCalMonth] = useState(
    isNaN(initialDate.getTime()) ? new Date().getMonth() : initialDate.getMonth()
  );
  const [calYear, setCalYear] = useState(
    isNaN(initialDate.getTime()) ? new Date().getFullYear() : initialDate.getFullYear()
  );

  // Sync state if picker is opened with a new value or minDate
  useEffect(() => {
    if (isOpen) {
      const d = new Date(value || new Date());
      let m = !isNaN(d.getTime()) ? d.getMonth() : new Date().getMonth();
      let y = !isNaN(d.getTime()) ? d.getFullYear() : new Date().getFullYear();

      if (effectiveMinDate) {
        const minYM = getMinYearMonth(effectiveMinDate);
        if (minYM) {
          if (y < minYM.year || (y === minYM.year && m < minYM.month)) {
            y = minYM.year;
            m = minYM.month;
          }
        }
      }

      setCalMonth(m);
      setCalYear(y);
    }
  }, [isOpen, value, effectiveMinDate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDateFriendly = (dateStr: string) => {
    if (!dateStr) return 'Select date';
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) return dateStr;
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1);
    const days = [];
    const firstDayOfWeek = date.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const formattedDate = formatDateFriendly(value);
  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const minYM = getMinYearMonth(effectiveMinDate);
  const isPrevMonthDisabled = minYM
    ? calYear < minYM.year || (calYear === minYM.year && calMonth <= minYM.month)
    : false;

  return (
    <div
      ref={containerRef}
      className={`custom-picker-container relative bg-purple-50/40 p-4 rounded-2xl border border-purple-100/60 hover:border-brand-orange focus-within:border-brand-orange transition-all duration-300 flex flex-col cursor-pointer select-none text-left ${className}`}
      onClick={() => setIsOpen(prev => !prev)}
    >
      <label className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1">{label}</label>
      <div className="flex items-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-slate-400 shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
        </svg>
        <span className="text-brand-purple font-extrabold text-sm">{formattedDate}</span>
      </div>

      {isOpen && (
        <div
          className={`absolute top-[102%] w-72 bg-white border border-purple-100 rounded-3xl shadow-2xl z-50 p-5 cursor-default animate-fadeIn left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 ${
            alignRight ? 'sm:right-0' : 'sm:left-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Month/Year selector header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              disabled={isPrevMonthDisabled}
              onClick={() => {
                if (isPrevMonthDisabled) return;
                if (calMonth === 0) {
                  setCalMonth(11);
                  setCalYear(prev => prev - 1);
                } else {
                  setCalMonth(prev => prev - 1);
                }
              }}
              className={`w-7 h-7 rounded-full border flex items-center justify-center font-bold transition-colors ${
                isPrevMonthDisabled
                  ? 'border-purple-50 text-slate-200 cursor-not-allowed opacity-40'
                  : 'border-purple-100 text-slate-500 hover:border-brand-orange hover:text-brand-orange cursor-pointer'
              }`}
            >
              &larr;
            </button>
            <span className="text-xs font-black text-brand-purple">
              {monthNames[calMonth]} {calYear}
            </span>
            <button
              type="button"
              onClick={() => {
                if (calMonth === 11) {
                  setCalMonth(0);
                  setCalYear(prev => prev + 1);
                } else {
                  setCalMonth(prev => prev + 1);
                }
              }}
              className="w-7 h-7 rounded-full border border-purple-100 flex items-center justify-center text-slate-500 hover:border-brand-orange hover:text-brand-orange font-bold cursor-pointer transition-colors"
            >
              &rarr;
            </button>
          </div>

          {/* Days Grid */}
          <div
            className="grid grid-cols-7 gap-y-2 text-center"
            onMouseLeave={() => setHoverDate(null)}
          >
            {dayNames.map(name => (
              <span key={name} className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                {name}
              </span>
            ))}

            {daysInMonth.map((dayDate, dIdx) => {
              if (!dayDate) {
                return <div key={`empty-${dIdx}`} />;
              }
              const dayNum = dayDate.getDate();
              const dateStr = formatDateIso(dayDate);
              const isSelected = dateStr === value;
              const isPast = effectiveMinDate ? dateStr < effectiveMinDate : false;

              const isStartDate = activeStartDate ? dateStr === activeStartDate : false;
              const activeEnd = value || hoverDate;
              const hasValidRange = !!(activeStartDate && activeEnd && activeEnd > activeStartDate);
              const isInRange = hasValidRange && dateStr > activeStartDate && dateStr < activeEnd!;
              const isEndRange = hasValidRange && dateStr === activeEnd;

              let styleClasses = '';
              if (isPast) {
                styleClasses = 'text-slate-300 opacity-40 cursor-not-allowed line-through rounded-full';
              } else if (isStartDate) {
                styleClasses = hasValidRange
                  ? 'bg-brand-purple text-white font-extrabold rounded-l-full rounded-r-none border border-brand-purple shadow-sm'
                  : 'bg-brand-purple text-white font-extrabold rounded-full shadow-md';
              } else if (isEndRange) {
                styleClasses = 'bg-brand-purple text-white font-extrabold rounded-r-full rounded-l-none border border-brand-purple shadow-sm';
              } else if (isInRange) {
                styleClasses = 'bg-purple-100 text-brand-purple font-bold rounded-none';
              } else if (isSelected) {
                styleClasses = 'bg-brand-purple text-white shadow-md shadow-[#4C1D5C]/20 border border-brand-purple/20 rounded-full';
              } else {
                styleClasses = 'text-slate-700 hover:bg-purple-50 hover:text-brand-purple cursor-pointer rounded-full';
              }

              return (
                <button
                  key={dateStr}
                  type="button"
                  disabled={isPast}
                  onMouseEnter={() => {
                    if (!isPast) setHoverDate(dateStr);
                  }}
                  onClick={() => {
                    if (isPast) return;
                    onChange(dateStr);
                    setIsOpen(false);
                  }}
                  className={`w-7 h-7 mx-auto text-xs font-bold transition-all flex items-center justify-center ${styleClasses}`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
