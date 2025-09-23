import { useEffect, useRef } from 'react';

interface TableColumnResizerProps {
  tableSelector: string;
}

export function TableColumnResizer({ tableSelector }: TableColumnResizerProps) {
  const setupInProgress = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const table = document.querySelector(tableSelector) as HTMLTableElement;
    if (!table) return;

    const makeColumnsResizable = () => {
      // Prevent recursive calls
      if (setupInProgress.current) return;
      setupInProgress.current = true;

      try {
        const headers = table.querySelectorAll('th') as NodeListOf<HTMLTableHeaderCellElement>;
        
        headers.forEach((th, index) => {
          // Skip the last column
          if (index >= headers.length - 1) return;
          
          // Skip if already has a resize handle
          if (th.querySelector('.resize-handle')) return;
          
          // Create resize handle
          const resizeHandle = document.createElement('div');
          resizeHandle.className = 'resize-handle absolute right-0 top-0 w-1 h-full bg-transparent hover:bg-blue-500 cursor-col-resize z-10 transition-colors';
          resizeHandle.style.userSelect = 'none';
          
          // Ensure th has relative positioning
          th.style.position = 'relative';
          th.appendChild(resizeHandle);
          
          let startX = 0;
          let startWidth = 0;
          let isResizing = false;
          
          const onMouseDown = (e: MouseEvent) => {
            isResizing = true;
            startX = e.clientX;
            startWidth = th.offsetWidth;
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            
            e.preventDefault();
            e.stopPropagation();
          };
          
          const onMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;
            
            const diff = e.clientX - startX;
            const newWidth = Math.max(50, startWidth + diff); // Min width of 50px
            
            th.style.width = `${newWidth}px`;
            th.style.minWidth = `${newWidth}px`;
            th.style.maxWidth = `${newWidth}px`;
          };
          
          const onMouseUp = () => {
            isResizing = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
          };
          
          resizeHandle.addEventListener('mousedown', onMouseDown);
        });
      } finally {
        setupInProgress.current = false;
      }
    };
    
    // Debounced setup function to prevent rapid calls
    const debouncedSetup = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        makeColumnsResizable();
      }, 100);
    };
    
    // Initial setup
    makeColumnsResizable();
    
    // Only observe specific changes that might affect table structure
    const observer = new MutationObserver((mutations) => {
      const hasStructuralChanges = mutations.some(mutation => 
        mutation.type === 'childList' && 
        mutation.target.nodeName === 'TBODY' ||
        mutation.target.nodeName === 'THEAD'
      );
      
      if (hasStructuralChanges && !setupInProgress.current) {
        debouncedSetup();
      }
    });
    
    observer.observe(table, { 
      childList: true, 
      subtree: false // Only observe direct children, not deep subtree
    });
    
    return () => {
      observer.disconnect();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Clean up resize handles and event listeners
      const handles = table.querySelectorAll('.resize-handle');
      handles.forEach(handle => {
        handle.removeEventListener('mousedown', () => {});
        handle.remove();
      });
      setupInProgress.current = false;
    };
  }, [tableSelector]);
  
  return null; // This component doesn't render anything
}