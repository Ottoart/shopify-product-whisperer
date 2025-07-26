import { useState, useEffect } from 'react';

interface ColumnWidths {
  [key: string]: number;
}

export const useColumnPersistence = (tableKey: string, defaultWidths: ColumnWidths = {}) => {
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`column-widths-${tableKey}`);
      return saved ? { ...defaultWidths, ...JSON.parse(saved) } : defaultWidths;
    }
    return defaultWidths;
  });

  useEffect(() => {
    localStorage.setItem(`column-widths-${tableKey}`, JSON.stringify(columnWidths));
  }, [tableKey, columnWidths]);

  const updateColumnWidth = (columnId: string, width: number) => {
    setColumnWidths(prev => ({
      ...prev,
      [columnId]: width
    }));
  };

  const getColumnStyle = (columnId: string) => {
    const width = columnWidths[columnId];
    return width ? {
      width: `${width}px`,
      minWidth: `${width}px`,
      maxWidth: `${width}px`
    } : undefined;
  };

  return {
    columnWidths,
    updateColumnWidth,
    getColumnStyle
  };
};