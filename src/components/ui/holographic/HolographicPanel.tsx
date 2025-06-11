
'use client'
import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, RoundedBox, Html } from '@react-three/drei'
import * as THREE from 'three'
interface HolographicPanelProps {
position: [number, number, number]
planetData: {
name: string
subtitle: string
data: string
population?: string
status?: string
}
visible: boolean
onClose: () => void
}
export default function HolographicPanel({ position, planetData, visible, onClose }: HolographicPanelProps) {
const groupRef = useRef<THREE.Group>(null)
const [hovered, setHovered] = useState(false)
useFrame((state) => {
if (groupRef.current && visible) {
groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.2
}
})
if (!visible) return null
return (
<group ref={groupRef} position={position}>
{/* Holographic Frame */}
<RoundedBox
args={[4, 3, 0.1]}
radius={0.1}
onPointerEnter={() => setHovered(true)}
onPointerLeave={() => setHovered(false)}
>
<meshBasicMaterial
color={hovered ? '#00ffff' : '#00aaff'}
transparent
opacity={0.1}
wireframe
/>
</RoundedBox>
  {/* Holographic Border */}
  <lineSegments>
    <edgesGeometry args={[new THREE.BoxGeometry(4, 3, 0.1)]} />
    <lineBasicMaterial color="#00ffff" transparent opacity={0.8} />
  </lineSegments>

  {/* Title */}
  <Text
    position={[0, 1, 0.06]}
    fontSize={0.3}
    color="#00ffff"
    anchorX="center"
    anchorY="middle"
    
  >
    {planetData.name}
  </Text>

  {/* Subtitle */}
  <Text
    position={[0, 0.5, 0.06]}
    fontSize={0.15}
    color="#88ccff"
    anchorX="center"
    anchorY="middle"
    
  >
    {planetData.subtitle}
  </Text>

  {/* Data */}
  <Text
    position={[0, 0, 0.06]}
    fontSize={0.12}
    color="#ffffff"
    anchorX="center"
    anchorY="middle"
    
  >
    {planetData.data}
  </Text>

  {/* Close Button */}
  <group position={[1.7, 1.2, 0.06]} onClick={onClose}>
    <RoundedBox args={[0.3, 0.3, 0.05]} radius={0.05}>
      <meshBasicMaterial color="#ff4444" transparent opacity={0.8} />
    </RoundedBox>
    <Text
      position={[0, 0, 0.03]}
      fontSize={0.15}
      color="#ffffff"
      anchorX="center"
      anchorY="middle"
    >
      ×
    </Text>
  </group>
</group>
)
}
