"use client";

import { useRef, useState, useMemo, Suspense } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import { TextureLoader } from 'three/src/loaders/TextureLoader';
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

const LoadingPlanet = ({ position, color, emissive, name, onClick, size = 1.2 }: PlanetProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
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
          setHovered(true);
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
          setHovered(false);
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

const StationaryPlanet = ({ 
  position, 
  color, 
  emissive, 
  name, 
  onClick, 
  textureSet, 
  size = 1.2 
}: PlanetProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  // Load Adobe textures if textureSet provided
  const textures = textureSet ? useLoader(TextureLoader, [
    `/textures/${textureSet}_BaseColor.png`,
    `/textures/${textureSet}_Normal.png`,
    `/textures/${textureSet}_Roughness.png`,
    `/textures/${textureSet}_AmbientOcclusion.png`
  ]) : null;

  const [baseColor, normal, roughness, ao] = textures || [];

  // Configure textures
  useMemo(() => {
    if (textures) {
      textures.forEach(texture => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.flipY = false;
      });
      if (baseColor) baseColor.colorSpace = THREE.SRGBColorSpace;
    }
  }, [textures, baseColor]);
  
  useFrame((state, delta) => {
    // Only planet rotation, no orbital movement
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
      
      if (hovered) {
        const scale = 1.15 + Math.sin(state.clock.elapsedTime * 3) * 0.05;
        meshRef.current.scale.setScalar(scale);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), delta * 5);
      }
    }
  });
  
  return (
    <group position={position} onClick={onClick}>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
          setHovered(true);
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
          setHovered(false);
        }}
      >
        <sphereGeometry args={[size, 64, 64]} />
        {textureSet ? (
          <meshStandardMaterial 
            map={baseColor}
            normalMap={normal}
            roughnessMap={roughness}
            aoMap={ao}
            emissive={emissive}
            emissiveIntensity={hovered ? 0.3 : 0.1}
            metalness={0.1}
            roughness={0.8}
          />
        ) : (
          <meshStandardMaterial 
            color={color} 
            emissive={emissive} 
            emissiveIntensity={hovered ? 0.6 : 0.3}
            metalness={0.2}
            roughness={0.8}
          />
        )}
      </mesh>
      
      {hovered && (
        <mesh>
          <sphereGeometry args={[size * 1.3, 32, 32]} />
          <meshBasicMaterial 
            color={emissive}
            transparent
            opacity={0.2}
            side={THREE.BackSide}
          />
        </mesh>
      )}
      
      <ParticleRing position={[0, 0, 0]} color={emissive} hovered={hovered} />
    </group>
  );
};

const SpaceStation = ({ onClick }: { onClick: () => void }) => {
  const stationRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state, delta) => {
    if (stationRef.current) {
      stationRef.current.rotation.y += delta * 0.2;
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
    >
      {/* Central hub */}
      <mesh>
        <cylinderGeometry args={[1.5, 1.5, 0.8, 16]} />
        <meshStandardMaterial 
          color="#cccccc" 
          metalness={0.8} 
          roughness={0.2}
          emissive={hovered ? "#0066ff" : "#000000"}
          emissiveIntensity={hovered ? 0.2 : 0}
        />
      </mesh>
      
      {/* Rotating ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.5, 0.3, 8, 16]} />
        <meshStandardMaterial 
          color="#888888" 
          metalness={0.7} 
          roughness={0.3}
          emissive={hovered ? "#0066ff" : "#000000"}
          emissiveIntensity={hovered ? 0.1 : 0}
        />
      </mesh>
      
      {/* Docking ports */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
        <mesh key={i} position={[Math.cos(angle) * 2.5, 0, Math.sin(angle) * 2.5]}>
          <boxGeometry args={[0.3, 0.5, 0.3]} />
          <meshStandardMaterial color="#666666" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      
      {/* Central antenna */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1.5, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
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
      <SpaceStation onClick={() => onPlanetClick('station')} />
      
      {/* VetNav - Front Right */}
      <Suspense fallback={<LoadingPlanet position={[12, -3, 8]} color="#2563eb" emissive="#1e40af" name="VetNav" onClick={() => onPlanetClick('vetnav')} size={0.9} />}>
        <StationaryPlanet 
          position={[12, -3, 8]}
          color="#2563eb"
          emissive="#1e40af"
          name="VetNav"
          textureSet="greenPlanet"
          size={0.9}
          onClick={() => onPlanetClick('vetnav')}
        />
      </Suspense>
      
      {/* Tariff Explorer - Far Right */}
      <Suspense fallback={<LoadingPlanet position={[18, 2, -5]} color="#10b981" emissive="#059669" name="Tariff Explorer" onClick={() => onPlanetClick('tariff')} size={1.1} />}>
        <StationaryPlanet 
          position={[18, 2, -5]}
          color="#10b981"
          emissive="#059669"
          name="Tariff Explorer"
          textureSet="gasPlanet"
          size={1.1}
          onClick={() => onPlanetClick('tariff')}
        />
      </Suspense>
      
      {/* Pet Radar - Back Left */}
      <Suspense fallback={<LoadingPlanet position={[-10, 1, -12]} color="#7c3aed" emissive="#6d28d9" name="Pet Radar" onClick={() => onPlanetClick('petradar')} size={1.0} />}>
        <StationaryPlanet 
          position={[-10, 1, -12]}
          color="#7c3aed"
          emissive="#6d28d9"
          name="Pet Radar"
          textureSet="desolate dirt planet"
          size={1.0}
          onClick={() => onPlanetClick('petradar')}
        />
      </Suspense>
      
      {/* JetsHome - Far Left */}
      <Suspense fallback={<LoadingPlanet position={[-15, -2, 6]} color="#ea580c" emissive="#dc2626" name="JetsHome" onClick={() => onPlanetClick('jetshome')} size={1.3} />}>
        <StationaryPlanet 
          position={[-15, -2, 6]}
          color="#ea580c"
          emissive="#dc2626"
          name="JetsHome"
          textureSet="jetsSkin"
          size={1.3}
          onClick={() => onPlanetClick('jetshome')}
        />
      </Suspense>
    </group>
  );
};
