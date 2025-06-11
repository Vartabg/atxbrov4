'use client'
import { useState, useRef, useMemo, Suspense } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { Text, RoundedBox, Points, PointMaterial } from '@react-three/drei'
import { TextureLoader } from 'three/src/loaders/TextureLoader'
import * as THREE from 'three'
import { useAdvancedCamera } from './AdvancedCameraController'
import InstancedStarField from './InstancedStarField'
import { SpaceStation } from './SpaceStation'

// ENHANCED PARTICLE RING SYSTEM
const ParticleRing = ({ position, color, hovered, size }: {
  position: [number, number, number];
  color: string;
  hovered: boolean;
  size: number;
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(40 * 3);
    for (let i = 0; i < 40; i++) {
      const angle = (i / 40) * Math.PI * 2;
      const radius = 1.3 + (Math.cos(angle * 3) * 0.02);
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.8;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return positions;
  }, [size]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += hovered ? 0.02 : 0.005;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group position={position}>
      <Points
        ref={pointsRef}
        positions={particlePositions}
        size={hovered ? 1.2 : 0.8}
      >
        <PointMaterial 
          color={color} 
          transparent 
          opacity={hovered ? 0.9 : 0.7} 
          size={3}
          sizeAttenuation={true}
        />
      </Points>
    </group>
  );
};

// ULTIMATE PBR TEXTURED PLANET
interface TexturedPlanetProps {
  position: [number, number, number]
  planetName: string
  planetSubtitle: string
  planetData: string
  planetColor: string
  appRoute: string
  textureSet: string
  size: number
  onSelect: (planetData: any, planetPos: THREE.Vector3) => void
}

function UltimatePBRPlanet({ position, planetName, planetSubtitle, planetData, planetColor, appRoute, textureSet, size, onSelect }: TexturedPlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const atmosphereRef = useRef<THREE.Mesh>(null!)
  const [hovered, setHovered] = useState(false)
  
  // LOAD PBR TEXTURES WITH PROPER PATH ENCODING
  const texturePaths = useMemo(() => {
    const encodedTextureSet = textureSet.replace(/ /g, '%20')
    return [
      `/textures/${encodedTextureSet}_BaseColor.png`,
      `/textures/${encodedTextureSet}_Normal.png`,
      `/textures/${encodedTextureSet}_Roughness.png`,
      `/textures/${encodedTextureSet}_AmbientOcclusion.png`,
      `/textures/${encodedTextureSet}_Height.png`
    ]
  }, [textureSet])

  const [baseColor, normal, roughness, ao, height] = useLoader(TextureLoader, texturePaths)

  // ULTIMATE PBR MATERIAL
  const planetMaterial = useMemo(() => {
    const material = new THREE.MeshStandardMaterial({
      map: baseColor,
      normalMap: normal,
      roughnessMap: roughness,
      aoMap: ao,
      displacementMap: height,
      displacementScale: 0.1,
      color: planetColor,
      emissive: hovered ? planetColor : '#000000',
      emissiveIntensity: hovered ? 0.3 : 0.1,
    })
    
    // Configure texture properties
    if (baseColor && normal && roughness && ao && height) {
      [baseColor, normal, roughness, ao, height].forEach(texture => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping
        texture.minFilter = THREE.LinearMipmapLinearFilter
        texture.magFilter = THREE.LinearFilter
      })
    }
    
    return material
  }, [baseColor, normal, roughness, ao, height, planetColor, hovered])

  // ATMOSPHERIC GLOW MATERIAL  
  const atmosphereMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: planetColor,
    transparent: true,
    opacity: hovered ? 0.4 : 0.2,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending
  }), [planetColor, hovered])
  
  // ENHANCED ANIMATIONS
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2
      // Remove X rotation - causes pole issues
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y -= delta * 0.15
      const pulse = Math.sin(state.clock.elapsedTime * 1.5) * 0.05 + 1
      atmosphereRef.current.scale.setScalar(pulse)
    }
  })

  const handlePointerDown = (e: any) => {
    e.stopPropagation()
    console.log('🎯 ULTIMATE PBR planet selection:', planetName)
    
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
      {/* ATMOSPHERIC GLOW */}
      <mesh ref={atmosphereRef} scale={size * 1.3}>
        <sphereGeometry args={[1, 32, 32]} />
        <primitive object={atmosphereMaterial} />
      </mesh>

      {/* MAIN PBR PLANET */}
      <mesh
        ref={meshRef}
        onPointerDown={handlePointerDown}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        scale={hovered ? size * 1.05 : size}
      >
        <sphereGeometry args={[1, 64, 64]} />
        <primitive object={planetMaterial} />
      </mesh>

      {/* ENHANCED PARTICLE RING */}
      <ParticleRing position={[0, 0, 0]} color={planetColor} hovered={hovered} size={size} />

      {/* HOLOGRAPHIC LABELS */}
      <Text
        position={[0, size * 1.8, 0]}
        fontSize={0.4}
        color={planetColor}
        anchorX="center"
        anchorY="middle"
      >
        {planetName}
      </Text>

      <Text
        position={[0, size * 1.4, 0]}
        fontSize={0.2}
        color="#88ccff"
        anchorX="center"
        anchorY="middle"
      >
        {planetSubtitle}
      </Text>
    </group>
  )
}

