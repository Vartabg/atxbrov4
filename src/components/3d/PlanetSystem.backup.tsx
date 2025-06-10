"use client";

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';

interface PlanetProps {
  position: [number, number, number];
  color: string;
  emissive: string;
  name: string;
  onClick: () => void;
}

const Planet = ({ position, color, emissive, name, onClick }: PlanetProps) => {
  const meshRef = useRef<any>();
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
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
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshStandardMaterial 
          color={color} 
          emissive={emissive} 
          emissiveIntensity={0.3} 
        />
      </mesh>
      <Text position={[0, 2, 0]} fontSize={0.3} color="#ffffff" anchorX="center">
        {name}
      </Text>
    </group>
  );
};

export const PlanetSystem = ({ onPlanetClick }: { onPlanetClick: (planet: string) => void }) => {
  return (
    <group>
      <Planet 
        position={[-4, 2, 0]}
        color="#2563eb"
        emissive="#1e40af"
        name="VetNav"
        onClick={() => onPlanetClick('vetnav')}
      />
      
      <Planet 
        position={[4, 2, 0]}
        color="#10b981"
        emissive="#059669"
        name="Tariff Explorer"
        onClick={() => onPlanetClick('tariff')}
      />
      
      <Planet 
        position={[-4, -2, 0]}
        color="#7c3aed"
        emissive="#6d28d9"
        name="Pet Radar"
        onClick={() => onPlanetClick('petradar')}
      />
      
      <Planet 
        position={[4, -2, 0]}
        color="#ea580c"
        emissive="#dc2626"
        name="JetsHome"
        onClick={() => onPlanetClick('jetshome')}
      />
    </group>
  );
};
