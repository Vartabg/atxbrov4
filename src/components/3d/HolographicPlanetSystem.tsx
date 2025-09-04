'use client'
import { useState } from 'react'
import { PlanetSystem } from './PlanetSystem'
import HolographicPanel from '../ui/holographic/HolographicPanel'
import { defaultUniverseConfig } from './systems/UniverseConfig'

export default function HolographicPlanetSystem() {
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
