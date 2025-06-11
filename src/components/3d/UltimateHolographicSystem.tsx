'use client'
import { useState, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { useAdvancedCamera } from './AdvancedCameraController'
import InstancedStarField from './InstancedStarField'

interface UltimatePlanetProps {
  position: [number, number, number]
  planetName: string
  planetSubtitle: string
  planetData: string
  planetColor: string
  appRoute: string
  onSelect: (planetData: any, planetPos: THREE.Vector3) => void
}

function UltimatePlanet({ position, planetName, planetSubtitle, planetData, planetColor, appRoute, onSelect }: UltimatePlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const [hovered, setHovered] = useState(false)
  
  // Planet rotation animation
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2
      meshRef.current.rotation.x += delta * 0.1
    }
  })

  const handlePointerDown = (e: any) => {
    e.stopPropagation()
    console.log('🎯 ULTIMATE planet selection:', planetName)
    
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
      {/* ULTIMATE Planet with holographic glow */}
      <mesh
        ref={meshRef}
        onPointerDown={handlePointerDown}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        scale={hovered ? 1.2 : 1}
      >
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshStandardMaterial
          color={planetColor}
          emissive={hovered ? planetColor : '#000000'}
          emissiveIntensity={hovered ? 0.4 : 0.1}
          roughness={0.6}
          metalness={0.4}
        />
      </mesh>

      {/* Holographic planetary ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <ringGeometry args={[3.2, 3.6, 64]} />
        <meshBasicMaterial
          color={planetColor}
          transparent
          opacity={hovered ? 0.6 : 0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Planet label floating above */}
      <Text
        position={[0, 4, 0]}
        fontSize={0.4}
        color={planetColor}
        anchorX="center"
        anchorY="middle"
      >
        {planetName}
      </Text>
    </group>
  )
}

interface UltimateHolographicPanelProps {
  position: [number, number, number]
  planetData: any
  visible: boolean
  onClose: () => void
  onAccess: (route: string) => void
}

function UltimateHolographicPanel({ position, planetData, visible, onClose, onAccess }: UltimateHolographicPanelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (groupRef.current && visible) {
      // Holographic floating animation
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.1
    }
  })

  if (!visible) return null

  const handleAccess = () => {
    console.log('🚀 ULTIMATE ACCESS:', planetData.appRoute)
    onAccess(planetData.appRoute)
  }

  return (
    <group ref={groupRef} position={position}>
      {/* Holographic Panel Background */}
      <RoundedBox
        args={[5, 4, 0.1]}
        radius={0.1}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <meshBasicMaterial
          color={planetData.color}
          transparent
          opacity={0.1}
          wireframe
        />
      </RoundedBox>

      {/* Holographic Border with glow */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(5, 4, 0.1)]} />
        <lineBasicMaterial color={planetData.color} transparent opacity={0.8} />
      </lineSegments>

      {/* Planet Name */}
      <Text
        position={[0, 1.3, 0.06]}
        fontSize={0.4}
        color={planetData.color}
        anchorX="center"
        anchorY="middle"
      >
        {planetData.name}
      </Text>

      {/* Subtitle */}
      <Text
        position={[0, 0.7, 0.06]}
        fontSize={0.2}
        color="#88ccff"
        anchorX="center"
        anchorY="middle"
      >
        {planetData.subtitle}
      </Text>

      {/* Data */}
      <Text
        position={[0, 0.2, 0.06]}
        fontSize={0.15}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {planetData.data}
      </Text>

      {/* ACCESS Button */}
      <group position={[-1, -0.8, 0.06]} onClick={handleAccess}>
        <RoundedBox args={[1.5, 0.4, 0.05]} radius={0.05}>
          <meshBasicMaterial color={planetData.color} transparent opacity={0.8} />
        </RoundedBox>
        <Text
          position={[0, 0, 0.03]}
          fontSize={0.15}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          ACCESS
        </Text>
      </group>

      {/* EXIT Button */}
      <group position={[1, -0.8, 0.06]} onClick={onClose}>
        <RoundedBox args={[1.5, 0.4, 0.05]} radius={0.05}>
          <meshBasicMaterial color="#666666" transparent opacity={0.8} />
        </RoundedBox>
        <Text
          position={[0, 0, 0.03]}
          fontSize={0.15}
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

export default function UltimateHolographicSystem() {
  const [selectedPlanet, setSelectedPlanet] = useState<any>(null)
  const [panelPosition, setPanelPosition] = useState<[number, number, number]>([0, 0, 0])
  const [showPanel, setShowPanel] = useState(false)
  const { transitionToTarget, enableFreeNavigation } = useAdvancedCamera()

  const planets = [
    {
      position: [-8, 4, -3] as [number, number, number],
      planetName: 'VETNAV-7',
      planetSubtitle: 'Veterans Benefits Navigator',
      planetData: '18.2M Veterans',
      planetColor: '#4a9eff',
      appRoute: '/vetnav'
    },
    {
      position: [12, -2, 8] as [number, number, number],
      planetName: 'TARIFF-7',
      planetSubtitle: 'Trade Command Station',
      planetData: '2.4B Trade Records',
      planetColor: '#ff6b47',
      appRoute: '/tariff-explorer'
    },
    {
      position: [-5, -6, 12] as [number, number, number],
      planetName: 'PET-RADAR-9',
      planetSubtitle: 'Animal Rescue Network',
      planetData: '847K Pet Records',
      planetColor: '#9d4edd',
      appRoute: '/pet-radar'
    },
    {
      position: [7, 8, -6] as [number, number, number],
      planetName: 'JETS-HOME',
      planetSubtitle: 'Sports Analytics Hub',
      planetData: '156K Game Stats',
      planetColor: '#06ffa5',
      appRoute: '/jets-home'
    }
  ]

  const handlePlanetSelection = (planetData: any, planetPos: THREE.Vector3) => {
    console.log('🚀 ULTIMATE SELECTION:', planetData.name)
    
    // MATHEMATICAL CAMERA TRANSITION
    transitionToTarget(planetPos, 2.5, () => {
      // After cinematic landing, show holographic panel
      const panelPos: [number, number, number] = [
        planetPos.x + 6,
        planetPos.y + 2,
        planetPos.z
      ]
      
      setSelectedPlanet(planetData)
      setPanelPosition(panelPos)
      setShowPanel(true)
      
      console.log('🎬 ULTIMATE HUD materialized!')
    })
  }

  const handleClosePanel = () => {
    console.log('🔄 ULTIMATE EXIT - Returning to overview')
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
      {/* Ambient lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.2} />
      
      {/* INSTANCED STAR FIELD - Performance Beast Mode */}
      <InstancedStarField count={5000} />
      
      {/* ULTIMATE Planets */}
      {planets.map((planet, index) => (
        <UltimatePlanet
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
