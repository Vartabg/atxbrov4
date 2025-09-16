"use client";

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DynamicLightProps {
  position: [number, number, number];
  color: string;
  intensity?: number;
  distance?: number;
  animated?: boolean;
  lightType?: 'point' | 'spot' | 'directional';
}

const DynamicLight = ({ 
  position, 
  color, 
  intensity = 1.0, 
  distance = 100, 
  animated = true,
  lightType = 'point'
}: DynamicLightProps) => {
  const lightRef = useRef<THREE.Light>(null);
  
  useFrame((state) => {
    if (!animated || !lightRef.current) return;
    
    // Dynamic intensity variation
    const baseIntensity = intensity;
    const variation = Math.sin(state.clock.elapsedTime * 2) * 0.2;
    lightRef.current.intensity = baseIntensity + variation;
    
    // Subtle position animation
    const originalPos = new THREE.Vector3(...position);
    const offset = new THREE.Vector3(
      Math.sin(state.clock.elapsedTime * 0.5) * 2,
      Math.cos(state.clock.elapsedTime * 0.7) * 1,
      Math.sin(state.clock.elapsedTime * 0.3) * 1.5
    );
    
    lightRef.current.position.copy(originalPos.add(offset));
  });

  const lightComponent = useMemo(() => {
    switch (lightType) {
      case 'spot':
        return (
          <spotLight
            ref={lightRef}
            position={position}
            color={color}
            intensity={intensity}
            distance={distance}
            angle={Math.PI / 6}
            penumbra={0.5}
            castShadow
          />
        );
      case 'directional':
        return (
          <directionalLight
            ref={lightRef}
            position={position}
            color={color}
            intensity={intensity}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-near={0.1}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
        );
      default:
        return (
          <pointLight
            ref={lightRef}
            position={position}
            color={color}
            intensity={intensity}
            distance={distance}
            decay={2}
          />
        );
    }
  }, [position, color, intensity, distance, lightType]);

  return lightComponent;
};

interface EnhancedLightingProps {
  timeOfDay?: 'day' | 'night' | 'dawn' | 'dusk';
  ambientIntensity?: number;
  animated?: boolean;
}

export const EnhancedLighting = ({ 
  timeOfDay = 'night', 
  ambientIntensity = 0.4, 
  animated = true 
}: EnhancedLightingProps) => {
  const ambientRef = useRef<THREE.AmbientLight>(null);
  
  // Color temperature mapping
  const colorTemperatures = useMemo(() => ({
    day: {
      ambient: '#ffffff',
      sun: '#ffeaa7',
      rim: '#74b9ff',
      intensity: 1.2
    },
    night: {
      ambient: '#2d3436',
      sun: '#74b9ff',
      rim: '#a29bfe',
      intensity: 0.6
    },
    dawn: {
      ambient: '#fdcb6e',
      sun: '#e17055',
      rim: '#fd79a8',
      intensity: 0.8
    },
    dusk: {
      ambient: '#6c5ce7',
      sun: '#fd79a8',
      rim: '#fdcb6e',
      intensity: 0.7
    }
  }), []);

  const currentColors = colorTemperatures[timeOfDay];

  useFrame((state) => {
    if (!animated || !ambientRef.current) return;
    
    // Dynamic ambient light variation
    const variation = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    ambientRef.current.intensity = ambientIntensity + variation;
  });

  return (
    <group>
      {/* Ambient lighting with color temperature */}
      <ambientLight
        ref={ambientRef}
        color={currentColors.ambient}
        intensity={ambientIntensity * currentColors.intensity}
      />

      {/* Main directional light (sun/moon) */}
      <DynamicLight
        position={[50, 50, 50]}
        color={currentColors.sun}
        intensity={1.5 * currentColors.intensity}
        lightType="directional"
        animated={animated}
      />

      {/* Rim lighting */}
      <DynamicLight
        position={[-30, 30, -30]}
        color={currentColors.rim}
        intensity={0.8 * currentColors.intensity}
        distance={200}
        animated={animated}
      />

      {/* Key light for planets */}
      <DynamicLight
        position={[20, 10, 30]}
        color="#ffffff"
        intensity={1.0}
        distance={100}
        animated={animated}
      />

      {/* Fill light */}
      <DynamicLight
        position={[-20, -10, 20]}
        color={currentColors.ambient}
        intensity={0.5}
        distance={80}
        animated={animated}
      />

      {/* Accent lights for depth */}
      <DynamicLight
        position={[0, -40, 0]}
        color="#4a9eff"
        intensity={0.3}
        distance={60}
        animated={animated}
      />
      
      <DynamicLight
        position={[40, 0, -40]}
        color="#ff6b47"
        intensity={0.4}
        distance={70}
        animated={animated}
      />
      
      <DynamicLight
        position={[-40, 20, 40]}
        color="#10b981"
        intensity={0.3}
        distance={65}
        animated={animated}
      />
    </group>
  );
};

