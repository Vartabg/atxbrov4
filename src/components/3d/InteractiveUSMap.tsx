"use client";

import { useRef, useState, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { US_STATES_DATA, StateData, BENEFITS_CATEGORIES } from '../../data/usStatesData';

interface StateMarkerProps {
  stateData: StateData;
  onClick: (state: StateData) => void;
  isSelected: boolean;
}

const StateMarker = ({ stateData, onClick, isSelected }: StateMarkerProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  // Create dynamic material based on veteran population
  const material = useMemo(() => {
    const intensity = Math.min(stateData.veteranPopulation / 1000000, 1); // Normalize to 1M max
    const baseColor = new THREE.Color(stateData.color);
    const emissiveColor = baseColor.clone().multiplyScalar(0.3);
    
    return new THREE.MeshStandardMaterial({
      color: baseColor,
      emissive: hovered || isSelected ? emissiveColor : '#000000',
      emissiveIntensity: hovered || isSelected ? 0.4 : 0,
      metalness: 0.2,
      roughness: 0.8,
      transparent: true,
      opacity: 0.7 + (intensity * 0.3)
    });
  }, [stateData.color, stateData.veteranPopulation, hovered, isSelected]);

  // Calculate marker size based on veteran population
  const markerSize = useMemo(() => {
    const baseSize = 0.5;
    const populationFactor = Math.log(stateData.veteranPopulation / 100000) * 0.2;
    return baseSize + Math.max(0, populationFactor);
  }, [stateData.veteranPopulation]);

  // Convert lat/lon to 3D coordinates
  const position = useMemo(() => {
    const [lon, lat] = stateData.position;
    // Convert to normalized coordinates for display
    const x = (lon + 120) * 0.1; // Normalize longitude
    const z = (lat - 35) * 0.15;  // Normalize latitude
    const y = Math.log(stateData.veteranPopulation / 100000) * 0.3; // Height by population
    return [x, y, z] as [number, number, number];
  }, [stateData.position, stateData.veteranPopulation]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Subtle rotation animation
      meshRef.current.rotation.y += delta * 0.2;
      
      // Floating animation when hovered
      if (hovered || isSelected) {
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      } else {
        meshRef.current.position.y = THREE.MathUtils.lerp(
          meshRef.current.position.y, 
          position[1], 
          delta * 2
        );
      }
    }
  });

  return (
    <group position={position}>
      {/* State marker */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick(stateData);
        }}
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
        <cylinderGeometry args={[markerSize, markerSize * 0.8, markerSize * 2, 8]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* State label */}
      {(hovered || isSelected) && (
        <Text
          position={[0, markerSize * 3, 0]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {stateData.code}
        </Text>
      )}

      {/* Population indicator */}
      {hovered && (
        <Text
          position={[0, markerSize * 3.5, 0]}
          fontSize={0.2}
          color="#cccccc"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#000000"
        >
          {(stateData.veteranPopulation / 1000).toFixed(0)}K Veterans
        </Text>
      )}

      {/* Benefits indicators */}
      {isSelected && (
        <group>
          {/* Disability benefits ring */}
          <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[markerSize * 1.5, 0.05, 8, 16]} />
            <meshBasicMaterial color={BENEFITS_CATEGORIES.disability.color} transparent opacity={0.6} />
          </mesh>
          
          {/* Education benefits ring */}
          <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[markerSize * 1.8, 0.05, 8, 16]} />
            <meshBasicMaterial color={BENEFITS_CATEGORIES.education.color} transparent opacity={0.6} />
          </mesh>
          
          {/* Healthcare benefits ring */}
          <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[markerSize * 2.1, 0.05, 8, 16]} />
            <meshBasicMaterial color={BENEFITS_CATEGORIES.healthcare.color} transparent opacity={0.6} />
          </mesh>
        </group>
      )}
    </group>
  );
};

interface InteractiveUSMapProps {
  onStateSelect?: (state: StateData | null) => void;
  selectedStateCode?: string;
}

export const InteractiveUSMap = ({ onStateSelect, selectedStateCode }: InteractiveUSMapProps) => {
  const mapRef = useRef<THREE.Group>(null);
  const [selectedState, setSelectedState] = useState<StateData | null>(null);

  // Handle state selection
  const handleStateClick = useCallback((state: StateData) => {
    const newSelection = selectedState?.code === state.code ? null : state;
    setSelectedState(newSelection);
    onStateSelect?.(newSelection);
  }, [selectedState, onStateSelect]);

  // Create US map base (simplified representation)
  const mapGeometry = useMemo(() => {
    const points = [];
    // Create a simplified US outline
    for (let i = 0; i <= 50; i++) {
      const angle = (i / 50) * Math.PI * 2;
      points.push(new THREE.Vector2(
        Math.cos(angle) * 8 + Math.sin(angle * 3) * 2,
        Math.sin(angle) * 4 + Math.cos(angle * 2) * 1.5
      ));
    }
    return new THREE.ShapeGeometry(new THREE.Shape(points));
  }, []);

  // Animate map rotation
  useFrame((state, delta) => {
    if (mapRef.current) {
      mapRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group ref={mapRef}>
      {/* Map base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <primitive object={mapGeometry} attach="geometry" />
        <meshStandardMaterial
          color="#1a365d"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* State markers */}
      {US_STATES_DATA.map((state) => (
        <StateMarker
          key={state.code}
          stateData={state}
          onClick={handleStateClick}
          isSelected={selectedState?.code === state.code || selectedStateCode === state.code}
        />
      ))}

      {/* Ambient particles for atmosphere */}
      <group>
        {Array.from({ length: 100 }).map((_, i) => (
          <mesh
            key={i}
            position={[
              (Math.random() - 0.5) * 20,
              Math.random() * 5,
              (Math.random() - 0.5) * 15
            ]}
          >
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.3}
            />
          </mesh>
        ))}
      </group>

      {/* Title */}
      <Text
        position={[0, 5, 0]}
        fontSize={0.8}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.04}
        outlineColor="#000000"
      >
        Veterans Benefits by State
      </Text>

      {/* Legend */}
      <group position={[-8, 3, 0]}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="left"
          anchorY="middle"
        >
          Legend:
        </Text>
        <Text
          position={[0, -0.5, 0]}
          fontSize={0.2}
          color="#cccccc"
          anchorX="left"
          anchorY="middle"
        >
          • Height = Veteran Population
        </Text>
        <Text
          position={[0, -0.8, 0]}
          fontSize={0.2}
          color="#cccccc"
          anchorX="left"
          anchorY="middle"
        >
          • Color = State Benefits Program
        </Text>
        <Text
          position={[0, -1.1, 0]}
          fontSize={0.2}
          color="#cccccc"
          anchorX="left"
          anchorY="middle"
        >
          • Click for Details
        </Text>
      </group>
    </group>
  );
};