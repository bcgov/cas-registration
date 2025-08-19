"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type BreadcrumbContextValue = {
  lastTitle: string | null;
  setLastTitle: (title: string | null) => void;
};

const BreadcrumbContext = createContext<BreadcrumbContextValue | undefined>(
  undefined,
);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [lastTitle, setLastTitle] = useState<string | null>(null);

  const value: BreadcrumbContextValue = {
    lastTitle,
    setLastTitle,
  };

  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumb() {
  const ctx = useContext(BreadcrumbContext);
  if (!ctx) {
    throw new Error("useBreadcrumb must be used within BreadcrumbProvider");
  }
  return ctx;
}
