"use client";

import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { PlanetSystem } from '@/components/3d/PlanetSystem';
import { VetNavApp } from '@/components/apps/VetNavApp';

export default function Home() {
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);

  const handlePlanetClick = (planet: string) => {
    setSelectedPlanet(planet);
    console.log(`Clicked planet: ${planet}`);
  };

  const closeModal = () => {
    setSelectedPlanet(null);
  };

  return (
    <div className="w-full h-screen bg-black">
      <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Stars radius={100} depth={50} count={5000} factor={4} />
        
        <PlanetSystem onPlanetClick={handlePlanetClick} />
        
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>

      {selectedPlanet && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full mx-4 h-[90vh] overflow-hidden relative">
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
            >
              ✕ Close
            </button>
            
            {selectedPlanet === 'vetnav' ? (
              <VetNavApp />
            ) : (
              <div className="p-8">
                <h2 className="text-2xl font-bold mb-4 capitalize">{selectedPlanet}</h2>
                <p className="text-gray-600 mb-6">
                  Welcome to {selectedPlanet}! This will contain the full application.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
