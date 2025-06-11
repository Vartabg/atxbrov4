'use client'
import { Suspense, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import SmartInteractionSystem from '@/components/3d/SmartInteractionSystem'

// Extract the modal components from SmartInteractionSystem
const ModalBackdrop = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        touchAction: 'none'
      }}
      onClick={onClose}
      onTouchStart={onClose}
    />
  )
}

const SmartModal = ({ isOpen, planetData, onClose, onAccess }: any) => {
  if (!isOpen || !planetData) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: '75%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${planetData.color}40`,
        borderRadius: '12px',
        padding: '24px',
        fontFamily: 'monospace',
        color: '#e0e0e0',
        maxWidth: '90vw',
        maxHeight: '90vh',
        zIndex: 11,
        boxShadow: `0 0 30px ${planetData.color}20`
      }}
      onClick={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <div style={{ marginBottom: '24px' }}>
        <div style={{ 
          fontSize: '12px', 
          color: `${planetData.color}aa`, 
          textTransform: 'uppercase', 
          letterSpacing: '2px',
          marginBottom: '8px'
        }}>
          SYSTEM ACCESS
        </div>
        <h3 style={{ 
          fontSize: '20px', 
          fontWeight: '300', 
          color: '#e0e0e0',
          letterSpacing: '1px',
          margin: '0 0 8px 0'
        }}>
          {planetData.name}
        </h3>
        <p style={{ 
          fontSize: '14px', 
          color: `${planetData.color}cc`,
          fontWeight: '300',
          margin: '0 0 8px 0'
        }}>
          {planetData.subtitle}
        </p>
        <div style={{ 
          fontSize: '12px', 
          color: '#ffffff99',
          margin: 0
        }}>
          {planetData.data}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
        <button
          onClick={() => onAccess(planetData.appRoute)}
          style={{
            padding: '8px 24px',
            background: `linear-gradient(135deg, ${planetData.color}33, ${planetData.color}22)`,
            border: `1px solid ${planetData.color}66`,
            borderRadius: '6px',
            color: '#e0e0e0',
            fontSize: '14px',
            fontWeight: '300',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            cursor: 'pointer',
            touchAction: 'manipulation'
          }}
        >
          ACCESS
        </button>
        
        <button
          onClick={onClose}
          style={{
            padding: '8px 24px',
            background: 'linear-gradient(135deg, #66666633, #66666622)',
            border: '1px solid #66666666',
            borderRadius: '6px',
            color: '#e0e0e0',
            fontSize: '14px',
            fontWeight: '300',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            cursor: 'pointer',
            touchAction: 'manipulation'
          }}
        >
          DISCONNECT
        </button>
      </div>
    </div>
  )
}

export default function Home() {
  const [isClient, setIsClient] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedPlanet, setSelectedPlanet] = useState<any>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handlePlanetSelect = (planetData: any) => {
    setSelectedPlanet(planetData)
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setSelectedPlanet(null)
  }

  const handleAccess = (route: string) => {
    console.log('🎯 Accessing:', route)
    window.location.href = route
  }

  if (!isClient) {
    return (
      <main className="min-h-screen bg-black overflow-hidden">
        <div className="relative w-full h-screen bg-black flex items-center justify-center">
          <div className="text-white">Loading 3D Environment...</div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black overflow-hidden">
      <div className="relative w-full h-screen">
        <Canvas
          eventSource={document.body}
          eventPrefix="client"
          camera={{
            position: [0, 0, 20],
            fov: 45,
            near: 0.1,
            far: 1000
          }}
        >
          <Suspense fallback={null}>
            <directionalLight
              position={[5, 5, 5]}
              intensity={1}
              color="#ffffff"
              castShadow
            />
            <OrbitControls
              makeDefault
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={5}
              maxDistance={100}
              maxPolarAngle={Math.PI}
            />
            <SmartInteractionSystem onPlanetSelect={handlePlanetSelect} modalOpen={modalOpen} />
          </Suspense>
        </Canvas>
        
        <ModalBackdrop isOpen={modalOpen} onClose={handleModalClose} />
        <SmartModal 
          isOpen={modalOpen} 
          planetData={selectedPlanet} 
          onClose={handleModalClose}
          onAccess={handleAccess}
        />
        
        <div className="absolute bottom-4 left-4 text-white/70 text-sm">
          <p>Click planets to view holographic data panels</p>
          <p>Mouse/touch to navigate • Scroll to zoom</p>
        </div>
      </div>
    </main>
  )
}
