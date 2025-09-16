"use client";

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface NebulaCloudProps {
  position: [number, number, number];
  color: string;
  scale: number;
  particleCount: number;
  animationSpeed: number;
}

const NebulaCloud = ({ position, color, scale, particleCount, animationSpeed }: NebulaCloudProps) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      // Create organic cloud-like distribution
      const radius = (Math.random() * 0.8 + 0.2) * scale;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      // Add some noise for organic shape
      const noise = (Math.random() - 0.5) * 0.3;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta) + noise;
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) + noise;
      positions[i * 3 + 2] = radius * Math.cos(phi) + noise;
    }
    return positions;
  }, [particleCount, scale]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += animationSpeed * 0.01;
      pointsRef.current.rotation.x += animationSpeed * 0.005;
      
      // Subtle breathing effect
      const breathe = 1 + Math.sin(state.clock.elapsedTime * animationSpeed * 0.5) * 0.1;
      pointsRef.current.scale.setScalar(breathe);
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
          size={0.08}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
};

interface NebulaSystemProps {
  intensity?: number;
  scale?: number;
  animated?: boolean;
}

export const NebulaSystem = ({ intensity = 1.0, scale = 1.0, animated = true }: NebulaSystemProps) => {
  const systemRef = useRef<THREE.Group>(null);

  // Define nebula configurations based on alien textures
  const nebulaClouds = useMemo(() => [
    {
      position: [-40, 20, -60] as [number, number, number],
      color: '#4a9eff', // Blue nebula (alien soil acid puddles inspired)
      scale: 25 * scale,
      particleCount: 300,
      animationSpeed: 0.5
    },
    {
      position: [35, -15, -45] as [number, number, number],
      color: '#ff6b47', // Orange-red nebula (rust brown inspired)
      scale: 30 * scale,
      particleCount: 400,
      animationSpeed: 0.3
    },
    {
      position: [-20, -25, 40] as [number, number, number],
      color: '#9d4edd', // Purple nebula (alien sand inspired)
      scale: 20 * scale,
      particleCount: 250,
      animationSpeed: 0.7
    },
    {
      position: [45, 30, 20] as [number, number, number],
      color: '#10b981', // Green nebula (swamp stream inspired)
      scale: 18 * scale,
      particleCount: 200,
      animationSpeed: 0.4
    },
    {
      position: [0, -35, -30] as [number, number, number],
      color: '#f59e0b', // Golden nebula (lava cracked inspired)
      scale: 22 * scale,
      particleCount: 350,
      animationSpeed: 0.6
    }
  ], [scale]);

  // System-wide rotation
  useFrame((state, delta) => {
    if (systemRef.current && animated) {
      systemRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <group ref={systemRef} scale={intensity}>
      {/* Background cosmic dust */}
      <Points
        positions={useMemo(() => {
          const positions = new Float32Array(1500 * 3);
          for (let i = 0; i < 1500; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 200;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
          }
          return positions;
        }, [])}
        stride={3}
        frustumCulled={false}
      >
        <PointMaterial
          transparent
          color="#ffffff"
          size={0.02}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.3}
        />
      </Points>

      {/* Nebula clouds */}
      {nebulaClouds.map((cloud, index) => (
        <NebulaCloud
          key={index}
          position={cloud.position}
          color={cloud.color}
          scale={cloud.scale}
          particleCount={cloud.particleCount}
          animationSpeed={cloud.animationSpeed}
        />
      ))}

      {/* Cosmic fog layers */}
      <group>
        {[0, 60, 120].map((rotationOffset, index) => (
          <mesh key={index} rotation={[0, (rotationOffset * Math.PI) / 180, 0]}>
            <Sphere args={[80, 32, 16]}>
              <meshBasicMaterial
                color="#1a1a2e"
                transparent
                opacity={0.1}
                side={THREE.BackSide}
                blending={THREE.AdditiveBlending}
              />
            </Sphere>
          </mesh>
        ))}
      </group>
    </group>
  );
};