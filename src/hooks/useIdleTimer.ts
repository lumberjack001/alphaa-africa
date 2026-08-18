"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken, clearTokens, clearStoredUser } from "@/lib/api";

const LAST_ACTIVITY_KEY = "alphaa_last_activity";

// Defaults: 14 minutes idle before warning, 60 seconds warning countdown (Total 15 minutes)
const DEFAULT_IDLE_TIME_MS = 14 * 60 * 1000; 
const DEFAULT_WARNING_TIME_MS = 60 * 1000;

interface UseIdleTimerOptions {
  idleTimeMs?: number;
  warningTimeMs?: number;
  onLogout?: () => void;
}

export function useIdleTimer({
  idleTimeMs = DEFAULT_IDLE_TIME_MS,
  warningTimeMs = DEFAULT_WARNING_TIME_MS,
  onLogout,
}: UseIdleTimerOptions = {}) {
  const router = useRouter();
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(Math.ceil(warningTimeMs / 1000));
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const lastActivityRef = useRef<number>(Date.now());
  const logoutHandledRef = useRef<boolean>(false);

  // Check login state on mount & storage updates
  const checkLoginStatus = useCallback(() => {
    const hasToken = Boolean(getAccessToken());
    setIsLoggedIn(hasToken);
    return hasToken;
  }, []);

  const updateLastActivity = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
      } catch (e) {
        // localStorage might be unavailable or full
      }
    }
  }, []);

  const performLogout = useCallback(() => {
    if (logoutHandledRef.current) return;
    logoutHandledRef.current = true;

    clearTokens();
    clearStoredUser();
    setIsWarningOpen(false);
    setIsLoggedIn(false);

    if (onLogout) {
      onLogout();
    } else {
      router.push("/login?expired=true");
    }
  }, [onLogout, router]);

  const extendSession = useCallback(() => {
    logoutHandledRef.current = false;
    updateLastActivity();
    setIsWarningOpen(false);
    setSecondsRemaining(Math.ceil(warningTimeMs / 1000));
  }, [updateLastActivity, warningTimeMs]);

  useEffect(() => {
    const loggedIn = checkLoginStatus();
    if (!loggedIn) return;

    // Initialize activity timestamp if missing
    const storedActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
    if (storedActivity) {
      lastActivityRef.current = parseInt(storedActivity, 10) || Date.now();
    } else {
      updateLastActivity();
    }

    // Throttled activity event handler
    let throttleTimeout: NodeJS.Timeout | null = null;
    const handleUserActivity = () => {
      // Don't update activity if warning modal is active (user must click extend button)
      if (isWarningOpen) return;

      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          updateLastActivity();
          throttleTimeout = null;
        }, 2000); // Throttle activity updates to once every 2 seconds
      }
    };

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }));

    // Listen for activity from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LAST_ACTIVITY_KEY && e.newValue) {
        const remoteTime = parseInt(e.newValue, 10);
        if (!isNaN(remoteTime)) {
          lastActivityRef.current = remoteTime;
          setIsWarningOpen(false);
          logoutHandledRef.current = false;
        }
      }
      if (e.key === "alphaa_access_token") {
        checkLoginStatus();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // Interval checker loop
    const totalTimeoutMs = idleTimeMs + warningTimeMs;
    const interval = setInterval(() => {
      if (!getAccessToken()) {
        setIsLoggedIn(false);
        setIsWarningOpen(false);
        return;
      }

      const now = Date.now();
      const elapsed = now - lastActivityRef.current;

      if (elapsed >= totalTimeoutMs) {
        performLogout();
      } else if (elapsed >= idleTimeMs) {
        const remainingMs = totalTimeoutMs - elapsed;
        const seconds = Math.max(0, Math.ceil(remainingMs / 1000));
        setSecondsRemaining(seconds);
        setIsWarningOpen(true);
      } else {
        if (isWarningOpen) {
          setIsWarningOpen(false);
        }
      }
    }, 1000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
      window.removeEventListener("storage", handleStorageChange);
      if (throttleTimeout) clearTimeout(throttleTimeout);
      clearInterval(interval);
    };
  }, [checkLoginStatus, idleTimeMs, isWarningOpen, performLogout, updateLastActivity, warningTimeMs]);

  return {
    isLoggedIn,
    isWarningOpen,
    secondsRemaining,
    totalWarningSeconds: Math.ceil(warningTimeMs / 1000),
    extendSession,
    performLogout,
  };
}
