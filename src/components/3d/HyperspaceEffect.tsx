"use client";

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface HyperspaceEffectProps {
  isActive: boolean;
  intensity?: number;
}

export const HyperspaceEffect = ({ isActive, intensity = 1 }: HyperspaceEffectProps) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  
  const { positions, velocities } = useMemo(() => {
    const count = 2000;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Create stars in a cylinder around the camera path
      const radius = Math.random() * 20 + 5;
      const angle = Math.random() * Math.PI * 2;
      const z = (Math.random() - 0.5) * 200;
      
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = z;
      
      // Velocity towards camera
      velocities[i * 3] = 0;
      velocities[i * 3 + 1] = 0;
      velocities[i * 3 + 2] = Math.random() * 2 + 1;
    }
    
    return { positions, velocities };
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current || !isActive) return;
    
    const positionsAttribute = pointsRef.current.geometry.attributes.position;
    const array = positionsAttribute.array as Float32Array;
    
    for (let i = 0; i < array.length; i += 3) {
      // Move particles towards camera
      array[i + 2] += velocities[i + 2] * delta * 60 * intensity;
      
      // Reset particles that pass through
      if (array[i + 2] > 50) {
        const radius = Math.random() * 20 + 5;
        const angle = Math.random() * Math.PI * 2;
        array[i] = Math.cos(angle) * radius;
        array[i + 1] = Math.sin(angle) * radius;
        array[i + 2] = -100;
      }
    }
    
    positionsAttribute.needsUpdate = true;
    
    // Pulse the material
    if (materialRef.current) {
      materialRef.current.size = 2 + Math.sin(state.clock.elapsedTime * 10) * 0.5;
    }
  });

  if (!isActive) return null;

  return (
    <>
      {/* Star streak effect */}
      <Points
        ref={pointsRef}
        positions={positions}
        stride={3}
        frustumCulled={false}
      >
        <PointMaterial
          ref={materialRef}
          transparent
          color="#00ffff"
          size={2}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </Points>
      
      {/* Tunnel rings */}
      {[...Array(8)].map((_, i) => (
        <HyperspaceRing key={i} index={i} intensity={intensity} />
      ))}
      
      {/* Central glow */}
      <mesh position={[0, 0, -20]}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </>
  );
};

const HyperspaceRing = ({ index, intensity }: { index: number; intensity: number }) => {
  const ringRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (!ringRef.current) return;
    
    // Move ring towards camera
    ringRef.current.position.z += delta * 30 * intensity;
    
    // Reset position when it passes through
    if (ringRef.current.position.z > 20) {
      ringRef.current.position.z = -100;
    }
    
    // Rotate for tunnel effect
    ringRef.current.rotation.z += delta * 2;
    
    // Scale based on distance
    const distance = Math.abs(ringRef.current.position.z);
    const scale = Math.max(0.1, (100 - distance) / 100);
    ringRef.current.scale.setScalar(scale);
  });
  
  return (
    <mesh
      ref={ringRef}
      position={[0, 0, -20 - index * 15]}
      rotation={[0, 0, index * 0.5]}
    >
      <ringGeometry args={[8, 12, 32]} />
      <meshBasicMaterial
        color="#00ffff"
        transparent
        opacity={0.3}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};
