"use client";

import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface TouchControllerProps {
  enabled?: boolean;
  sensitivity?: number;
  onPlanetTouch?: (planetId: string) => void;
}

export const MobileTouchController = ({ 
  enabled = true, 
  sensitivity = 1.0,
  onPlanetTouch 
}: TouchControllerProps) => {
  const { camera, gl, scene } = useThree();
  const touchState = useRef({
    touching: false,
    touchStart: { x: 0, y: 0 },
    lastTouch: { x: 0, y: 0 },
    pinchDistance: 0,
    isPinching: false,
    tapTimeout: null as NodeJS.Timeout | null,
    doubleTapTimeout: null as NodeJS.Timeout | null
  });

  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  useEffect(() => {
    if (!enabled) return;

    const canvas = gl.domElement;

    // Touch interaction handlers
    const handleTouchStart = (event: TouchEvent) => {
      event.preventDefault();
      
      if (event.touches.length === 1) {
        // Single touch - rotation start
        const touch = event.touches[0];
        touchState.current.touching = true;
        touchState.current.touchStart = { x: touch.clientX, y: touch.clientY };
        touchState.current.lastTouch = { x: touch.clientX, y: touch.clientY };
        
        // Handle tap detection
        if (touchState.current.tapTimeout) {
          clearTimeout(touchState.current.tapTimeout);
          touchState.current.tapTimeout = null;
          // Double tap detected
          handleDoubleTap(touch.clientX, touch.clientY);
        } else {
          touchState.current.tapTimeout = setTimeout(() => {
            touchState.current.tapTimeout = null;
          }, 300);
        }
      } else if (event.touches.length === 2) {
        // Pinch zoom start
        touchState.current.isPinching = true;
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        touchState.current.pinchDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault();

      if (event.touches.length === 1 && touchState.current.touching && !touchState.current.isPinching) {
        // Single touch rotation
        const touch = event.touches[0];
        const deltaX = (touch.clientX - touchState.current.lastTouch.x) * sensitivity * 0.01;
        const deltaY = (touch.clientY - touchState.current.lastTouch.y) * sensitivity * 0.01;

        // Apply rotation to camera
        const spherical = new THREE.Spherical();
        spherical.setFromVector3(camera.position);
        
        spherical.theta -= deltaX;
        spherical.phi += deltaY;
        
        // Limit phi to prevent flipping
        spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
        
        camera.position.setFromSpherical(spherical);
        camera.lookAt(0, 0, 0);

        touchState.current.lastTouch = { x: touch.clientX, y: touch.clientY };
      } else if (event.touches.length === 2 && touchState.current.isPinching) {
        // Pinch zoom
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        const currentDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );

        const scale = currentDistance / touchState.current.pinchDistance;
        const newDistance = camera.position.length() / scale;
        
        // Apply zoom limits
        const minDistance = 15;
        const maxDistance = 150;
        const clampedDistance = Math.max(minDistance, Math.min(maxDistance, newDistance));
        
        camera.position.normalize().multiplyScalar(clampedDistance);
        touchState.current.pinchDistance = currentDistance;
      }
    };

    const handleTouchEnd = (event: TouchEvent) => {
      event.preventDefault();

      if (event.touches.length === 0) {
        // Check for tap (if touch didn't move much)
        const touch = event.changedTouches[0];
        const touchDistance = Math.sqrt(
          Math.pow(touch.clientX - touchState.current.touchStart.x, 2) +
          Math.pow(touch.clientY - touchState.current.touchStart.y, 2)
        );

        if (touchDistance < 20 && touchState.current.tapTimeout) {
          // Single tap detected - check for planet selection
          handlePlanetTap(touch.clientX, touch.clientY);
        }

        touchState.current.touching = false;
        touchState.current.isPinching = false;
      }
    };

    const handlePlanetTap = (clientX: number, clientY: number) => {
      // Convert touch coordinates to normalized device coordinates
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      // Raycast for planet selection
      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        // Find the closest planet-like object
        for (const intersect of intersects) {
          const object = intersect.object;
          
          // Check if this is a planet (you may need to adjust based on your naming convention)
          if (object.name || object.parent?.name) {
            const planetName = object.name || object.parent?.name || '';
            if (planetName.includes('planet') || planetName.includes('station')) {
              onPlanetTouch?.(planetName);
              
              // Provide haptic feedback if available
              if ('vibrate' in navigator) {
                navigator.vibrate(50);
              }
              break;
            }
          }
        }
      }
    };

    const handleDoubleTap = (clientX: number, clientY: number) => {
      // Double tap to focus on planet or return to overview
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        // Zoom to object
        const targetPosition = intersects[0].point;
        const direction = targetPosition.clone().normalize();
        const newPosition = direction.multiplyScalar(25); // Zoom distance
        
        // Smooth animation to new position
        const startPosition = camera.position.clone();
        const startTime = Date.now();
        const duration = 1500; // 1.5 seconds

        const animateCamera = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Ease-out cubic
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          
          camera.position.lerpVectors(startPosition, newPosition, easeProgress);
          camera.lookAt(targetPosition);
          
          if (progress < 1) {
            requestAnimationFrame(animateCamera);
          }
        };
        
        animateCamera();
      } else {
        // Return to overview position
        const overviewPosition = new THREE.Vector3(0, 20, 50);
        const startPosition = camera.position.clone();
        const startTime = Date.now();
        const duration = 2000;

        const animateCamera = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          
          camera.position.lerpVectors(startPosition, overviewPosition, easeProgress);
          camera.lookAt(0, 0, 0);
          
          if (progress < 1) {
            requestAnimationFrame(animateCamera);
          }
        };
        
        animateCamera();
      }
    };

    // Add event listeners
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    // Prevent context menu on long press
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('contextmenu', (e) => e.preventDefault());
      
      const currentTouchState = touchState.current;
      if (currentTouchState.tapTimeout) {
        clearTimeout(currentTouchState.tapTimeout);
      }
      if (currentTouchState.doubleTapTimeout) {
        clearTimeout(currentTouchState.doubleTapTimeout);
      }
    };
  }, [enabled, sensitivity, camera, gl, scene, onPlanetTouch]);

  return null; // This is a controller component with no visual output
};

// Mobile-specific UI helpers
export const MobileUIOverlay = () => {
  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Touch hints */}
      <div className="absolute bottom-20 left-4 bg-black bg-opacity-60 rounded-lg p-3 text-white">
        <div className="text-xs space-y-1 text-gray-300">
          <div>👆 Tap planets to explore</div>
          <div>🔄 Drag to rotate view</div>
          <div>🤏 Pinch to zoom</div>
          <div>👆👆 Double tap to focus</div>
        </div>
      </div>
    </div>
  );
};

// Device detection utility
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Performance optimization for mobile
export const getMobileQualitySettings = () => {
  const isMobile = isMobileDevice();
  const isLowEndDevice = navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 4 : false;
  
  if (isMobile && isLowEndDevice) {
    return {
      particleCount: 0.3,
      shadowQuality: 'low' as const,
      textureQuality: 'low' as const,
      postProcessing: false,
      animationQuality: 'low' as const,
      lodDistance: 40
    };
  } else if (isMobile) {
    return {
      particleCount: 0.5,
      shadowQuality: 'medium' as const,
      textureQuality: 'medium' as const,
      postProcessing: true,
      animationQuality: 'medium' as const,
      lodDistance: 60
    };
  }
  
  return {
    particleCount: 1.0,
    shadowQuality: 'high' as const,
    textureQuality: 'high' as const,
    postProcessing: true,
    animationQuality: 'high' as const,
    lodDistance: 100
  };
};