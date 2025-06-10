'use client'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { ReactNode } from 'react'

interface PerformanceCanvasProps {
  children: ReactNode
}

export default function PerformanceCanvas({ children }: PerformanceCanvasProps) {
  return (
    <Canvas
      camera={{ 
        position: [0, 5, 35], 
        fov: 45,
        near: 0.1,
        far: 1000
      }}
      gl={{ 
        antialias: false, // Disable for better performance
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
        depth: true
      }}
      dpr={[1, 1.5]} // Limit pixel ratio for performance
      performance={{ min: 0.8 }} // Reduce quality when FPS drops
    >
      {children}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={100}
        maxPolarAngle={Math.PI}
        enableDamping={true}
        dampingFactor={0.05}
      />
    </Canvas>
  )
}
