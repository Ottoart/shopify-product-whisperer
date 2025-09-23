import React from 'react';

interface MockDataBadgeProps {
  children: React.ReactNode;
  type?: 'mock' | 'live';
  className?: string;
}

export const MockDataBadge = ({ children, type = 'mock', className = '' }: MockDataBadgeProps) => (
  <div className={`relative ${className}`}>
    {children}
    <div 
      className={`absolute -top-1 -right-1 w-3 h-3 rounded-full z-10 shadow-sm border-2 border-background ${
        type === 'mock' 
          ? 'bg-amber-400 dark:bg-amber-500' 
          : 'bg-green-400 dark:bg-green-500'
      }`}
    />
  </div>
);

export const LiveDataBadge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <MockDataBadge type="live" className={className}>
    {children}
  </MockDataBadge>
);