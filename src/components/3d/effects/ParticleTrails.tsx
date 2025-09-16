"use client";

import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points } from '@react-three/drei';
import * as THREE from 'three';

interface TrailPoint {
  position: THREE.Vector3;
  age: number;
  opacity: number;
}

interface ParticleTrailProps {
  targetPosition: [number, number, number];
  color: string;
  maxLength?: number;
  intensity?: number;
  animated?: boolean;
}

export const ParticleTrail = ({ 
  targetPosition, 
  color, 
  maxLength = 50, 
  intensity = 1.0, 
  animated = true 
}: ParticleTrailProps) => {
  const trailRef = useRef<THREE.Points>(null);
  const [, setTrailPoints] = useState<TrailPoint[]>([]);
  
  const positions = useMemo(() => new Float32Array(maxLength * 3), [maxLength]);
  const opacities = useMemo(() => new Float32Array(maxLength), [maxLength]);
  const sizes = useMemo(() => new Float32Array(maxLength), [maxLength]);

  // Update trail points
  useFrame((state, delta) => {
    if (!animated) return;

    setTrailPoints(prevPoints => {
      const newPoints = [...prevPoints];
      
      // Add new point at target position
      newPoints.push({
        position: new THREE.Vector3(...targetPosition),
        age: 0,
        opacity: 1.0 * intensity
      });

      // Update existing points
      const updatedPoints = newPoints
        .map(point => ({
          ...point,
          age: point.age + delta,
          opacity: Math.max(0, point.opacity - delta * 2)
        }))
        .filter(point => point.age < 2.0 && point.opacity > 0)
        .slice(-maxLength);

      // Update buffer attributes
      for (let i = 0; i < maxLength; i++) {
        if (i < updatedPoints.length) {
          const point = updatedPoints[i];
          positions[i * 3] = point.position.x;
          positions[i * 3 + 1] = point.position.y;
          positions[i * 3 + 2] = point.position.z;
          opacities[i] = point.opacity;
          sizes[i] = (1 - point.age / 2.0) * 0.1;
        } else {
          positions[i * 3] = 0;
          positions[i * 3 + 1] = 0;
          positions[i * 3 + 2] = 0;
          opacities[i] = 0;
          sizes[i] = 0;
        }
      }

      // Update geometry
      if (trailRef.current) {
        const geometry = trailRef.current.geometry;
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.opacity.needsUpdate = true;
        geometry.attributes.size.needsUpdate = true;
      }

      return updatedPoints;
    });
  });

  return (
    <points ref={trailRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={maxLength} itemSize={3} args={[positions, 3]} />
        <bufferAttribute attach="attributes-opacity" array={opacities} count={maxLength} itemSize={1} args={[opacities, 1]} />
        <bufferAttribute attach="attributes-size" array={sizes} count={maxLength} itemSize={1} args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        transparent
        opacity={intensity}
        sizeAttenuation={true}
        blending={THREE.AdditiveBlending}
        vertexColors={false}
      />
    </points>
  );
};

interface OrbitingParticlesProps {
  center: [number, number, number];
  radius: number;
  count: number;
  color: string;
  speed?: number;
  animated?: boolean;
}

export const OrbitingParticles = ({ 
  center, 
  radius, 
  count, 
  color, 
  speed = 1.0, 
  animated = true 
}: OrbitingParticlesProps) => {
  const particlesRef = useRef<THREE.Points>(null);
  
  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = radius * (0.8 + Math.random() * 0.4);
      const height = (Math.random() - 0.5) * 2;
      
      positions[i * 3] = center[0] + Math.cos(angle) * r;
      positions[i * 3 + 1] = center[1] + height;
      positions[i * 3 + 2] = center[2] + Math.sin(angle) * r;
      
      // Orbital velocity
      velocities[i * 3] = -Math.sin(angle) * speed;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
      velocities[i * 3 + 2] = Math.cos(angle) * speed;
    }
    
    return { positions, velocities };
  }, [center, radius, count, speed]);

  useFrame((state, delta) => {
    if (!animated || !particlesRef.current) return;
    
    const positionAttribute = particlesRef.current.geometry.attributes.position;
    const positions = positionAttribute.array as Float32Array;
    
    for (let i = 0; i < count; i++) {
      // Update positions
      positions[i * 3] += velocities[i * 3] * delta;
      positions[i * 3 + 1] += velocities[i * 3 + 1] * delta;
      positions[i * 3 + 2] += velocities[i * 3 + 2] * delta;
      
      // Keep particles in orbit
      const dx = positions[i * 3] - center[0];
      const dz = positions[i * 3 + 2] - center[2];
      const currentRadius = Math.sqrt(dx * dx + dz * dz);
      
      if (currentRadius > radius * 1.5 || currentRadius < radius * 0.5) {
        const angle = Math.atan2(dz, dx);
        positions[i * 3] = center[0] + Math.cos(angle) * radius;
        positions[i * 3 + 2] = center[2] + Math.sin(angle) * radius;
      }
    }
    
    positionAttribute.needsUpdate = true;
  });

  return (
    <Points positions={positions} stride={3} frustumCulled={false} ref={particlesRef}>
      <pointsMaterial
        color={color}
        size={0.05}
        transparent
        opacity={0.6}
        sizeAttenuation={true}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};

