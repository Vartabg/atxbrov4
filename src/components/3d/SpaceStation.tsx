"use client";

import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface SpaceStationProps {
  onClick: () => void;
}

export const SpaceStation = ({ onClick }: SpaceStationProps) => {
  const stationRef = useRef<THREE.Group>(null);
  const commandRingRef = useRef<THREE.Mesh>(null);
  const defenseRingRef = useRef<THREE.Mesh>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);
  const hangarRef = useRef<THREE.Group>(null);
  const navLightsRef = useRef<THREE.Group>(null);
  const towerRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  // Imperial Materials
  const imperialHullMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#aaaaaa',
    metalness: 0.95,
    roughness: 0.1,
    emissive: hovered ? '#cccccc' : '#888888',
    emissiveIntensity: hovered ? 0.3 : 0.15
  }), [hovered]);
  
  const commandMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#999999',
    metalness: 0.9,
    roughness: 0.05,
    emissive: '#bbbbbb',
    emissiveIntensity: 0.2
  }), []);
  
  const defenseMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#777777',
    metalness: 0.85,
    roughness: 0.2,
    emissive: '#999999',
    emissiveIntensity: 0.1
  }), []);
  
  const structuralMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#666666',
    metalness: 0.8,
    roughness: 0.3,
    emissive: '#888888',
    emissiveIntensity: 0.05
  }), []);
  
  const glowMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#ffffff',
    transparent: true,
    opacity: 0.9
  }), []);
  
  // Navigation light material (for blinking)
  const navLightMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#ffffff',
    transparent: true,
    opacity: 1
  }), []);
  
  useFrame((state, delta) => {
    if (stationRef.current) {
      stationRef.current.rotation.y += delta * 0.02; // Slower, more majestic rotation
    }
    
    // Imperial ring rotations (different speeds for hierarchy)
    if (commandRingRef.current) {
      commandRingRef.current.rotation.z += delta * 0.3; // Command ring
    }
    if (defenseRingRef.current) {
      defenseRingRef.current.rotation.z -= delta * 0.2; // Defense ring
    }
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z += delta * 0.1; // Outer ring
    }
    
    // Command tower subtle movement
    if (towerRef.current) {
      towerRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.01;
    }
    
    // Hangar bay activity
    if (hangarRef.current) {
      const activity = 0.3 + Math.sin(state.clock.elapsedTime * 4) * 0.2;
      hangarRef.current.children.forEach((child, i) => {
        if (child.material && child.material.emissiveIntensity !== undefined) {
          child.material.emissiveIntensity = activity * (0.2 + (i % 4) * 0.1);
        }
      });
    }
    
    // Navigation beacon sequence
    if (navLightsRef.current) {
      const sequence = Math.floor(state.clock.elapsedTime * 1.5) % 6;
      navLightsRef.current.children.forEach((child, i) => {
        if (child.material && child.material.opacity !== undefined) {
          child.material.opacity = (i % 6 === sequence) ? 1 : 0.1;
        }
      });
    }
  });
  
  return (
    <group 
      ref={stationRef}
      onClick={onClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
        setHovered(true);
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
        setHovered(false);
      }}
      scale={0.25} // Scale down even further to 25% of original size
    >
      {/* IMPERIAL COMMAND CITADEL */}
      <group ref={towerRef}>
        {/* Supreme Command Spire */}
        <mesh position={[0, 8, 0]}>
          <cylinderGeometry args={[1.2, 3.5, 6, 12]} />
          <primitive object={commandMaterial} attach="material" />
        </mesh>
        
        {/* High Command Bridge */}
        <mesh position={[0, 5, 0]}>
          <cylinderGeometry args={[3.5, 3.5, 4, 16]} />
          <primitive object={imperialHullMaterial} attach="material" />
        </mesh>
        
        {/* Central Command Core */}
        <mesh>
          <cylinderGeometry args={[4.5, 4.5, 8, 20]} />
          <primitive object={imperialHullMaterial} attach="material" />
        </mesh>
        
        {/* Strategic Operations Center */}
        <mesh position={[0, -4.5, 0]}>
          <cylinderGeometry args={[4.5, 3.8, 3, 16]} />
          <primitive object={commandMaterial} attach="material" />
        </mesh>
        
        {/* Imperial Intelligence Hub */}
        <mesh position={[0, -7, 0]}>
          <cylinderGeometry args={[3.8, 3.2, 2, 12]} />
          <primitive object={defenseMaterial} attach="material" />
        </mesh>
      </group>
      
      {/* COMMAND AUTHORITY RING */}
      <mesh ref={commandRingRef} rotation={[Math.PI / 2, 0, 0]} position={[0, 1, 0]}>
        <torusGeometry args={[8, 1.5, 20, 40]} />
        <primitive object={commandMaterial} attach="material" />
      </mesh>
      
      {/* DEFENSE COORDINATION RING */}
      <mesh ref={defenseRingRef} rotation={[Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <torusGeometry args={[11, 1.2, 16, 32]} />
        <primitive object={defenseMaterial} attach="material" />
      </mesh>
      
      {/* OUTER PERIMETER RING */}
      <mesh ref={outerRingRef} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <torusGeometry args={[14, 0.8, 12, 24]} />
        <primitive object={structuralMaterial} attach="material" />
      </mesh>
      
      {/* IMPERIAL FLEET COMMAND PLATFORM */}
      <group position={[0, -9, 0]}>
        {/* Main Command Deck */}
        <mesh>
          <cylinderGeometry args={[7, 7, 1, 20]} />
          <primitive object={commandMaterial} attach="material" />
        </mesh>
        
        {/* Fleet Coordination Centers */}
        {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
          <mesh key={i} position={[Math.cos(angle) * 5, 0.8, Math.sin(angle) * 5]}>
            <cylinderGeometry args={[1.5, 1.5, 1.6, 12]} />
            <primitive object={imperialHullMaterial} attach="material" />
          </mesh>
        ))}
        
        {/* Central Fleet Beacon */}
        <mesh position={[0, 2, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 4, 12]} />
          <primitive object={glowMaterial} attach="material" />
        </mesh>
        
        {/* Landing Approach Guidance */}
        {[0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4, Math.PI, (5 * Math.PI) / 4, (3 * Math.PI) / 2, (7 * Math.PI) / 4].map((angle, i) => (
          <mesh key={i} position={[Math.cos(angle) * 6.5, 0.1, Math.sin(angle) * 6.5]}>
            <boxGeometry args={[0.8, 0.2, 0.3]} />
            <primitive object={glowMaterial} attach="material" />
          </mesh>
        ))}
      </group>
      
      {/* IMPERIAL FLEET HANGARS */}
      <group ref={hangarRef}>
        {/* Capital Ship Hangar */}
        <mesh position={[0, 0, 8]}>
          <boxGeometry args={[6, 4, 3]} />
          <meshStandardMaterial 
            color="#555555" 
            metalness={0.85} 
            roughness={0.15}
            emissive="#888888"
            emissiveIntensity={0.25}
          />
        </mesh>
        
        {/* Destroyer Hangars */}
        {[8, -8].map((x, i) => (
          <mesh key={i} position={[x, 0, 0]} rotation={[0, x > 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
            <boxGeometry args={[4, 3, 2.5]} />
            <meshStandardMaterial 
              color="#666666" 
              metalness={0.8} 
              roughness={0.2}
              emissive="#999999"
              emissiveIntensity={0.2}
            />
          </mesh>
        ))}
        
        {/* Fighter Squadron Bays */}
        {[6, -6].map((z, i) => (
          <mesh key={i} position={[0, -2, z]}>
            <boxGeometry args={[4, 2, 2]} />
            <meshStandardMaterial 
              color="#777777" 
              metalness={0.75} 
              roughness={0.25}
              emissive="#aaaaaa"
              emissiveIntensity={0.15}
            />
          </mesh>
        ))}
      </group>
      
      {/* IMPERIAL BEACON ARRAY */}
      <group ref={navLightsRef}>
        {[0, Math.PI / 3, (2 * Math.PI) / 3, Math.PI, (4 * Math.PI) / 3, (5 * Math.PI) / 3].map((angle, i) => (
          <mesh key={i} position={[Math.cos(angle) * 12, 3, Math.sin(angle) * 12]}>
            <sphereGeometry args={[0.3, 12, 12]} />
            <primitive object={navLightMaterial} attach="material" />
          </mesh>
        ))}
      </group>
      
      {/* IMPERIAL POWER GRID */}
      {[0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4, Math.PI, (5 * Math.PI) / 4, (3 * Math.PI) / 2, (7 * Math.PI) / 4].map((angle, i) => (
        <group key={i} rotation={[0, angle, 0]} position={[0, 2, 0]}>
          <mesh position={[15, 0, 0]}>
            <boxGeometry args={[4, 0.1, 6]} />
            <meshStandardMaterial 
              color="#555555" 
              metalness={0.9} 
              roughness={0.1}
              emissive="#888888"
              emissiveIntensity={0.15}
            />
          </mesh>
          {/* Power coupling */}
          <mesh position={[13, 0, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 3, 8]} />
            <primitive object={structuralMaterial} attach="material" />
          </mesh>
        </group>
      ))}
      
      {/* IMPERIAL DOCKING COMMAND */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
        <group key={i} rotation={[0, angle, 0]}>
          <mesh position={[5.5, 0, 0]}>
            <cylinderGeometry args={[1, 1, 2, 16]} />
            <meshStandardMaterial 
              color="#999999" 
              metalness={0.9} 
              roughness={0.1}
              emissive="#bbbbbb"
              emissiveIntensity={0.25}
            />
          </mesh>
          {/* Docking clamps */}
          {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((clampAngle, j) => (
            <mesh key={j} position={[5.5 + Math.cos(clampAngle) * 1.2, Math.sin(clampAngle) * 1.2, 0]}>
              <boxGeometry args={[0.3, 0.3, 0.5]} />
              <primitive object={glowMaterial} attach="material" />
            </mesh>
          ))}
        </group>
      ))}
      
      {/* IMPERIAL IDENTIFICATION */}
      <Text 
        position={[0, -12, 0]} 
        fontSize={0.8} 
        color="#ffffff" 
        anchorX="center"
        outlineWidth={0.04}
        outlineColor="#000000"
      >
        IMPERIAL COMMAND CITADEL
      </Text>
      
      <Text 
        position={[0, -13, 0]} 
        fontSize={0.35} 
        color="#cccccc" 
        anchorX="center"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        ATX GALACTIC EMPIRE • SECTOR ZERO
      </Text>
      
      <Text 
        position={[0, -13.8, 0]} 
        fontSize={0.25} 
        color="#aaaaaa" 
        anchorX="center"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        Supreme Fleet Command & Strategic Operations
      </Text>
    </group>
  );
};
