import React, { createContext, useContext, useState, useEffect } from 'react';

interface AccessibilityContextType {
  highContrast: boolean;
  toggleHighContrast: () => void;
  setHighContrast: (enabled: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [highContrast, setHighContrastState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('flashx_high_contrast');
      if (saved !== null) {
        return saved === 'true';
      }
      return window.matchMedia('(prefers-contrast: more)').matches;
    } catch {
      return false;
    }
  });

  const applyHighContrast = (enabled: boolean) => {
    const root = document.documentElement;
    const body = document.body;

    if (enabled) {
      root.classList.add('high-contrast');
      body.classList.add('high-contrast');
      root.style.setProperty('--bg-base', '#000000');
      root.style.setProperty('--bg-surface', '#050505');
      root.style.setProperty('--bg-surface-elevated', '#0f0f0f');
      root.style.setProperty('--bg-surface-overlay', '#1a1a1a');
      root.style.setProperty('--accent-gold', '#FFFF00');
      root.style.setProperty('--accent-gold-hover', '#FFFF66');
      root.style.setProperty('--accent-violet', '#C084FC');
      root.style.setProperty('--accent-cyan', '#00FFFF');
      root.style.setProperty('--border-subtle', 'rgba(255, 255, 255, 0.45)');
      root.style.setProperty('--border-gold', '#FFFF00');
    } else {
      root.classList.remove('high-contrast');
      body.classList.remove('high-contrast');
      root.style.removeProperty('--bg-base');
      root.style.removeProperty('--bg-surface');
      root.style.removeProperty('--bg-surface-elevated');
      root.style.removeProperty('--bg-surface-overlay');
      root.style.removeProperty('--accent-gold');
      root.style.removeProperty('--accent-gold-hover');
      root.style.removeProperty('--accent-violet');
      root.style.removeProperty('--accent-cyan');
      root.style.removeProperty('--border-subtle');
      root.style.removeProperty('--border-gold');
    }
  };

  useEffect(() => {
    applyHighContrast(highContrast);
    try {
      localStorage.setItem('flashx_high_contrast', String(highContrast));
    } catch (e) {
      console.warn('Could not save high contrast state:', e);
    }
  }, [highContrast]);

  const toggleHighContrast = () => {
    setHighContrastState(prev => !prev);
  };

  const setHighContrast = (enabled: boolean) => {
    setHighContrastState(enabled);
  };

  return (
    <AccessibilityContext.Provider value={{ highContrast, toggleHighContrast, setHighContrast }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
