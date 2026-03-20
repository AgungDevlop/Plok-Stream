import { createContext, useContext, useState, ReactNode } from 'react';

interface LayoutContextType {
  showSearch: boolean;
  setShowSearch: (show: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
  const [showSearch, setShowSearch] = useState(false);
  return (
    <LayoutContext.Provider value={{ showSearch, setShowSearch }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};