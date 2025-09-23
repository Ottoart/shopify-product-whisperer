import React, { useState, useRef, useEffect } from 'react';

interface ResizableTableProps {
  children: React.ReactNode;
  className?: string;
}

export function ResizableTable({ children, className }: ResizableTableProps) {
  const tableRef = useRef<HTMLTableElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [currentColumn, setCurrentColumn] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const table = tableRef.current;
    if (!table) return;

    // Add resize handles to table headers
    const headers = table.querySelectorAll('th');
    headers.forEach((th, index) => {
      if (index < headers.length - 1) { // Don't add handle to last column
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'absolute right-0 top-0 w-1 h-full bg-border hover:bg-primary/50 cursor-col-resize z-10';
        resizeHandle.style.userSelect = 'none';
        
        // Make the th position relative to contain the absolute handle
        th.style.position = 'relative';
        th.appendChild(resizeHandle);

        let startX: number;
        let startWidth: number;

        const handleMouseDown = (e: MouseEvent) => {
          setIsResizing(true);
          setCurrentColumn(th);
          startX = e.clientX;
          startWidth = parseInt(window.getComputedStyle(th).width, 10);
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
          e.preventDefault();
        };

        const handleMouseMove = (e: MouseEvent) => {
          if (!isResizing) return;
          const width = startWidth + e.clientX - startX;
          if (width > 50) { // Minimum width
            th.style.width = width + 'px';
            th.style.minWidth = width + 'px';
            th.style.maxWidth = width + 'px';
          }
        };

        const handleMouseUp = () => {
          setIsResizing(false);
          setCurrentColumn(null);
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };

        resizeHandle.addEventListener('mousedown', handleMouseDown);
      }
    });

    return () => {
      // Cleanup event listeners
      const handles = table.querySelectorAll('.cursor-col-resize');
      handles.forEach(handle => {
        handle.remove();
      });
    };
  }, []);

  return (
    <table ref={tableRef} className={className}>
      {children}
    </table>
  );
}