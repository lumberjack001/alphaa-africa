"use client";

import React from 'react';

interface ToastProps {
  message: string;
  visible: boolean;
}

export default function Toast({ message, visible }: ToastProps) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 max-w-sm bg-gradient-to-r from-[#4C1D5C] to-[#361342] text-white p-4 rounded-2xl shadow-2xl border border-purple-500/20 transform transition-all duration-500 ease-out flex items-start space-x-3 pointer-events-none ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'
      }`}
    >
      <div className="bg-brand-orange text-white p-2.5 rounded-xl text-lg shadow-md shadow-[#FA6432]/30">⚡</div>
      <div>
        <h4 className="font-extrabold text-xs uppercase tracking-wider text-brand-orange font-sans">Alphaa Gateways Sync</h4>
        <p className="text-xs text-purple-100 font-medium leading-relaxed mt-1">
          {message || 'GDS pipeline is online and secure.'}
        </p>
      </div>
    </div>
  );
}
