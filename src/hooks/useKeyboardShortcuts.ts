import { useEffect, useCallback, useRef } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
  category?: string;
}

interface UseKeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
  preventDefault?: boolean;
}

export const useKeyboardShortcuts = ({
  shortcuts,
  enabled = true,
  preventDefault = true
}: UseKeyboardShortcutsProps) => {
  const shortcutsRef = useRef(shortcuts);
  
  // Update shortcuts ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Don't trigger shortcuts when user is typing in an input
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return;
    }

    const matchingShortcut = shortcutsRef.current.find(shortcut => {
      return (
        shortcut.key.toLowerCase() === event.key.toLowerCase() &&
        !!shortcut.ctrlKey === event.ctrlKey &&
        !!shortcut.shiftKey === event.shiftKey &&
        !!shortcut.altKey === event.altKey
      );
    });

    if (matchingShortcut) {
      if (preventDefault) {
        event.preventDefault();
        event.stopPropagation();
      }
      matchingShortcut.action();
    }
  }, [enabled, preventDefault]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, enabled]);

  return {
    shortcuts: shortcutsRef.current
  };
};

// Predefined shortcut configurations for ProductWhisper
export const useProductWhisperShortcuts = ({
  onNewProduct,
  onSave,
  onSearch,
  onBulkSelect,
  onAIOptimize,
  onExport,
  onImport,
  onHelp
}: {
  onNewProduct?: () => void;
  onSave?: () => void;
  onSearch?: () => void;
  onBulkSelect?: () => void;
  onAIOptimize?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onHelp?: () => void;
}) => {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'n',
      ctrlKey: true,
      action: onNewProduct || (() => {}),
      description: 'Create new product',
      category: 'Product Actions'
    },
    {
      key: 's',
      ctrlKey: true,
      action: onSave || (() => {}),
      description: 'Save current product',
      category: 'Product Actions'
    },
    {
      key: 'f',
      ctrlKey: true,
      action: onSearch || (() => {}),
      description: 'Focus search',
      category: 'Navigation'
    },
    {
      key: 'b',
      ctrlKey: true,
      action: onBulkSelect || (() => {}),
      description: 'Toggle bulk select',
      category: 'Selection'
    },
    {
      key: 'a',
      ctrlKey: true,
      shiftKey: true,
      action: onAIOptimize || (() => {}),
      description: 'AI optimize selected',
      category: 'AI Features'
    },
    {
      key: 'e',
      ctrlKey: true,
      action: onExport || (() => {}),
      description: 'Export products',
      category: 'Data Management'
    },
    {
      key: 'i',
      ctrlKey: true,
      action: onImport || (() => {}),
      description: 'Import products',
      category: 'Data Management'
    },
    {
      key: '?',
      shiftKey: true,
      action: onHelp || (() => {}),
      description: 'Show keyboard shortcuts',
      category: 'Help'
    }
  ];

  return useKeyboardShortcuts({ shortcuts });
};