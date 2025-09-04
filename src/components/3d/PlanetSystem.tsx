"use client";

import { useRef, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import { SpaceStation } from './SpaceStation';
import * as THREE from 'three';

interface PlanetProps {
  position: [number, number, number];
  color: string;
  emissive: string;
  name: string;
  onClick: () => void;
  textureSet?: string;
  size?: number;
}

const ParticleRing = ({ position, color, hovered }: { 
  position: [number, number, number]; 
  color: string; 
  hovered: boolean; 
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(60 * 3);
    for (let i = 0; i < 60; i++) {
      const angle = (i / 60) * Math.PI * 2;
      const radius = 2.2 + Math.random() * 0.4;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.6;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (pointsRef.current && hovered) {
      pointsRef.current.rotation.y += 0.01;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group position={position}>
      <Points
        ref={pointsRef}
        positions={particlePositions}
        stride={3}
        frustumCulled={false}
      >
        <PointMaterial
          transparent
          color={color}
          size={hovered ? 0.05 : 0.02}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={hovered ? 0.8 : 0.3}
        />
      </Points>
    </group>
  );
};

const StationaryPlanet = ({ 
  position, 
  color, 
  emissive, 
  onClick, 
  size = 1.2 
}: PlanetProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    // Only planet rotation, no orbital movement
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
    }
  });
  
  return (
    <group position={position} onClick={onClick}>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[size, 64, 64]} />
        <meshStandardMaterial 
          color={color} 
          emissive={emissive} 
          emissiveIntensity={0.3}
          metalness={0.2}
          roughness={0.8}
        />
      </mesh>
      
      <ParticleRing position={[0, 0, 0]} color={emissive} hovered={false} />
    </group>
  );
};

const LoadingPlanet = ({ position, color, emissive, onClick, size = 1.2 }: PlanetProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
      
      // Pulsing effect
      const scale = 0.8 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      meshRef.current.scale.setScalar(scale);
    }
    
    if (outerRef.current) {
      outerRef.current.rotation.y -= delta * 0.3;
      outerRef.current.rotation.x += delta * 0.2;
    }
  });
  
  return (
    <group position={position} onClick={onClick}>
      {/* Inner core with wireframe */}
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <icosahedronGeometry args={[size * 0.6, 1]} />
        <meshBasicMaterial 
          color={color}
          wireframe
          transparent
          opacity={0.6}
        />
      </mesh>
      
      {/* Outer scanning shell */}
      <mesh ref={outerRef}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial 
          color={emissive}
          transparent
          opacity={0.2}
          wireframe
        />
      </mesh>
      
      {/* Scanning particles */}
      <Points
        positions={useMemo(() => {
          const positions = new Float32Array(30 * 3);
          for (let i = 0; i < 30; i++) {
            const radius = size * 1.5;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);
          }
          return positions;
        }, [size])}
        stride={3}
        frustumCulled={false}
      >
        <PointMaterial
          transparent
          color={emissive}
          size={0.1}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </Points>
      
      {/* Central glow */}
      <mesh>
        <sphereGeometry args={[size * 0.3, 16, 16]} />
        <meshBasicMaterial 
          color={emissive}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
};

export const PlanetSystem = ({ onPlanetClick }: { onPlanetClick: (planet: string) => void }) => {
  return (
    <group>
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 5, 0]} intensity={1.5} color="#ffffff" />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      
      {/* Central Space Station */}
      <group position={[5, -5, 25]}>
        <SpaceStation onClick={() => onPlanetClick('station')} />
      </group>
      
      {/* VetNav - Front Right (larger, more spread out) */}
      <Suspense fallback={<LoadingPlanet position={[-35, 15, -10]} color="#2563eb" emissive="#1e40af" name="VetNav" onClick={() => onPlanetClick('vetnav')} size={1.8} />}>
        <StationaryPlanet 
          position={[-35, 15, -10]}
          color="#2563eb"
          emissive="#1e40af"
          name="VetNav"
          textureSet="greenPlanet"
          size={1.8}
          onClick={() => onPlanetClick('vetnav')}
        />
      </Suspense>
      
      {/* Tariff Explorer - Far Right (larger, more spread out) */}
      <Suspense fallback={<LoadingPlanet position={[30, 20, 8]} color="#10b981" emissive="#059669" name="Tariff Explorer" onClick={() => onPlanetClick('tariff')} size={2.2} />}>
        <StationaryPlanet 
          position={[30, 20, 8]}
          color="#10b981"
          emissive="#059669"
          name="Tariff Explorer"
          textureSet="gasPlanet"
          size={2.2}
          onClick={() => onPlanetClick('tariff')}
        />
      </Suspense>
      
      {/* Pet Radar - Back Left (larger, more spread out) */}
      <Suspense fallback={<LoadingPlanet position={[-25, 2, -20]} color="#7c3aed" emissive="#6d28d9" name="Pet Radar" onClick={() => onPlanetClick('petradar')} size={1.6} />}>
        <StationaryPlanet 
          position={[-25, 2, -20]}
          color="#7c3aed"
          emissive="#6d28d9"
          name="Pet Radar"
          textureSet="desolate dirt planet"
          size={1.6}
          onClick={() => onPlanetClick('petradar')}
        />
      </Suspense>
      
      {/* JetsHome - Far Left (larger, more spread out) */}
      <Suspense fallback={<LoadingPlanet position={[40, -12, -20]} color="#ea580c" emissive="#dc2626" name="JetsHome" onClick={() => onPlanetClick('jetshome')} size={2.0} />}>
        <StationaryPlanet 
          position={[40, -12, -20]}
          color="#ea580c"
          emissive="#dc2626"
          name="JetsHome"
          textureSet="jetsSkin"
          size={2.0}
          onClick={() => onPlanetClick('jetshome')}
        />
      </Suspense>
    </group>
  );
};
