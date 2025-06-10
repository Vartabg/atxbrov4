"use client";
import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { PlanetSystem } from '@/components/3d/PlanetSystem';
import { HyperspaceEffect } from '@/components/3d/HyperspaceEffect';
import { EnhancedCosmicBackground } from '@/components/3d/EnhancedCosmicBackground';
import { VetNavApp } from '@/components/apps/VetNavApp';
import { TariffExplorerApp } from '@/components/apps/TariffExplorerApp';
import { PetRadarApp } from '@/components/apps/PetRadarApp';
import { JetsHomeApp } from '@/components/apps/JetsHomeApp';

export default function Home() {
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hyperspaceActive, setHyperspaceActive] = useState(false);
  const [showNavigationHint, setShowNavigationHint] = useState(true);

  const handlePlanetClick = (planet: string) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setHyperspaceActive(true);
    setShowNavigationHint(false);
    
    // End hyperspace effect and show modal
    setTimeout(() => {
      setHyperspaceActive(false);
      setSelectedPlanet(planet);
      setIsTransitioning(false);
    }, 2000);
    
    console.log(`Initiating hyperspace jump to: ${planet}`);
  };

  const closeModal = () => {
    setSelectedPlanet(null);
  };

  const renderApp = () => {
    switch (selectedPlanet) {
      case 'vetnav':
        return <VetNavApp />;
      case 'tariff':
        return <TariffExplorerApp />;
      case 'petradar':
        return <PetRadarApp />;
      case 'jetshome':
        return <JetsHomeApp />;
      case 'station':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-4">ATX BRO Command Station</h2>
            <p className="text-gray-600 mb-6">
              Contact center, feedback portal, and customer login hub coming soon...
            </p>
          </div>
        );
      default:
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-4 capitalize">{selectedPlanet}</h2>
            <p className="text-gray-600 mb-6">
              Welcome to {selectedPlanet}! This will contain the full application.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="w-full h-screen bg-black relative">
      <Canvas 
        camera={{ 
          position: [0, 15, 15], 
          fov: 60
        }}
        resize={{ 
          scroll: false, 
          debounce: { scroll: 50, resize: 0 } 
        }}
        onCreated={({ gl, camera, size }) => {
          // Adjust camera based on aspect ratio for 65-degree viewing angle
          const aspectRatio = size.width / size.height;
          
          if (aspectRatio < 1) {
            // Portrait mode - pull camera back more
            camera.position.set(0, 20, 20);
            camera.fov = 70;
          } else if (aspectRatio < 1.5) {
            // Square-ish screens
            camera.position.set(0, 17, 17);
            camera.fov = 65;
          } else {
            // Wide screens - 65 degree angle view
            camera.position.set(0, 15, 15);
            camera.fov = 60;
          }
          
          camera.updateProjectionMatrix();
          gl.setSize(size.width, size.height);
        }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        {!hyperspaceActive && <EnhancedCosmicBackground />}
        
        <PlanetSystem onPlanetClick={handlePlanetClick} />
        
        <HyperspaceEffect 
          isActive={hyperspaceActive} 
          intensity={isTransitioning ? 1.5 : 1}
        />
        
        <OrbitControls 
          enablePan={!isTransitioning} 
          enableZoom={!isTransitioning} 
          enableRotate={!isTransitioning}
          target={[0, 0, 0]}
          minDistance={8}
          maxDistance={60}
        />
      </Canvas>

      {/* Navigation Hint */}
      {showNavigationHint && !selectedPlanet && !isTransitioning && (
        <div className="absolute bottom-6 left-6 bg-black/70 backdrop-blur-md border border-cyan-400/30 rounded-lg p-4 font-mono max-w-sm">
          <div className="text-cyan-400 text-sm mb-2">Navigation Controls</div>
          <div className="text-white/80 text-xs space-y-1">
            <div>• Click and drag to orbit</div>
            <div>• Scroll to zoom in/out</div>
            <div>• Click planets to access apps</div>
            <div>• Click station for contact portal</div>
          </div>
          <button 
            onClick={() => setShowNavigationHint(false)}
            className="text-cyan-400/60 hover:text-cyan-400 text-xs mt-2 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Planet Radar */}
      {!selectedPlanet && !isTransitioning && (
        <div className="absolute top-6 right-6 bg-black/70 backdrop-blur-md border border-cyan-400/30 rounded-lg p-3 font-mono">
          <div className="text-cyan-400 text-xs mb-2">Detected Objects</div>
          <div className="space-y-1 text-xs">
            <div className="text-green-400">• VetNav (Front Right)</div>
            <div className="text-blue-400">• Tariff Explorer (Far Right)</div>
            <div className="text-purple-400">• Pet Radar (Back Left)</div>
            <div className="text-orange-400">• JetsHome (Far Left)</div>
            <div className="text-gray-400">• Command Station (Center)</div>
          </div>
        </div>
      )}

      {selectedPlanet && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full mx-4 h-[90vh] overflow-hidden relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
            >
              ✕ Close
            </button>
            {renderApp()}
          </div>
        </div>
      )}
    </div>
  );
}
