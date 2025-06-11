'use client'
import { useState, useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, RoundedBox, Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { useAdvancedCamera } from './AdvancedCameraController'
import InstancedStarField from './InstancedStarField'
import { SpaceStation } from './SpaceStation'

// ENHANCED PARTICLE RING SYSTEM
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
      const radius = 3.5 + Math.random() * 0.4;
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
        size={hovered ? 0.8 : 0.5}
      >
        <PointMaterial 
          color={color} 
          transparent 
          opacity={hovered ? 0.8 : 0.6} 
          size={2}
          sizeAttenuation={true}
        />
      </Points>
    </group>
  );
};

// ULTIMATE ENHANCED PLANET
interface UltimatePlanetProps {
  position: [number, number, number]
  planetName: string
  planetSubtitle: string
  planetData: string
  planetColor: string
  appRoute: string
  onSelect: (planetData: any, planetPos: THREE.Vector3) => void
}

function UltimateEnhancedPlanet({ position, planetName, planetSubtitle, planetData, planetColor, appRoute, onSelect }: UltimatePlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const glowRef = useRef<THREE.Mesh>(null!)
  const [hovered, setHovered] = useState(false)
  
  // Enhanced materials with PBR
  const planetMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: planetColor,
    metalness: 0.2,
    roughness: 0.8,
    emissive: hovered ? planetColor : '#000000',
    emissiveIntensity: hovered ? 0.4 : 0.15,
  }), [planetColor, hovered])

  const atmosphereMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: planetColor,
    transparent: true,
    opacity: hovered ? 0.4 : 0.2,
    side: THREE.BackSide
  }), [planetColor, hovered])
  
  // Planet animations
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3
      meshRef.current.rotation.x += delta * 0.05
    }
    if (glowRef.current) {
      glowRef.current.rotation.y -= delta * 0.2
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1
      glowRef.current.scale.setScalar(pulse)
    }
  })

  const handlePointerDown = (e: any) => {
    e.stopPropagation()
    console.log('🎯 ULTIMATE ENHANCED planet selection:', planetName)
    
    const planetPos = new THREE.Vector3(...position)
    const planetDataObj = {
      name: planetName,
      subtitle: planetSubtitle,
      data: planetData,
      color: planetColor,
      appRoute: appRoute
    }
    
    onSelect(planetDataObj, planetPos)
  }

  return (
    <group position={position}>
      {/* Atmospheric glow */}
      <mesh ref={glowRef} scale={1.2}>
        <sphereGeometry args={[2.8, 32, 32]} />
        <primitive object={atmosphereMaterial} />
      </mesh>

      {/* Main planet */}
      <mesh
        ref={meshRef}
        onPointerDown={handlePointerDown}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        scale={hovered ? 1.1 : 1}
      >
        <sphereGeometry args={[2.5, 64, 64]} />
        <primitive object={planetMaterial} />
      </mesh>

      {/* Enhanced particle ring */}
      <ParticleRing position={[0, 0, 0]} color={planetColor} hovered={hovered} />

      {/* Holographic planet label */}
      <Text
        position={[0, 4.5, 0]}
        fontSize={0.5}
        color={planetColor}
        anchorX="center"
        anchorY="middle"
      >
        {planetName}
      </Text>

      <Text
        position={[0, 3.8, 0]}
        fontSize={0.25}
        color="#88ccff"
        anchorX="center"
        anchorY="middle"
      >
        {planetSubtitle}
      </Text>
    </group>
  )
}

// ULTIMATE HOLOGRAPHIC PANEL (same as before but enhanced)
interface UltimateHolographicPanelProps {
  position: [number, number, number]
  planetData: any
  visible: boolean
  onClose: () => void
  onAccess: (route: string) => void
}

