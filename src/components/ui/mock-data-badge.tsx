import React from 'react';
import { Badge } from '@/components/ui/badge';

interface MockDataBadgeProps {
  children: React.ReactNode;
  type?: 'mock' | 'live';
  className?: string;
}

export const MockDataBadge = ({ children, type = 'mock', className = '' }: MockDataBadgeProps) => (
  <div className={`relative ${className}`}>
    {children}
    <Badge 
      variant="outline" 
      className={`absolute -top-2 -right-2 text-xs z-10 ${
        type === 'mock' 
          ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700' 
          : 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700'
      }`}
    >
      {type === 'mock' ? 'Mock' : 'Live'}
    </Badge>
  </div>
);

export const LiveDataBadge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <MockDataBadge type="live" className={className}>
    {children}
  </MockDataBadge>
);