import { useEffect, useState, useCallback } from 'react';

interface AccessibilityPreferences {
  reduceMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
}

interface UseAccessibilityReturn {
  preferences: AccessibilityPreferences;
  updatePreference: (key: keyof AccessibilityPreferences, value: boolean) => void;
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
  focusElement: (element: HTMLElement | null) => void;
  trapFocus: (container: HTMLElement) => () => void;
}

export const useAccessibility = (): UseAccessibilityReturn => {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    reduceMotion: false,
    highContrast: false,
    largeText: false,
    screenReader: false
  });

  // Check system preferences on mount
  useEffect(() => {
    const checkSystemPreferences = () => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const highContrast = window.matchMedia('(prefers-contrast: high)').matches;
      
      // Detect screen reader
      const screenReader = 
        navigator.userAgent.includes('NVDA') ||
        navigator.userAgent.includes('JAWS') ||
        navigator.userAgent.includes('VoiceOver') ||
        !!document.querySelector('[aria-live]');

      setPreferences(prev => ({
        ...prev,
        reduceMotion,
        highContrast,
        screenReader
      }));

      // Apply CSS custom properties
      document.documentElement.style.setProperty(
        '--animation-duration', 
        reduceMotion ? '0ms' : '300ms'
      );
      
      if (highContrast) {
        document.documentElement.classList.add('high-contrast');
      }
    };

    checkSystemPreferences();

    // Listen for changes in system preferences
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    
    motionQuery.addEventListener('change', checkSystemPreferences);
    contrastQuery.addEventListener('change', checkSystemPreferences);

    return () => {
      motionQuery.removeEventListener('change', checkSystemPreferences);
      contrastQuery.removeEventListener('change', checkSystemPreferences);
    };
  }, []);

  // Update individual preferences
  const updatePreference = useCallback((key: keyof AccessibilityPreferences, value: boolean) => {
    setPreferences(prev => {
      const newPreferences = { ...prev, [key]: value };
      
      // Apply changes to DOM
      switch (key) {
        case 'reduceMotion':
          document.documentElement.style.setProperty(
            '--animation-duration', 
            value ? '0ms' : '300ms'
          );
          break;
        case 'highContrast':
          document.documentElement.classList.toggle('high-contrast', value);
          break;
        case 'largeText':
          document.documentElement.classList.toggle('large-text', value);
          break;
      }
      
      // Save to localStorage
      localStorage.setItem('accessibility-preferences', JSON.stringify(newPreferences));
      
      return newPreferences;
    });
  }, []);

  // Load saved preferences
  useEffect(() => {
    const saved = localStorage.getItem('accessibility-preferences');
    if (saved) {
      try {
        const parsedPreferences = JSON.parse(saved);
        setPreferences(prev => ({ ...prev, ...parsedPreferences }));
      } catch (error) {
        console.warn('Failed to parse saved accessibility preferences');
      }
    }
  }, []);

  // Screen reader announcements
  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    // Create or get existing announcement element
    let announcer = document.getElementById('sr-announcer') as HTMLElement;
    
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'sr-announcer';
      announcer.setAttribute('aria-live', priority);
      announcer.setAttribute('aria-atomic', 'true');
      announcer.style.position = 'absolute';
      announcer.style.left = '-10000px';
      announcer.style.width = '1px';
      announcer.style.height = '1px';
      announcer.style.overflow = 'hidden';
      document.body.appendChild(announcer);
    } else {
      announcer.setAttribute('aria-live', priority);
    }
    
    // Clear previous message and add new one
    announcer.textContent = '';
    setTimeout(() => {
      announcer.textContent = message;
    }, 100);
  }, []);

  // Focus management
  const focusElement = useCallback((element: HTMLElement | null) => {
    if (!element) return;
    
    // Ensure element is focusable
    if (!element.hasAttribute('tabindex') && !element.matches('button, input, select, textarea, a[href]')) {
      element.setAttribute('tabindex', '-1');
    }
    
    element.focus();
    
    // Announce focus change to screen readers
    const label = element.getAttribute('aria-label') || 
                  element.getAttribute('title') || 
                  element.textContent?.trim() || 
                  'Element focused';
    
    if (preferences.screenReader) {
      announceToScreenReader(`Focused: ${label}`);
    }
  }, [preferences.screenReader, announceToScreenReader]);

  // Focus trap for modals and dropdowns
  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };
    
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Find close button or container and trigger close
        const closeButton = container.querySelector('[aria-label="Close"], [data-close]') as HTMLElement;
        if (closeButton) {
          closeButton.click();
        }
      }
    };
    
    container.addEventListener('keydown', handleTabKey);
    container.addEventListener('keydown', handleEscapeKey);
    
    // Focus first element
    if (firstElement) {
      firstElement.focus();
    }
    
    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTabKey);
      container.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  return {
    preferences,
    updatePreference,
    announceToScreenReader,
    focusElement,
    trapFocus
  };
};