interface EnergyBeamProps {
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  intensity?: number;
  animated?: boolean;
  width?: number;
}

export const EnergyBeam = ({ 
  start, 
  end, 
  color, 
  intensity = 1.0, 
  animated = true, 
  width = 0.1 
}: EnergyBeamProps) => {
  const beamRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Create beam geometry
  const beamGeometry = useMemo(() => {
    const geometry = new THREE.CylinderGeometry(width, width, 1, 8);
    return geometry;
  }, [width]);

  // Create particle system along the beam
  const particlePositions = useMemo(() => {
    const particleCount = 20;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const t = i / (particleCount - 1);
      positions[i * 3] = THREE.MathUtils.lerp(start[0], end[0], t) + (Math.random() - 0.5) * width * 2;
      positions[i * 3 + 1] = THREE.MathUtils.lerp(start[1], end[1], t) + (Math.random() - 0.5) * width * 2;
      positions[i * 3 + 2] = THREE.MathUtils.lerp(start[2], end[2], t) + (Math.random() - 0.5) * width * 2;
    }
    
    return positions;
  }, [start, end, width]);

  // Position and orient the beam
  const beamTransform = useMemo(() => {
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);
    const direction = endVec.clone().sub(startVec);
    const distance = direction.length();
    const center = startVec.clone().add(endVec).multiplyScalar(0.5);
    
    direction.normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
    
    return { center, quaternion, distance };
  }, [start, end]);

  useFrame((state) => {
    if (!animated) return;
    
    // Animate beam intensity
    if (beamRef.current) {
      const material = beamRef.current.material as THREE.MeshBasicMaterial;
      const pulse = 0.7 + Math.sin(state.clock.elapsedTime * 4) * 0.3;
      material.opacity = pulse * intensity;
    }

    // Animate particles along the beam
    if (particlesRef.current) {
      const positionAttribute = particlesRef.current.geometry.attributes.position;
      const positions = positionAttribute.array as Float32Array;
      
      for (let i = 0; i < positions.length / 3; i++) {
        // Move particles along the beam
        const t = (i / (positions.length / 3 - 1) + state.clock.elapsedTime * 0.5) % 1;
        positions[i * 3] = THREE.MathUtils.lerp(start[0], end[0], t);
        positions[i * 3 + 1] = THREE.MathUtils.lerp(start[1], end[1], t);
        positions[i * 3 + 2] = THREE.MathUtils.lerp(start[2], end[2], t);
      }
      
      positionAttribute.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Main beam */}
      <mesh
        ref={beamRef}
        position={beamTransform.center}
        quaternion={beamTransform.quaternion}
        scale={[1, beamTransform.distance, 1]}
      >
        <primitive object={beamGeometry} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={intensity * 0.8}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Beam particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={particlePositions}
            count={particlePositions.length / 3}
            itemSize={3}
            args={[particlePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color={color}
          size={0.05}
          transparent
          opacity={intensity}
          sizeAttenuation={true}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};