// Volumetric lighting effect
interface VolumetricLightProps {
  position: [number, number, number];
  target: [number, number, number];
  color: string;
  intensity?: number;
  rayCount?: number;
}

export const VolumetricLight = ({ 
  position, 
  target, 
  color, 
  intensity = 1.0, 
  rayCount = 50 
}: VolumetricLightProps) => {
  const volumetricRef = useRef<THREE.Points>(null);

  const rayPositions = useMemo(() => {
    const positions = new Float32Array(rayCount * 3);
    const start = new THREE.Vector3(...position);
    const end = new THREE.Vector3(...target);
    
    for (let i = 0; i < rayCount; i++) {
      const t = i / (rayCount - 1);
      const point = start.clone().lerp(end, t);
      
      // Add some scatter
      point.x += (Math.random() - 0.5) * 2;
      point.y += (Math.random() - 0.5) * 2;
      point.z += (Math.random() - 0.5) * 2;
      
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;
    }
    
    return positions;
  }, [position, target, rayCount]);

  useFrame((state) => {
    if (!volumetricRef.current) return;
    
    // Animate ray opacity
    const material = volumetricRef.current.material as THREE.PointsMaterial;
    const pulse = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.3;
    material.opacity = pulse * intensity;
  });

  return (
    <points ref={volumetricRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={rayPositions}
          count={rayCount}
          itemSize={3}
          args={[rayPositions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.1}
        transparent
        opacity={intensity}
        sizeAttenuation={true}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// God rays effect
export const GodRays = ({ 
  sunPosition, 
  intensity = 0.5 
}: { 
  sunPosition: [number, number, number]; 
  intensity?: number; 
}) => {
  const raysRef = useRef<THREE.Group>(null);

  const rayGeometries = useMemo(() => {
    const rays = [];
    const rayCount = 8;
    
    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2;
      const length = 100;
      
      const start = new THREE.Vector3(...sunPosition);
      const end = new THREE.Vector3(
        start.x + Math.cos(angle) * length,
        start.y,
        start.z + Math.sin(angle) * length
      );
      
      rays.push({ start: start.toArray(), end: end.toArray() });
    }
    
    return rays;
  }, [sunPosition]);

  useFrame((state) => {
    if (!raysRef.current) return;
    
    raysRef.current.rotation.y += 0.001;
    
    // Fade rays in and out
    const fade = 0.3 + Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    raysRef.current.children.forEach((child) => {
      if (child.type === 'Points') {
        const material = (child as THREE.Points).material as THREE.PointsMaterial;
        material.opacity = fade * intensity;
      }
    });
  });

  return (
    <group ref={raysRef}>
      {rayGeometries.map((ray, index) => (
        <VolumetricLight
          key={index}
          position={ray.start as [number, number, number]}
          target={ray.end as [number, number, number]}
          color="#ffeaa7"
          intensity={intensity}
          rayCount={30}
        />
      ))}
    </group>
  );
};