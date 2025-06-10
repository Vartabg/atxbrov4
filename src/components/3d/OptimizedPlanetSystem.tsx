'use client'
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
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null)
  const [panelPosition, setPanelPosition] = useState<[number, number, number]>([0, 0, 5])

  const handlePlanetClick = (planetId: string) => {
    const planet = defaultUniverseConfig.planets.find(p => p.id === planetId)
    if (planet) {
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
