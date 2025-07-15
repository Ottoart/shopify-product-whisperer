import { useEffect } from 'react';

interface TableColumnResizerProps {
  tableSelector: string;
}

export function TableColumnResizer({ tableSelector }: TableColumnResizerProps) {
  useEffect(() => {
    const table = document.querySelector(tableSelector) as HTMLTableElement;
    if (!table) return;

    const makeColumnsResizable = () => {
      const headers = table.querySelectorAll('th') as NodeListOf<HTMLTableHeaderCellElement>;
      
      headers.forEach((th, index) => {
        // Skip the last column
        if (index >= headers.length - 1) return;
        
        // Remove any existing resize handles
        const existingHandle = th.querySelector('.resize-handle');
        if (existingHandle) existingHandle.remove();
        
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
    };
    
    // Initial setup
    makeColumnsResizable();
    
    // Re-setup when table content changes (using MutationObserver)
    const observer = new MutationObserver(() => {
      makeColumnsResizable();
    });
    
    observer.observe(table, { childList: true, subtree: true });
    
    return () => {
      observer.disconnect();
      // Clean up resize handles
      const handles = table.querySelectorAll('.resize-handle');
      handles.forEach(handle => handle.remove());
    };
  }, [tableSelector]);
  
  return null; // This component doesn't render anything
}