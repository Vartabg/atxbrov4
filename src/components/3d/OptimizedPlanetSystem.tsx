'use client'
import { useThree } from "@react-three/fiber"
import { gsap } from "gsap"
import { useState, useMemo, Suspense } from 'react'
import { PlanetSystem } from './PlanetSystem'
import HolographicPanel from '../ui/holographic/HolographicPanel'
import { defaultUniverseConfig } from './systems/UniverseConfig'

// Lightweight loading component
function SimpleLoader() {
  return (
    <mesh>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#ffffff" wireframe opacity={0.3} transparent />
    </mesh>
  )
}

export default function OptimizedPlanetSystem() {
  const controls = useThree((state) => state.controls)
 const { camera } = useThree()
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null)
  const [panelPosition, setPanelPosition] = useState<[number, number, number]>([0, 0, 5])

  const handlePlanetClick = (planetId: string) => {
    const planet = defaultUniverseConfig.planets.find(p => p.id === planetId)
    if (planet) {
      if (!controls) {
        console.warn("Controls not available yet")
        return
      }
      
      // Disable controls during transition
      if ('enabled' in controls) {
        (controls as { enabled: boolean }).enabled = false
      }
      
      const targetCameraPos = [
        planet.position[0] + 6,
        planet.position[1] + 3,
        planet.position[2] + 8
      ]
      
      gsap.to(camera.position, {
        duration: 2,
        x: targetCameraPos[0],
        y: targetCameraPos[1],
        z: targetCameraPos[2],
        ease: "power2.inOut"
      })
      
      // Animate controls target if available
      if ('target' in controls) {
        gsap.to((controls as { target: { x: number; y: number; z: number } }).target, {
          duration: 2,
          x: planet.position[0],
          y: planet.position[1],
          z: planet.position[2],
          ease: "power2.inOut",
          onUpdate: () => {
            if ('update' in controls) {
              (controls as { update: () => void }).update()
            }
          },
          onComplete: () => {
            // Re-enable controls after transition
            if ('enabled' in controls) {
              (controls as { enabled: boolean }).enabled = true
            }
            if ('update' in controls) {
              (controls as { update: () => void }).update()
            }
          }
        })
      }
      
      setSelectedPlanet(planetId)
      setPanelPosition([planet.position[0] + 5, planet.position[1] + 2, planet.position[2]])
    }
  }

  const handleClosePanel = () => {
    setSelectedPlanet(null)
  }

  const selectedPlanetData = useMemo(() => 
    selectedPlanet ? defaultUniverseConfig.planets.find(p => p.id === selectedPlanet) : null,
    [selectedPlanet]
  )

  return (
    <>
      <Suspense fallback={<SimpleLoader />}>
        <PlanetSystem onPlanetClick={handlePlanetClick} />
      </Suspense>
      
      {selectedPlanetData && (
        <HolographicPanel
          position={panelPosition}
          planetData={{
            name: selectedPlanetData.planetName,
            subtitle: selectedPlanetData.planetSubtitle,
            data: selectedPlanetData.planetData
          }}
          visible={!!selectedPlanet}
          onClose={handleClosePanel}
        />
      )}
    </>
  )
}
