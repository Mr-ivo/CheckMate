"use client";

import React, { useEffect, useState } from 'react';
import { Settings, ZoomIn, ZoomOut, Highlighter, Mouse, Keyboard } from 'lucide-react';

// Accessibility component that enhances the application with accessibility features
const Accessibility = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    highContrast: false,
    largeText: false,
    focusIndicators: false,
    reducedMotion: false,
    keyboardShortcuts: true
  });

  // Toggle accessibility panel
  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  // Update a specific setting
  const updateSetting = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  // Apply accessibility settings to the document
  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('accessibilitySettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save and apply settings when they change
  useEffect(() => {
    // Save settings to localStorage
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
    
    // Apply high contrast mode
    if (settings.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    
    // Apply large text
    if (settings.largeText) {
      document.documentElement.classList.add('large-text');
    } else {
      document.documentElement.classList.remove('large-text');
    }
    
    // Apply focus indicators
    if (settings.focusIndicators) {
      document.documentElement.classList.add('focus-visible');
    } else {
      document.documentElement.classList.remove('focus-visible');
    }
    
    // Apply reduced motion
    if (settings.reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
  }, [settings]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const panel = document.getElementById('accessibility-panel');
      const button = document.getElementById('accessibility-button');
      
      if (
        panel &&
        !panel.contains(event.target) &&
        button &&
        !button.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!settings.keyboardShortcuts) return;
      
      // Alt + A to toggle accessibility panel
      if (event.altKey && event.key === 'a') {
        togglePanel();
      }
      
      // Ctrl + Alt + H for high contrast
      if (event.ctrlKey && event.altKey && event.key === 'h') {
        updateSetting('highContrast', !settings.highContrast);
      }
      
      // Ctrl + Alt + T for large text
      if (event.ctrlKey && event.altKey && event.key === 't') {
        updateSetting('largeText', !settings.largeText);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [settings]);

  return (
    <>
      {/* Accessibility CSS */}
      <style jsx global>{`
        .high-contrast {
          --bg-primary: #000000;
          --text-primary: #ffffff;
          --bg-secondary: #1a1a1a;
          --text-secondary: #ffffff;
          --accent-color: #ffff00;
          --border-color: #ffffff;
        }
        
        .large-text {
          font-size: 120%;
          line-height: 1.5;
        }
        
        .focus-visible :focus {
          outline: 3px solid #2563eb !important;
          outline-offset: 2px;
        }
        
        .reduced-motion * {
          transition: none !important;
          animation: none !important;
        }
        
        /* Skip to content link */
        .skip-link {
          position: absolute;
          top: -40px;
          left: 0;
          background: #2563eb;
          color: white;
          padding: 8px;
          z-index: 100;
        }
        
        .skip-link:focus {
          top: 0;
        }
      `}</style>

      {/* Skip to content link */}
      <a href="#main-content" className="skip-link">Skip to content</a>
      
      {/* Accessibility button */}
      <button
        id="accessibility-button"
        onClick={togglePanel}
        aria-expanded={isOpen}
        aria-label="Accessibility options"
        className="fixed bottom-4 right-4 bg-emerald-600 text-white p-3 rounded-full shadow-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 z-50"
      >
        <Settings size={24} />
      </button>
      
      {/* Accessibility panel */}
      {isOpen && (
        <div
          id="accessibility-panel"
          className="fixed bottom-20 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-80 z-50"
          role="dialog"
          aria-labelledby="a11y-title"
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 id="a11y-title" className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Settings size={18} className="mr-2" />
              Accessibility Settings
            </h2>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Highlighter size={18} className="mr-2 text-gray-700 dark:text-gray-300" />
                <label htmlFor="high-contrast" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  High Contrast
                </label>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="high-contrast"
                  checked={settings.highContrast}
                  onChange={(e) => updateSetting('highContrast', e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full ${settings.highContrast ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-600'} peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500`}>
                  <div className={`h-5 w-5 rounded-full bg-white transform transition-transform ${settings.highContrast ? 'translate-x-6' : 'translate-x-1'} shadow-md mt-0.5`}></div>
                </div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ZoomIn size={18} className="mr-2 text-gray-700 dark:text-gray-300" />
                <label htmlFor="large-text" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Large Text
                </label>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="large-text"
                  checked={settings.largeText}
                  onChange={(e) => updateSetting('largeText', e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full ${settings.largeText ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-600'} peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500`}>
                  <div className={`h-5 w-5 rounded-full bg-white transform transition-transform ${settings.largeText ? 'translate-x-6' : 'translate-x-1'} shadow-md mt-0.5`}></div>
                </div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Mouse size={18} className="mr-2 text-gray-700 dark:text-gray-300" />
                <label htmlFor="focus-indicators" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Focus Indicators
                </label>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="focus-indicators"
                  checked={settings.focusIndicators}
                  onChange={(e) => updateSetting('focusIndicators', e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full ${settings.focusIndicators ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-600'} peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500`}>
                  <div className={`h-5 w-5 rounded-full bg-white transform transition-transform ${settings.focusIndicators ? 'translate-x-6' : 'translate-x-1'} shadow-md mt-0.5`}></div>
                </div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ZoomOut size={18} className="mr-2 text-gray-700 dark:text-gray-300" />
                <label htmlFor="reduced-motion" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Reduced Motion
                </label>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="reduced-motion"
                  checked={settings.reducedMotion}
                  onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full ${settings.reducedMotion ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-600'} peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500`}>
                  <div className={`h-5 w-5 rounded-full bg-white transform transition-transform ${settings.reducedMotion ? 'translate-x-6' : 'translate-x-1'} shadow-md mt-0.5`}></div>
                </div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Keyboard size={18} className="mr-2 text-gray-700 dark:text-gray-300" />
                <label htmlFor="keyboard-shortcuts" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Keyboard Shortcuts
                </label>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="keyboard-shortcuts"
                  checked={settings.keyboardShortcuts}
                  onChange={(e) => updateSetting('keyboardShortcuts', e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full ${settings.keyboardShortcuts ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-600'} peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500`}>
                  <div className={`h-5 w-5 rounded-full bg-white transform transition-transform ${settings.keyboardShortcuts ? 'translate-x-6' : 'translate-x-1'} shadow-md mt-0.5`}></div>
                </div>
              </label>
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-gray-500 dark:text-gray-400 rounded-b-lg">
            <p className="mb-1"><strong>Keyboard Shortcuts:</strong></p>
            <ul className="list-disc list-inside">
              <li>Alt + A: Toggle this panel</li>
              <li>Ctrl + Alt + H: Toggle high contrast</li>
              <li>Ctrl + Alt + T: Toggle large text</li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default Accessibility;
