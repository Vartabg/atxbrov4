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
  
  useEffect(() => {
    if (focusTarget && !isTransitioning.current) {
      // Start transition to planet
      isTransitioning.current = true;
      transitionProgress.current = 0;
      
      // Store current camera state
      startPosition.current.copy(camera.position);
      startRotation.current.copy(camera.rotation);
      
      // Calculate target position (closer to planet)
      const planetPos = new THREE.Vector3(...focusTarget.position);
      const distance = 4;
      const offset = new THREE.Vector3(2, 1, 3);
      targetPosition.current.copy(planetPos).add(offset);
      
      // Look at planet
      const lookAtMatrix = new THREE.Matrix4().lookAt(targetPosition.current, planetPos, new THREE.Vector3(0, 1, 0));
      targetRotation.current.setFromRotationMatrix(lookAtMatrix);
      
    } else if (!focusTarget && !isTransitioning.current) {
      // Return to overview
      isTransitioning.current = true;
      transitionProgress.current = 0;
      
      startPosition.current.copy(camera.position);
      startRotation.current.copy(camera.rotation);
      
      // Return to original overview position
      targetPosition.current.set(0, 0, 12);
      targetRotation.current.set(0, 0, 0);
    }
  }, [focusTarget, camera]);
  
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
