"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface AccessibilityControllerProps {
  onPlanetFocus?: (planetId: string | null) => void;
  onPlanetActivate?: (planetId: string) => void;
  enabled?: boolean;
}

interface FocusableElement {
  id: string;
  name: string;
  description: string;
  position: [number, number, number];
  type: 'planet' | 'station' | 'ui';
}

export const AccessibilityController = ({ 
  onPlanetFocus, 
  onPlanetActivate, 
  enabled = true 
}: AccessibilityControllerProps) => {
  const { camera } = useThree();
  const [currentFocusIndex, setCurrentFocusIndex] = useState<number>(-1);
  const [isKeyboardMode, setIsKeyboardMode] = useState<boolean>(false);
  const [announceText, setAnnounceText] = useState<string>('');
  const announceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Define focusable elements in the scene
  const focusableElements = useMemo((): FocusableElement[] => [
    {
      id: 'vetnav',
      name: 'VetNav Planet',
      description: 'Veterans Benefits Navigator - Click to explore benefits finder, crisis support, and interactive state map',
      position: [-35, 15, -10],
      type: 'planet'
    },
    {
      id: 'tariff',
      name: 'Tariff Explorer Planet',
      description: 'Trade Command Station - Click to explore product search, country data, and trade analytics',
      position: [30, 20, 8],
      type: 'planet'
    },
    {
      id: 'petradar',
      name: 'Pet Radar Planet',
      description: 'Animal Rescue Network - Click to explore lost pet reporting and adoption listings',
      position: [-25, 2, -20],
      type: 'planet'
    },
    {
      id: 'jetshome',
      name: 'Jets Home Planet',
      description: 'Sports Analytics Hub - Click to explore live stats, team analytics, and AI predictions',
      position: [40, -12, -20],
      type: 'planet'
    },
    {
      id: 'station',
      name: 'Central Space Station',
      description: 'Imperial Command Citadel - Central hub for space navigation',
      position: [5, -5, 25],
      type: 'station'
    }
  ], []);

  // Announce text to screen readers
  const announce = useCallback((text: string) => {
    setAnnounceText(text);
    if (announceTimeoutRef.current) {
      clearTimeout(announceTimeoutRef.current);
    }
    announceTimeoutRef.current = setTimeout(() => {
      setAnnounceText('');
    }, 1000);
  }, []);

  // Focus on specific element
  const focusElement = useCallback((index: number) => {
    if (index < 0 || index >= focusableElements.length) return;
    
    const element = focusableElements[index];
    setCurrentFocusIndex(index);
    onPlanetFocus?.(element.id);
    
    // Move camera to better view the focused element
    const targetPosition = new THREE.Vector3(...element.position);
    const viewDistance = 30;
    const viewPosition = targetPosition.clone().add(new THREE.Vector3(viewDistance, viewDistance * 0.5, viewDistance));
    
    // Smooth camera animation
    const startPosition = camera.position.clone();
    const startTime = Date.now();
    const duration = 1000;
    
    const animateCamera = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      camera.position.lerpVectors(startPosition, viewPosition, easeProgress);
      camera.lookAt(targetPosition);
      
      if (progress < 1) {
        requestAnimationFrame(animateCamera);
      }
    };
    
    animateCamera();
    
    // Announce the focused element
    announce(`Focused on ${element.name}. ${element.description}`);
  }, [camera, focusableElements, onPlanetFocus, announce]);

  // Activate current element
  const activateCurrentElement = useCallback(() => {
    if (currentFocusIndex >= 0 && currentFocusIndex < focusableElements.length) {
      const element = focusableElements[currentFocusIndex];
      onPlanetActivate?.(element.id);
      announce(`Activating ${element.name}`);
    }
  }, [currentFocusIndex, focusableElements, onPlanetActivate, announce]);

  const showHelpDialog = useCallback(() => {
    announce(`Keyboard navigation help: Use Tab or arrow keys to navigate between planets. Press Enter or Space to activate. Press 1-5 for direct planet selection. Press Escape to clear focus. Press Ctrl+H for this help.`);
  }, [announce]);

  // Keyboard navigation
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Detect keyboard usage
      setIsKeyboardMode(true);
      
      switch (event.key) {
        case 'Tab':
          event.preventDefault();
          if (event.shiftKey) {
            // Shift+Tab - previous element
            const prevIndex = currentFocusIndex <= 0 
              ? focusableElements.length - 1 
              : currentFocusIndex - 1;
            focusElement(prevIndex);
          } else {
            // Tab - next element
            const nextIndex = (currentFocusIndex + 1) % focusableElements.length;
            focusElement(nextIndex);
          }
          break;

        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault();
          const nextIndex = (currentFocusIndex + 1) % focusableElements.length;
          focusElement(nextIndex);
          break;

        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          const prevIndex = currentFocusIndex <= 0 
            ? focusableElements.length - 1 
            : currentFocusIndex - 1;
          focusElement(prevIndex);
          break;

        case 'Enter':
        case ' ':
          event.preventDefault();
          activateCurrentElement();
          break;

        case 'Escape':
          event.preventDefault();
          setCurrentFocusIndex(-1);
          onPlanetFocus?.(null);
          announce('Navigation cleared');
          break;

        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          event.preventDefault();
          const index = parseInt(event.key) - 1;
          if (index < focusableElements.length) {
            focusElement(index);
          }
          break;

        case 'h':
        case 'H':
          if (event.ctrlKey) {
            event.preventDefault();
            showHelpDialog();
          }
          break;
      }
    };

    const handleMouseMove = () => {
      // Detect mouse usage
      setIsKeyboardMode(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [enabled, currentFocusIndex, focusableElements, focusElement, activateCurrentElement, onPlanetFocus, announce, showHelpDialog]);

  // Initialize with help announcement
  useEffect(() => {
    if (enabled) {
      announce('3D Space Navigation loaded. Press Tab to start keyboard navigation or Ctrl+H for help.');
    }
  }, [enabled, announce]);

  return (
    <>
      {/* Screen reader announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announceText}
      </div>

      {/* Visual focus indicator */}
      {isKeyboardMode && currentFocusIndex >= 0 && (
        <FocusIndicator element={focusableElements[currentFocusIndex]} />
      )}

      {/* Accessibility controls overlay */}
      {enabled && (
        <AccessibilityOverlay 
          currentElement={currentFocusIndex >= 0 ? focusableElements[currentFocusIndex] : null}
          isKeyboardMode={isKeyboardMode}
        />
      )}
    </>
  );
};

