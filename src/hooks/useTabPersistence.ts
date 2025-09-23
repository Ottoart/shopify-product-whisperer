import { useState, useEffect } from 'react';

export const useTabPersistence = (key: string, defaultValue: string) => {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`tab-${key}`) || defaultValue;
    }
    return defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(`tab-${key}`, activeTab);
  }, [key, activeTab]);

  return [activeTab, setActiveTab] as const;
};