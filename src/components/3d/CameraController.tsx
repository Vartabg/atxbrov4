"use client";

import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CameraControllerProps {
  focusTarget?: { position: [number, number, number]; name: string } | null;
  onTransitionComplete?: () => void;
}

export const CameraController = ({ focusTarget, onTransitionComplete }: CameraControllerProps) => {

  const { camera } = useThree();
  const isTransitioning = useRef(false);
  const startPosition = useRef(new THREE.Vector3());
  const startRotation = useRef(new THREE.Euler());
  const targetPosition = useRef(new THREE.Vector3());
  const targetRotation = useRef(new THREE.Euler());
  const transitionProgress = useRef(0);
  const transitionDuration = 2.0;
  
  // Only transition when focusTarget changes, not automatically
  useEffect(() => {
    // Do nothing - remove automatic camera transitions
    // Camera will only move via user controls (OrbitControls)
  }, [focusTarget, camera]); // Keep consistent dependencies
  
  useFrame((state, delta) => {
    if (isTransitioning.current) {
      transitionProgress.current += delta / transitionDuration;
      
      if (transitionProgress.current >= 1) {
        transitionProgress.current = 1;
        isTransitioning.current = false;
        onTransitionComplete?.();
      }
      
      // Smooth easing function
      const easeInOut = (t: number) => t * t * (3 - 2 * t);
      const easedProgress = easeInOut(transitionProgress.current);
      
      // Interpolate position
      camera.position.lerpVectors(startPosition.current, targetPosition.current, easedProgress);
      
      // Interpolate rotation
      const tempQuaternion = new THREE.Quaternion();
      const startQuaternion = new THREE.Quaternion().setFromEuler(startRotation.current);
      const targetQuaternion = new THREE.Quaternion().setFromEuler(targetRotation.current);
      
      tempQuaternion.slerpQuaternions(startQuaternion, targetQuaternion, easedProgress);
      camera.quaternion.copy(tempQuaternion);
    }
  });
  
  return null;
};