interface FocusIndicatorProps {
  element: FocusableElement;
}

const FocusIndicator = ({ element }: FocusIndicatorProps) => {
  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
      <div className="bg-yellow-400 text-black px-4 py-2 rounded-lg shadow-lg border-2 border-yellow-600 animate-pulse">
        <div className="font-bold">{element.name}</div>
        <div className="text-sm">{element.description}</div>
        <div className="text-xs mt-2">Press Enter to activate</div>
      </div>
    </div>
  );
};

interface AccessibilityOverlayProps {
  currentElement: FocusableElement | null;
  isKeyboardMode: boolean;
}

const AccessibilityOverlay = ({ currentElement, isKeyboardMode }: AccessibilityOverlayProps) => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Keyboard navigation hints */}
      {isKeyboardMode && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-80 text-white p-4 rounded-lg pointer-events-auto max-w-md">
          <h3 className="font-bold mb-2">Keyboard Navigation</h3>
          {currentElement ? (
            <div className="space-y-2">
              <div className="text-yellow-400 font-semibold">
                Focused: {currentElement.name}
              </div>
              <div className="text-sm text-gray-300">
                {currentElement.description}
              </div>
              <div className="text-xs text-gray-400">
                Press Enter to activate • Tab/Arrows to navigate • Esc to clear
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-300">
              Press Tab to start navigating planets
            </div>
          )}
        </div>
      )}

      {/* Help button */}
      <button
        className="absolute bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg pointer-events-auto hover:bg-blue-700 focus:ring-2 focus:ring-blue-300"
        onClick={() => setShowHelp(!showHelp)}
        aria-label="Accessibility help"
        title="Accessibility help (Ctrl+H)"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {/* Help dialog */}
      {showHelp && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center pointer-events-auto">
          <div className="bg-white text-black p-6 rounded-lg max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Accessibility Features</h2>
            
            <div className="space-y-4">
              <section>
                <h3 className="font-semibold mb-2">Keyboard Navigation</h3>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>• <kbd className="bg-gray-200 px-1 rounded">Tab</kbd> / <kbd className="bg-gray-200 px-1 rounded">Arrow keys</kbd> - Navigate between planets</li>
                  <li>• <kbd className="bg-gray-200 px-1 rounded">Enter</kbd> / <kbd className="bg-gray-200 px-1 rounded">Space</kbd> - Activate selected planet</li>
                  <li>• <kbd className="bg-gray-200 px-1 rounded">1-5</kbd> - Direct planet selection</li>
                  <li>• <kbd className="bg-gray-200 px-1 rounded">Esc</kbd> - Clear focus</li>
                  <li>• <kbd className="bg-gray-200 px-1 rounded">Ctrl+H</kbd> - Show this help</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold mb-2">Screen Reader Support</h3>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>• All planets have descriptive labels</li>
                  <li>• Navigation changes are announced</li>
                  <li>• Focus indicators provide context</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold mb-2">Mobile Accessibility</h3>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>• Touch planets directly to activate</li>
                  <li>• Pinch to zoom, drag to rotate</li>
                  <li>• Double tap to focus on objects</li>
                  <li>• Haptic feedback on supported devices</li>
                </ul>
              </section>
            </div>

            <button
              className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:ring-2 focus:ring-blue-300"
              onClick={() => setShowHelp(false)}
            >
              Close Help
            </button>
          </div>
        </div>
      )}

      {/* Skip to content link */}
      <a
        href="#main-navigation"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded focus:z-50 pointer-events-auto"
      >
        Skip to planet navigation
      </a>
    </div>
  );
};