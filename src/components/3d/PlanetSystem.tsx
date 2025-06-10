"use client";

import { useRef, useState, useMemo, Suspense } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Text, Points, PointMaterial } from '@react-three/drei';
import { TextureLoader } from 'three/src/loaders/TextureLoader';
import * as THREE from 'three';

interface PlanetProps {
  position: [number, number, number];
  color: string;
  emissive: string;
  name: string;
  onClick: () => void;
  textureSet?: string;
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

const TexturedPlanet = ({ position, color, emissive, name, onClick, textureSet }: PlanetProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  // Load Adobe textures
  const [baseColor, normal, roughness, ao] = useLoader(TextureLoader, [
    `/textures/${textureSet}_BaseColor.png`,
    `/textures/${textureSet}_Normal.png`,
    `/textures/${textureSet}_Roughness.png`,
    `/textures/${textureSet}_AmbientOcclusion.png`
  ]);

  // Configure textures
  useMemo(() => {
    [baseColor, normal, roughness, ao].forEach(texture => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.flipY = false;
    });
    baseColor.colorSpace = THREE.SRGBColorSpace;
  }, [baseColor, normal, roughness, ao]);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
      
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
        <sphereGeometry args={[1.2, 64, 64]} />
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
      </mesh>
      
      {hovered && (
        <mesh>
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshBasicMaterial 
            color={emissive}
            transparent
            opacity={0.2}
            side={THREE.BackSide}
          />
        </mesh>
      )}
      
      <ParticleRing position={[0, 0, 0]} color={emissive} hovered={hovered} />
      
      <Text 
        position={[0, 2.5, 0]} 
        fontSize={0.35} 
        color="#ffffff" 
        anchorX="center"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {name}
      </Text>
    </group>
  );
};

const FallbackPlanet = ({ position, color, emissive, name, onClick }: PlanetProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
      
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
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshStandardMaterial 
          color={color} 
          emissive={emissive} 
          emissiveIntensity={hovered ? 0.6 : 0.3}
          metalness={0.2}
          roughness={0.8}
        />
      </mesh>
      
      {hovered && (
        <mesh>
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshBasicMaterial 
            color={emissive}
            transparent
            opacity={0.2}
            side={THREE.BackSide}
          />
        </mesh>
      )}
      
      <ParticleRing position={[0, 0, 0]} color={emissive} hovered={hovered} />
      
      <Text 
        position={[0, 2.5, 0]} 
        fontSize={0.35} 
        color="#ffffff" 
        anchorX="center"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {name}
      </Text>
    </group>
  );
};

export const PlanetSystem = ({ onPlanetClick }: { onPlanetClick: (planet: string) => void }) => {
  return (
    <group>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      <Suspense fallback={<FallbackPlanet position={[-4, 2, 0]} color="#2563eb" emissive="#1e40af" name="VetNav" onClick={() => onPlanetClick('vetnav')} />}>
        <TexturedPlanet 
          position={[-4, 2, 0]}
          color="#2563eb"
          emissive="#1e40af"
          name="VetNav"
          textureSet="greenPlanet"
          onClick={() => onPlanetClick('vetnav')}
        />
      </Suspense>
      
      <Suspense fallback={<FallbackPlanet position={[4, 2, 0]} color="#10b981" emissive="#059669" name="Tariff Explorer" onClick={() => onPlanetClick('tariff')} />}>
        <TexturedPlanet 
          position={[4, 2, 0]}
          color="#10b981"
          emissive="#059669"
          name="Tariff Explorer"
          textureSet="gasPlanet"
          onClick={() => onPlanetClick('tariff')}
        />
      </Suspense>
      
      <Suspense fallback={<FallbackPlanet position={[-4, -2, 0]} color="#7c3aed" emissive="#6d28d9" name="Pet Radar" onClick={() => onPlanetClick('petradar')} />}>
        <TexturedPlanet 
          position={[-4, -2, 0]}
          color="#7c3aed"
          emissive="#6d28d9"
          name="Pet Radar"
          textureSet="desolate dirt planet"
          onClick={() => onPlanetClick('petradar')}
        />
      </Suspense>
      
      <Suspense fallback={<FallbackPlanet position={[4, -2, 0]} color="#ea580c" emissive="#dc2626" name="JetsHome" onClick={() => onPlanetClick('jetshome')} />}>
        <TexturedPlanet 
          position={[4, -2, 0]}
          color="#ea580c"
          emissive="#dc2626"
          name="JetsHome"
          textureSet="jetsSkin"
          onClick={() => onPlanetClick('jetshome')}
        />
      </Suspense>
    </group>
  );
};
