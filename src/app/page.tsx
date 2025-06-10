'use client'
import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import OptimizedPlanetSystem from '@/components/3d/OptimizedPlanetSystem'
import { SpaceStation } from '@/components/3d/SpaceStation'
import { EnhancedCosmicBackground } from '@/components/3d/EnhancedCosmicBackground'

export default function Home() {
  return (
    <main className="min-h-screen bg-black overflow-hidden">
      
      <div className="relative w-full h-screen">
        <Canvas
          camera={{ 
            position: [0, 5, 35], 
            fov: 45,
            near: 0.1,
            far: 1000
          }}
          gl={{ 
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
          }}
        >
          <Suspense fallback={null}>
            {/* Enhanced Cosmic Environment */}
            <EnhancedCosmicBackground />
            
            {/* Imperial Command Citadel */}
            <SpaceStation />
            
            {/* Interactive Holographic Planet System */}
            <OptimizedPlanetSystem />
            
            {/* Ambient Lighting */}
            <ambientLight intensity={0.4} color="#ffffff" />
            <directionalLight
              position={[10, 10, 5]}
              intensity={0.8}
              color="#ffffff"
              castShadow
            />
            
            {/* Interactive Controls */}
            <OrbitControls makeDefault
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={5}
              maxDistance={100}
              maxPolarAngle={Math.PI}
            />
          </Suspense>
        </Canvas>
        
        {/* UI Overlay Instructions */}
        <div className="absolute bottom-4 left-4 text-white/70 text-sm">
          <p>Click planets to view holographic data panels</p>
          <p>Mouse/touch to navigate • Scroll to zoom</p>
        </div>
      </div>
    </main>
  )
}