function UltimateHolographicPanel({ position, planetData, visible, onClose, onAccess }: UltimateHolographicPanelProps) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current && visible) {
      // Enhanced holographic floating
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.15
      
      // Holographic shimmer effect
      const shimmer = Math.sin(state.clock.elapsedTime * 4) * 0.1 + 0.9
      groupRef.current.scale.setScalar(shimmer)
    }
  })

  if (!visible) return null

  const handleAccess = () => {
    console.log('🚀 ULTIMATE ACCESS:', planetData.appRoute)
    onAccess(planetData.appRoute)
  }

  return (
    <group ref={groupRef} position={position}>
      {/* Enhanced holographic frame */}
      <RoundedBox args={[6, 5, 0.1]} radius={0.15}>
        <meshBasicMaterial
          color={planetData.color}
          transparent
          opacity={0.15}
          wireframe
        />
      </RoundedBox>

      {/* Holographic border with enhanced glow */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(6, 5, 0.1)]} />
        <lineBasicMaterial 
          color={planetData.color} 
          transparent 
          opacity={0.9}
          linewidth={2}
        />
      </lineSegments>

      {/* Enhanced content layout */}
      <Text
        position={[0, 1.8, 0.06]}
        fontSize={0.5}
        color={planetData.color}
        anchorX="center"
        anchorY="middle"
      >
        {planetData.name}
      </Text>

      <Text
        position={[0, 1.2, 0.06]}
        fontSize={0.25}
        color="#88ccff"
        anchorX="center"
        anchorY="middle"
      >
        {planetData.subtitle}
      </Text>

      <Text
        position={[0, 0.6, 0.06]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {planetData.data}
      </Text>

      {/* Enhanced interactive buttons */}
      <group position={[-1.5, -1.2, 0.06]} onClick={handleAccess}>
        <RoundedBox args={[2, 0.6, 0.1]} radius={0.1}>
          <meshBasicMaterial 
            color={planetData.color} 
            transparent 
            opacity={0.8}
            emissive={planetData.color}
            emissiveIntensity={0.2}
          />
        </RoundedBox>
        <Text
          position={[0, 0, 0.06]}
          fontSize={0.2}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          ACCESS
        </Text>
      </group>

      <group position={[1.5, -1.2, 0.06]} onClick={onClose}>
        <RoundedBox args={[2, 0.6, 0.1]} radius={0.1}>
          <meshBasicMaterial 
            color="#666666" 
            transparent 
            opacity={0.8}
          />
        </RoundedBox>
        <Text
          position={[0, 0, 0.06]}
          fontSize={0.2}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          EXIT
        </Text>
      </group>
    </group>
  )
}

export default function UltimateVisualSystem() {
  const [selectedPlanet, setSelectedPlanet] = useState<any>(null)
  const [panelPosition, setPanelPosition] = useState<[number, number, number]>([0, 0, 0])
  const [showPanel, setShowPanel] = useState(false)
  const { transitionToTarget, enableFreeNavigation } = useAdvancedCamera()

  const planets = [
    {
      position: [-12, 6, -5] as [number, number, number],
      planetName: 'VETNAV-7',
      planetSubtitle: 'Veterans Benefits Navigator',
      planetData: '18.2M Veterans',
      planetColor: '#4a9eff',
      appRoute: '/vetnav'
    },
    {
      position: [15, -3, 10] as [number, number, number],
      planetName: 'TARIFF-7',
      planetSubtitle: 'Trade Command Station',
      planetData: '2.4B Trade Records',
      planetColor: '#ff6b47',
      appRoute: '/tariff-explorer'
    },
    {
      position: [-8, -8, 15] as [number, number, number],
      planetName: 'PET-RADAR-9',
      planetSubtitle: 'Animal Rescue Network',
      planetData: '847K Pet Records',
      planetColor: '#9d4edd',
      appRoute: '/pet-radar'
    },
    {
      position: [10, 12, -8] as [number, number, number],
      planetName: 'JETS-HOME',
      planetSubtitle: 'Sports Analytics Hub',
      planetData: '156K Game Stats',
      planetColor: '#06ffa5',
      appRoute: '/jets-home'
    }
  ]

  const handlePlanetSelection = (planetData: any, planetPos: THREE.Vector3) => {
    console.log('🚀 ULTIMATE ENHANCED SELECTION:', planetData.name)
    
    // MATHEMATICAL CAMERA TRANSITION
    transitionToTarget(planetPos, 2.5, () => {
      // After cinematic landing, show enhanced holographic panel
      const panelPos: [number, number, number] = [
        planetPos.x + 7,
        planetPos.y + 3,
        planetPos.z
      ]
      
      setSelectedPlanet(planetData)
      setPanelPosition(panelPos)
      setShowPanel(true)
      
      console.log('🎬 ULTIMATE ENHANCED HUD materialized!')
    })
  }

  const handleClosePanel = () => {
    console.log('🔄 ULTIMATE EXIT - Returning to Imperial Command')
    setShowPanel(false)
    setSelectedPlanet(null)
    
    // MATHEMATICAL CAMERA RETURN
    enableFreeNavigation()
  }

  const handleAccess = (route: string) => {
    console.log('🎯 ULTIMATE ACCESS:', route)
    window.location.href = route
  }

  return (
    <>
      {/* Enhanced ambient lighting */}
      <ambientLight intensity={0.3} color="#ffffff" />
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.8}
        color="#ffffff"
        castShadow
      />
      
      {/* INSTANCED STAR FIELD - Performance Beast Mode */}
      <InstancedStarField count={5000} />
      
      {/* IMPERIAL COMMAND CITADEL */}
      <SpaceStation onClick={() => console.log('Imperial Command Citadel activated')} />
      
      {/* ULTIMATE ENHANCED Planets */}
      {planets.map((planet, index) => (
        <UltimateEnhancedPlanet
          key={index}
          {...planet}
          onSelect={handlePlanetSelection}
        />
      ))}
      
      {/* ULTIMATE Holographic Panel */}
      {selectedPlanet && (
        <UltimateHolographicPanel
          position={panelPosition}
          planetData={selectedPlanet}
          visible={showPanel}
          onClose={handleClosePanel}
          onAccess={handleAccess}
        />
      )}
    </>
  )
}
