"use client";

import React, { useEffect } from "react";

interface IdleTimeoutModalProps {
  isOpen: boolean;
  secondsRemaining: number;
  totalWarningSeconds: number;
  onExtend: () => void;
  onLogout: () => void;
}

export default function IdleTimeoutModal({
  isOpen,
  secondsRemaining,
  totalWarningSeconds,
  onExtend,
  onLogout,
}: IdleTimeoutModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Prevent body scrolling when modal is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const percentage = Math.max(0, Math.min(100, (secondsRemaining / totalWarningSeconds) * 100));
  const isUrgent = secondsRemaining <= 15;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-opacity duration-300 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="idle-modal-title"
    >
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 transform transition-all duration-300 scale-100">
        {/* Top Accent Gradient Header */}
        <div className={`h-2.5 w-full transition-colors duration-500 ${isUrgent ? "bg-red-500 animate-pulse" : "bg-gradient-to-r from-orange-500 to-amber-500"}`} />

        <div className="p-6 md:p-8 text-center space-y-5">
          {/* Icon Badge */}
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-orange-50 border border-orange-100 shadow-inner">
            <span className="text-3xl animate-bounce">⏳</span>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <h3 id="idle-modal-title" className="text-2xl font-bold text-gray-900 tracking-tight">
              Are you still there?
            </h3>
            <p className="text-sm text-gray-500">
              For your account security, your session will expire due to inactivity.
            </p>
          </div>

          {/* Countdown Display */}
          <div className="py-3 px-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <span>Time Remaining</span>
              <span className={`text-sm font-extrabold font-mono ${isUrgent ? "text-red-600 animate-pulse" : "text-orange-600"}`}>
                {secondsRemaining}s
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ease-linear ${
                  isUrgent ? "bg-red-500" : "bg-gradient-to-r from-orange-500 to-amber-500"
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onExtend}
              className="w-full sm:flex-1 py-3 px-5 text-sm font-semibold text-white bg-gradient-to-r from-[#FA6432] to-orange-600 hover:from-orange-600 hover:to-orange-700 active:scale-[0.98] rounded-xl shadow-lg shadow-orange-500/25 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              Extend Session
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="w-full sm:w-auto py-3 px-5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 active:scale-[0.98] rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
