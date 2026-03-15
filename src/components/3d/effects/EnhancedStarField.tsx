"use client";

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface StarFieldProps {
  count?: number;
  radius?: number;
  depth?: number;
  animated?: boolean;
}

export const EnhancedStarField = ({ 
  count = 5000, 
  radius = 300, 
  animated = true 
}: StarFieldProps) => {
  const starFieldRef = useRef<THREE.Points>(null);
  const brightStarsRef = useRef<THREE.Points>(null);
  const distantStarsRef = useRef<THREE.Points>(null);

  // Generate regular star field
  const { positions: starPositions, colors: starColors, sizes: starSizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    const starColor = new THREE.Color();
    const starTypes = [
      { color: '#ffffff', temp: 1.0, size: 1.0 }, // White dwarf
      { color: '#ffffcc', temp: 0.9, size: 1.2 }, // Sun-like
      { color: '#ffccaa', temp: 0.8, size: 1.5 }, // Orange giant
      { color: '#ffaaaa', temp: 0.7, size: 2.0 }, // Red giant
      { color: '#aaccff', temp: 1.1, size: 0.8 }, // Blue star
    ];

    for (let i = 0; i < count; i++) {
      // Generate spherical distribution
      const radius_var = radius * (0.8 + Math.random() * 0.4);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius_var * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius_var * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius_var * Math.cos(phi);

      // Assign random star type
      const starType = starTypes[Math.floor(Math.random() * starTypes.length)];
      starColor.set(starType.color);
      
      colors[i * 3] = starColor.r;
      colors[i * 3 + 1] = starColor.g;
      colors[i * 3 + 2] = starColor.b;
      
      sizes[i] = starType.size * (0.5 + Math.random() * 0.5);
    }

    return { positions, colors, sizes };
  }, [count, radius]);

  // Generate bright prominent stars
  const { positions: brightPositions, colors: brightColors } = useMemo(() => {
    const brightCount = 50;
    const positions = new Float32Array(brightCount * 3);
    const colors = new Float32Array(brightCount * 3);
    
    const brightColor = new THREE.Color();
    
    for (let i = 0; i < brightCount; i++) {
      const radius_var = radius * 1.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius_var * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius_var * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius_var * Math.cos(phi);

      // Bright star colors
      const hue = Math.random() * 0.7; // Blue to yellow spectrum
      brightColor.setHSL(hue, 0.6, 0.9);
      
      colors[i * 3] = brightColor.r;
      colors[i * 3 + 1] = brightColor.g;
      colors[i * 3 + 2] = brightColor.b;
    }

    return { positions, colors };
  }, [radius]);

  // Generate distant background stars
  const distantPositions = useMemo(() => {
    const distantCount = 2000;
    const positions = new Float32Array(distantCount * 3);
    
    for (let i = 0; i < distantCount; i++) {
      const radius_var = radius * 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius_var * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius_var * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius_var * Math.cos(phi);
    }

    return positions;
  }, [radius]);

  // Animation
  useFrame((state) => {
    if (!animated) return;

    // Gentle rotation of star field
    if (starFieldRef.current) {
      starFieldRef.current.rotation.y += 0.0002;
      starFieldRef.current.rotation.x += 0.0001;
    }

    // Bright stars twinkling effect
    if (brightStarsRef.current) {
      brightStarsRef.current.rotation.y += 0.0005;
      
      // Modify the material opacity for twinkling
      const material = brightStarsRef.current.material as THREE.PointsMaterial;
      if (material) {
        const baseOpacity = 0.8 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
        material.opacity = baseOpacity;
      }
    }

    // Very slow rotation for distant stars
    if (distantStarsRef.current) {
      distantStarsRef.current.rotation.y -= 0.0001;
    }
  });

  return (
    <group>
      {/* Main star field */}
      <Points
        ref={starFieldRef}
        positions={starPositions}
        colors={starColors}
        sizes={starSizes}
        stride={3}
        frustumCulled={false}
      >
        <PointMaterial
          transparent
          vertexColors
          size={2}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.8}
        />
      </Points>

      {/* Bright prominent stars */}
      <Points
        ref={brightStarsRef}
        positions={brightPositions}
        colors={brightColors}
        stride={3}
        frustumCulled={false}
      >
        <PointMaterial
          transparent
          vertexColors
          size={4}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.9}
          blending={THREE.AdditiveBlending}
        />
      </Points>

      {/* Distant background stars */}
      <Points
        ref={distantStarsRef}
        positions={distantPositions}
        stride={3}
        frustumCulled={false}
      >
        <PointMaterial
          transparent
          color="#ffffff"
          size={0.5}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.4}
        />
      </Points>

      {/* Milky Way band simulation */}
      <Points
        positions={useMemo(() => {
          const bandCount = 800;
          const positions = new Float32Array(bandCount * 3);
          
          for (let i = 0; i < bandCount; i++) {
            // Create a band across the sky
            const angle = (i / bandCount) * Math.PI * 2;
            const width = Math.sin(angle * 4) * 0.3; // Varying width
            const r = radius * 0.9;
            
            positions[i * 3] = r * Math.cos(angle) + (Math.random() - 0.5) * width * 20;
            positions[i * 3 + 1] = (Math.random() - 0.5) * width * 30;
            positions[i * 3 + 2] = r * Math.sin(angle) + (Math.random() - 0.5) * width * 20;
          }
          
          return positions;
        }, [radius])}
        stride={3}
        frustumCulled={false}
      >
        <PointMaterial
          transparent
          color="#ffffee"
          size={1.5}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.6}
        />
      </Points>
    </group>
  );
};