// ULTIMATE HOLOGRAPHIC PANEL
function UltimateHolographicPanel({ position, planetData, visible, onClose, onAccess }: any) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current && visible) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.03
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.1
      
      const shimmer = Math.sin(state.clock.elapsedTime * 5) * 0.05 + 0.98
      groupRef.current.scale.setScalar(shimmer)
    }
  })

  if (!visible) return null

  return (
    <group ref={groupRef} position={position}>
      <RoundedBox args={[6, 4.5, 0.1]} radius={0.15}>
        <meshBasicMaterial
          color={planetData.color}
          transparent
          opacity={0.12}
          wireframe
        />
      </RoundedBox>

      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(6, 4.5, 0.1)]} />
        <lineBasicMaterial 
          color={planetData.color} 
          transparent 
          opacity={0.9}
        />
      </lineSegments>

      <Text position={[0, 1.5, 0.06]} fontSize={0.45} color={planetData.color} anchorX="center">
        {planetData.name}
      </Text>

      <Text position={[0, 0.9, 0.06]} fontSize={0.22} color="#88ccff" anchorX="center">
        {planetData.subtitle}
      </Text>

      <Text position={[0, 0.4, 0.06]} fontSize={0.18} color="#ffffff" anchorX="center">
        {planetData.data}
      </Text>

      <group position={[-1.3, -0.8, 0.06]} onClick={() => onAccess(planetData.appRoute)}>
        <RoundedBox args={[1.8, 0.5, 0.08]} radius={0.08}>
          <meshBasicMaterial color={planetData.color} transparent opacity={0.8} />
        </RoundedBox>
        <Text position={[0, 0, 0.05]} fontSize={0.18} color="#ffffff" anchorX="center">
          ACCESS
        </Text>
      </group>

      <group position={[1.3, -0.8, 0.06]} onClick={onClose}>
        <RoundedBox args={[1.8, 0.5, 0.08]} radius={0.08}>
          <meshBasicMaterial color="#666666" transparent opacity={0.8} />
        </RoundedBox>
        <Text position={[0, 0, 0.05]} fontSize={0.18} color="#ffffff" anchorX="center">
          EXIT
        </Text>
      </group>
    </group>
  )
}

export default function UltimateTexturedPlanets() {
  const [selectedPlanet, setSelectedPlanet] = useState<any>(null)
  const [panelPosition, setPanelPosition] = useState<[number, number, number]>([0, 0, 0])
  const [showPanel, setShowPanel] = useState(false)
  const { transitionToTarget, enableFreeNavigation } = useAdvancedCamera()

  // PLANETS WITH THEIR ACTUAL TEXTURE SETS
  const planets = [
    {
      position: [-15, 6, -8] as [number, number, number],
      planetName: 'VETNAV-7',
      planetSubtitle: 'Veterans Benefits Navigator',
      planetData: '18.2M Veterans',
      planetColor: '#4a9eff',
      appRoute: '/vetnav',
      textureSet: 'greenPlanet',
      size: 2.2
    },
    {
      position: [18, -4, 12] as [number, number, number],
      planetName: 'TARIFF-7',
      planetSubtitle: 'Trade Command Station',
      planetData: '2.4B Trade Records',
      planetColor: '#ff6b47',
      appRoute: '/tariff-explorer',
      textureSet: 'gasPlanet',
      size: 2.8
    },
    {
      position: [-12, -10, 18] as [number, number, number],
      planetName: 'PET-RADAR-9',
      planetSubtitle: 'Animal Rescue Network',
      planetData: '847K Pet Records',
      planetColor: '#9d4edd',
      appRoute: '/pet-radar',
      textureSet: 'desolate dirt planet',
      size: 2.0
    },
    {
      position: [15, 14, -12] as [number, number, number],
      planetName: 'JETS-HOME',
      planetSubtitle: 'Sports Analytics Hub',
      planetData: '156K Game Stats',
      planetColor: '#06ffa5',
      appRoute: '/jets-home',
      textureSet: 'jetsSkin',
      size: 2.4
    }
  ]

  const handlePlanetSelection = (planetData: any, planetPos: THREE.Vector3) => {
    console.log('🚀 ULTIMATE PBR SELECTION:', planetData.name)
    
    transitionToTarget(planetPos, 2.5, () => {
      const panelPos: [number, number, number] = [
        planetPos.x + 8,
        planetPos.y + 3,
        planetPos.z + 2
      ]
      
      setSelectedPlanet(planetData)
      setPanelPosition(panelPos)
      setShowPanel(true)
      
      console.log('🎬 ULTIMATE PBR HUD materialized!')
    })
  }

  const handleClosePanel = () => {
    console.log('🔄 ULTIMATE EXIT - Returning to Imperial Command')
    setShowPanel(false)
    setSelectedPlanet(null)
    enableFreeNavigation()
  }

  const handleAccess = (route: string) => {
    window.location.href = route
  }

  return (
    <>
      <ambientLight intensity={0.4} color="#ffffff" />
      <directionalLight position={[20, 20, 10]} intensity={1.2} color="#ffffff" castShadow />
      <pointLight position={[-20, 10, -10]} intensity={0.8} color="#4488ff" />
      
      <InstancedStarField count={5000} />
      <SpaceStation onClick={() => console.log('Imperial Command Citadel activated')} />
      
      {planets.map((planet, index) => (
        <Suspense key={index} fallback={null}>
          <UltimatePBRPlanet
            {...planet}
            onSelect={handlePlanetSelection}
          />
        </Suspense>
      ))}
      
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
