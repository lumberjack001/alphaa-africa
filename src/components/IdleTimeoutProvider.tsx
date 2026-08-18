"use client";

import React, { createContext, useContext } from "react";
import { useIdleTimer } from "@/hooks/useIdleTimer";
import IdleTimeoutModal from "@/components/IdleTimeoutModal";

interface IdleTimeoutContextType {
  isWarningOpen: boolean;
  secondsRemaining: number;
  extendSession: () => void;
  performLogout: () => void;
}

const IdleTimeoutContext = createContext<IdleTimeoutContextType | null>(null);

export const useIdleTimeoutContext = () => {
  const context = useContext(IdleTimeoutContext);
  if (!context) {
    throw new Error("useIdleTimeoutContext must be used within an IdleTimeoutProvider");
  }
  return context;
};

interface IdleTimeoutProviderProps {
  children: React.ReactNode;
  idleTimeMs?: number;
  warningTimeMs?: number;
}

export default function IdleTimeoutProvider({
  children,
  idleTimeMs,
  warningTimeMs,
}: IdleTimeoutProviderProps) {
  const {
    isWarningOpen,
    secondsRemaining,
    totalWarningSeconds,
    extendSession,
    performLogout,
  } = useIdleTimer({
    idleTimeMs,
    warningTimeMs,
  });

  return (
    <IdleTimeoutContext.Provider
      value={{
        isWarningOpen,
        secondsRemaining,
        extendSession,
        performLogout,
      }}
    >
      {children}
      <IdleTimeoutModal
        isOpen={isWarningOpen}
        secondsRemaining={secondsRemaining}
        totalWarningSeconds={totalWarningSeconds}
        onExtend={extendSession}
        onLogout={performLogout}
      />
    </IdleTimeoutContext.Provider>
  );
}
