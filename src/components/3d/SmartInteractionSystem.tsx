'use client'
import { useState, useRef, useMemo, useCallback } from 'react'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { Text, Points, PointMaterial } from '@react-three/drei'
import { TextureLoader } from 'three/src/loaders/TextureLoader'
import * as THREE from 'three'
import { useAdvancedCamera } from './AdvancedCameraController'
import InstancedStarField from './InstancedStarField'
import { SpaceStation } from './SpaceStation'

type InteractionState = 'exploring' | 'transitioning' | 'viewing' | 'accessing'

const SmartParticleRing = ({ position, color, hovered, isActive }: {
  position: [number, number, number];
  color: string;
  hovered: boolean;
  isActive: boolean;
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(30 * 3);
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2;
      const radius = 1.25 + (Math.cos(angle * 4) * 0.03);
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      const speed = isActive ? 0.03 : hovered ? 0.015 : 0.008;
      pointsRef.current.rotation.y += speed;
    }
  });

  return (
    <group position={position}>
      <Points ref={pointsRef} positions={particlePositions}>
        <PointMaterial 
          color={color} 
          transparent 
          opacity={isActive ? 1.0 : hovered ? 0.8 : 0.6} 
          size={isActive ? 4 : hovered ? 3 : 2}
          sizeAttenuation={true}
        />
      </Points>
    </group>
  );
};

interface SmartPlanetProps {
  position: [number, number, number]
  planetName: string
  planetSubtitle: string
  planetData: string
  planetColor: string
  appRoute: string
  textureSet: string
  size: number
  onSelect: (planetData: any) => void
  modalOpen: boolean
}

function SmartPlanet({ 
  position, planetName, planetSubtitle, planetData, planetColor, appRoute, 
  textureSet, size, onSelect, modalOpen
}: SmartPlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const atmosphereRef = useRef<THREE.Mesh>(null!)
  const [hovered, setHovered] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const { gl } = useThree()
  
  const canInteract = !modalOpen && !isProcessing
  
  // Disable OrbitControls when modal is open
  useFrame(() => {
    const canvas = gl.domElement
    const controls = canvas.parentNode?.querySelector('[class*="orbitControls"]') as any
    if (controls && controls.object) {
      controls.enabled = !modalOpen
    }
  })
  
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

  const planetMaterial = useMemo(() => {
    const material = new THREE.MeshStandardMaterial({
      map: baseColor,
      normalMap: normal,
      roughnessMap: roughness,
      aoMap: ao,
      displacementMap: height,
      displacementScale: 0.08,
      color: planetColor,
      emissive: hovered ? planetColor : '#000000',
      emissiveIntensity: hovered ? 0.2 : 0.1,
    })
    
    if (baseColor && normal && roughness && ao && height) {
      [baseColor, normal, roughness, ao, height].forEach(texture => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping
        texture.minFilter = THREE.LinearMipmapLinearFilter
        texture.magFilter = THREE.LinearFilter
      })
    }
    
    return material
  }, [baseColor, normal, roughness, ao, height, planetColor, hovered])

  const atmosphereMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: planetColor,
    transparent: true,
    opacity: hovered ? 0.4 : 0.2,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending
  }), [planetColor, hovered])
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
    }
    if (atmosphereRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime) * 0.03 + 1;
      atmosphereRef.current.scale.setScalar(pulse);
    }
  })

  const handleInteraction = useCallback((e: any) => {
    e.stopPropagation()
    
    if (!canInteract || isProcessing) return
    
    console.log('🎯 SMART planet selection:', planetName)
    setIsProcessing(true)
    
    const planetDataObj = {
      name: planetName,
      subtitle: planetSubtitle,
      data: planetData,
      color: planetColor,
      appRoute: appRoute
    }
    
    setTimeout(() => setIsProcessing(false), 2000)
    onSelect(planetDataObj)
  }, [canInteract, isProcessing, planetName, planetSubtitle, planetData, planetColor, appRoute, onSelect])

  return (
    <group position={position}>
      <mesh ref={atmosphereRef} scale={size * 1.2}>
        <sphereGeometry args={[1, 32, 32]} />
        <primitive object={atmosphereMaterial} />
      </mesh>

      <mesh
        ref={meshRef}
        onPointerDown={handleInteraction}
        onPointerEnter={() => canInteract && setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        scale={hovered && canInteract ? size * 1.05 : size}
      >
        <sphereGeometry args={[1, 64, 64]} />
        <primitive object={planetMaterial} />
      </mesh>

      <SmartParticleRing 
        position={[0, 0, 0]} 
        color={planetColor} 
        hovered={hovered && canInteract} 
        isActive={false}
      />

      {!modalOpen && (
        <>
          <Text
            position={[0, size * 1.6, 0]}
            fontSize={0.35}
            color={planetColor}
            anchorX="center"
            anchorY="middle"
          >
            {planetName}
          </Text>
          <Text
            position={[0, size * 1.3, 0]}
            fontSize={0.18}
            color="#88ccff"
            anchorX="center"
            anchorY="middle"
          >
            {planetSubtitle}
          </Text>
        </>
      )}
    </group>
  )
}

interface SmartInteractionSystemProps {
  onPlanetSelect: (planetData: any) => void
  modalOpen: boolean
}

export default function SmartInteractionSystem({ onPlanetSelect, modalOpen }: SmartInteractionSystemProps) {
  const { transitionToTarget } = useAdvancedCamera()

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

  const handlePlanetSelection = useCallback((planetData: any) => {
    console.log('🚀 SMART SELECTION:', planetData.name)
    
    // Find planet position for camera transition
    const planetPositions: { [key: string]: [number, number, number] } = {
      'VETNAV-7': [-15, 6, -8],
      'TARIFF-7': [18, -4, 12],
      'PET-RADAR-9': [-12, -10, 18],
      'JETS-HOME': [15, 14, -12]
    }
    
    const planetPos = new THREE.Vector3(...(planetPositions[planetData.name] || [0, 0, 0]))
    
    transitionToTarget(planetPos, 2.5, () => {
      onPlanetSelect(planetData)
      console.log('🎬 SMART HUD materialized!')
    })
  }, [transitionToTarget, onPlanetSelect])

  return (
    <>
      <ambientLight intensity={0.4} color="#ffffff" />
      <directionalLight position={[20, 20, 10]} intensity={1.2} color="#ffffff" castShadow />
      <pointLight position={[-20, 10, -10]} intensity={0.8} color="#4488ff" />
      
      <InstancedStarField count={5000} />
      <SpaceStation onClick={() => console.log('Imperial Command Citadel activated')} />
      
      {planets.map((planet, index) => (
        <SmartPlanet
          key={index}
          {...planet}
          onSelect={handlePlanetSelection}
          modalOpen={modalOpen}
        />
      ))}
    </>
  )
}
