"use client";

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';

export const CosmicBackground = () => {
  const nebulaRef = useRef<THREE.Mesh>(null);
  const starsRef = useRef<THREE.Points>(null);
  const shootingStarsRef = useRef<THREE.Points>(null);
  
  // Enhanced star field
  const starPositions = useMemo(() => {
    const positions = new Float32Array(8000 * 3);
    const colors = new Float32Array(8000 * 3);
    
    for (let i = 0; i < 8000; i++) {
      // Random sphere distribution
      const radius = Math.random() * 200 + 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Star colors (white, blue, red, yellow)
      const colorChoice = Math.random();
      if (colorChoice < 0.7) {
        colors[i * 3] = 1; colors[i * 3 + 1] = 1; colors[i * 3 + 2] = 1; // White
      } else if (colorChoice < 0.85) {
        colors[i * 3] = 0.7; colors[i * 3 + 1] = 0.8; colors[i * 3 + 2] = 1; // Blue
      } else if (colorChoice < 0.95) {
        colors[i * 3] = 1; colors[i * 3 + 1] = 0.8; colors[i * 3 + 2] = 0.6; // Yellow
      } else {
        colors[i * 3] = 1; colors[i * 3 + 1] = 0.6; colors[i * 3 + 2] = 0.6; // Red
      }
    }
    
    return { positions, colors };
  }, []);
  
  // Shooting stars
  const shootingStarPositions = useMemo(() => {
    const positions = new Float32Array(20 * 3);
    for (let i = 0; i < 20; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    return positions;
  }, []);

  useFrame((state, delta) => {
    // Slowly rotate star field
    if (starsRef.current) {
      starsRef.current.rotation.y += delta * 0.01;
      starsRef.current.rotation.x += delta * 0.005;
    }
    
    // Animate nebula
    if (nebulaRef.current) {
      nebulaRef.current.rotation.y += delta * 0.02;
      const material = nebulaRef.current.material as THREE.MeshBasicMaterial;
      if (material && 'opacity' in material) {
        material.opacity = 0.15 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      }
    }
    
    // Animate shooting stars
    if (shootingStarsRef.current) {
      const positions = shootingStarsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += delta * 2;
        positions[i + 1] += delta * 1;
        positions[i + 2] += delta * 3;
        
        // Reset if too far
        if (positions[i] > 50) {
          positions[i] = -50;
          positions[i + 1] = (Math.random() - 0.5) * 100;
          positions[i + 2] = (Math.random() - 0.5) * 100;
        }
      }
      shootingStarsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Enhanced star field */}
      <Points
        ref={starsRef}
        positions={starPositions.positions}
        colors={starPositions.colors}
        stride={3}
        frustumCulled={false}
      >
        <PointMaterial
          transparent
          vertexColors
          size={1.5}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.8}
        />
      </Points>
      
      {/* Shooting stars */}
      <Points
        ref={shootingStarsRef}
        positions={shootingStarPositions}
        stride={3}
        frustumCulled={false}
      >
        <PointMaterial
          transparent
          color="#ffff00"
          size={3}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </Points>
      
      {/* Nebula background */}
      <Sphere ref={nebulaRef} args={[150, 32, 32]}>
        <meshBasicMaterial
          color="#330066"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>
      
      {/* Distant galaxy effect */}
      <Sphere args={[180, 16, 16]}>
        <meshBasicMaterial
          color="#001122"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </Sphere>
    </group>
  );
};
