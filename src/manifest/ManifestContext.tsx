import React, { createContext, useState, ReactNode } from "react";
import { ManifestManager } from "./ManifestManager";

export const ManifestContext = createContext<ManifestManager | null>(null);

interface ManifestProviderProps {
  children: ReactNode;
}

export function ManifestProvider({ children }: ManifestProviderProps) {
  const [manager] = useState(() => new ManifestManager());

  // Cleanup manager when component unmounts
  React.useEffect(() => {
    return () => {
      manager.cleanup();
    };
  }, [manager]);

  return (
    <ManifestContext.Provider value={manager}>
      {children}
    </ManifestContext.Provider>
  );
}
