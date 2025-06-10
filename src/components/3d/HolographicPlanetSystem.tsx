'use client'
import { useState } from 'react'
import { PlanetSystem } from './PlanetSystem'
import HolographicPanel from '../ui/holographic/HolographicPanel'
import { defaultUniverseConfig } from './systems/UniverseConfig'

export default function HolographicPlanetSystem() {
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null)
  const [panelPosition, setPanelPosition] = useState<[number, number, number]>([0, 0, 5])

  const handlePlanetClick = (planetId: string, position: [number, number, number]) => {
    setSelectedPlanet(planetId)
    setPanelPosition([position[0] + 5, position[1] + 2, position[2]])
  }

  const handleClosePanel = () => {
    setSelectedPlanet(null)
  }

  const selectedPlanetData = selectedPlanet 
    ? defaultUniverseConfig.planets.find(p => p.id === selectedPlanet)
    : null

  return (
    <>
      <PlanetSystem onPlanetClick={handlePlanetClick} />
      
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
