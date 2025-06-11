import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function InstancedStarField({ count = 5000 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  
  // Pre-calculate all star positions (this is the mathematical optimization!)
  const { positions, matrix } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const matrix = new THREE.Matrix4()
    
    // Generate random positions in a sphere
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      
      // Mathematical sphere distribution (prevents clustering at poles)
      const u = Math.random()
      const v = Math.random()
      const theta = 2 * Math.PI * u
      const phi = Math.acos(2 * v - 1)
      const radius = 100 + Math.random() * 100 // 100-200 units from center
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = radius * Math.cos(phi)
    }
    
    return { positions, matrix }
  }, [count])
  
  // Set up instances (only runs once!)
  useMemo(() => {
    if (!meshRef.current) return
    
    const tempMatrix = new THREE.Matrix4()
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const scale = 0.1 + Math.random() * 0.2 // Varying star sizes
      
      tempMatrix.makeScale(scale, scale, scale)
      tempMatrix.setPosition(
        positions[i3],
        positions[i3 + 1], 
        positions[i3 + 2]
      )
      
      meshRef.current.setMatrixAt(i, tempMatrix)
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true
    console.log('🌟 INSTANCED STAR FIELD: 5000 stars in 1 draw call!')
  }, [positions, count])
  
  // Optional: Subtle twinkling effect
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0001 // Very slow rotation
    }
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.1, 6, 6]} />
      <meshBasicMaterial color="#ffffff" />
    </instancedMesh>
  )
}
