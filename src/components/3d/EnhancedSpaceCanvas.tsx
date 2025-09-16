"use client";

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Suspense, useState } from 'react';
import { PlanetSystem } from './PlanetSystem';
import { NebulaSystem } from './effects/NebulaSystem';
import { EnhancedStarField } from './effects/EnhancedStarField';
import { EnhancedLighting } from './effects/EnhancedLighting';
import { PerformanceOptimizer, QualitySettings } from './optimization/PerformanceOptimizer';
import { PlanetAtmosphere } from './effects/PlanetAtmosphere';
import { OrbitingParticles } from './effects/ParticleTrails';
import { defaultUniverseConfig } from './systems/UniverseConfig';

interface EnhancedSpaceCanvasProps {
  onPlanetClick: (planet: string) => void;
  className?: string;
}

const SpaceLoadingFallback = () => {
  return (
    <group>
      {/* Simple loading animation */}
      <mesh>
        <torusGeometry args={[2, 0.5, 16, 32]} />
        <meshBasicMaterial color="#4a9eff" wireframe />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1, 0.2, 12, 24]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
};

const EnhancedSpaceScene = ({ onPlanetClick }: { onPlanetClick: (planet: string) => void }) => {
  const [qualitySettings, setQualitySettings] = useState<QualitySettings>({
    particleCount: 1.0,
    shadowQuality: 'high',
    textureQuality: 'high',
    postProcessing: true,
    animationQuality: 'high',
    lodDistance: 100
  });

  const handleQualityChange = (quality: string, settings: QualitySettings) => {
    setQualitySettings(settings);
  };

  return (
    <PerformanceOptimizer 
      targetFPS={60} 
      adaptiveQuality={true}
      onQualityChange={handleQualityChange}
    >
      {/* Enhanced Lighting System */}
      <EnhancedLighting 
        timeOfDay="night" 
        ambientIntensity={0.3}
        animated={qualitySettings.animationQuality !== 'low'} 
      />

      {/* Enhanced Star Field */}
      <EnhancedStarField
        count={Math.floor(defaultUniverseConfig.scene.stars.count * qualitySettings.particleCount)}
        radius={defaultUniverseConfig.scene.stars.radius}
        animated={qualitySettings.animationQuality !== 'low'}
      />

      {/* Nebula System */}
      <NebulaSystem
        intensity={qualitySettings.particleCount}
        scale={1.0}
        animated={qualitySettings.animationQuality !== 'low'}
      />

      {/* Main Planet System */}
      <Suspense fallback={<SpaceLoadingFallback />}>
        <PlanetSystem onPlanetClick={onPlanetClick} />
      </Suspense>

      {/* Planet Atmospheric Effects */}
      {defaultUniverseConfig.planets.map((planet) => (
        <group key={`atmosphere-${planet.id}`} position={planet.position}>
          <PlanetAtmosphere
            planetRadius={1.5} // Adjust based on actual planet size
            atmosphereColor={planet.planetColor || '#4a9eff'}
            density={qualitySettings.particleCount}
            animated={qualitySettings.animationQuality !== 'low'}
            planetType={
              planet.id === 'vetnav' ? 'terrestrial' :
              planet.id === 'tariff' ? 'gas' :
              planet.id === 'petradar' ? 'desolate' : 'sports'
            }
          />
        </group>
      ))}

      {/* Orbiting Particles Around Central Station */}
      <OrbitingParticles
        center={[5, -5, 25]}
        radius={8}
        count={Math.floor(50 * qualitySettings.particleCount)}
        color="#ffffff"
        speed={0.5}
        animated={qualitySettings.animationQuality !== 'low'}
      />

      {/* Additional atmospheric particles */}
      {qualitySettings.animationQuality === 'high' && (
        <>
          <OrbitingParticles
            center={[-35, 15, -10]}
            radius={3}
            count={30}
            color="#4a9eff"
            speed={0.3}
            animated={true}
          />
          <OrbitingParticles
            center={[30, 20, 8]}
            radius={4}
            count={40}
            color="#10b981"
            speed={0.4}
            animated={true}
          />
          <OrbitingParticles
            center={[-25, 2, -20]}
            radius={2.5}
            count={25}
            color="#9d4edd"
            speed={0.6}
            animated={true}
          />
          <OrbitingParticles
            center={[40, -12, -20]}
            radius={3.5}
            count={35}
            color="#06ffa5"
            speed={0.5}
            animated={true}
          />
        </>
      )}

      {/* Fog for depth */}
      <fog attach="fog" args={[defaultUniverseConfig.scene.backgroundColor, 100, 400]} />
    </PerformanceOptimizer>
  );
};

export const EnhancedSpaceCanvas = ({ onPlanetClick, className }: EnhancedSpaceCanvasProps) => {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        shadows={true}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          stencil: false,
          depth: true
        }}
      >
        {/* Camera Setup */}
        <PerspectiveCamera
          makeDefault
          position={defaultUniverseConfig.camera.initialPosition}
          fov={defaultUniverseConfig.camera.fov}
          near={0.1}
          far={1000}
        />

        {/* Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={10}
          maxDistance={200}
          maxPolarAngle={Math.PI}
          target={[0, 0, 0]}
          enableDamping={true}
          dampingFactor={0.05}
          rotateSpeed={0.5}
          zoomSpeed={1.0}
          panSpeed={0.8}
        />

        {/* Enhanced Space Scene */}
        <Suspense fallback={<SpaceLoadingFallback />}>
          <EnhancedSpaceScene onPlanetClick={onPlanetClick} />
        </Suspense>
      </Canvas>

      {/* UI Overlays */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-60 rounded-lg p-3 text-white">
        <div className="text-sm font-semibold mb-2">🚀 Enhanced Space Navigation</div>
        <div className="text-xs space-y-1 text-gray-300">
          <div>• Dynamic lighting & atmospheres</div>
          <div>• Adaptive quality system</div>
          <div>• Real-time particle effects</div>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 rounded-lg p-3 text-white">
        <div className="text-xs space-y-1 text-gray-300">
          <div>🎮 Controls: Drag to rotate, Scroll to zoom</div>
          <div>🎯 Click planets to explore applications</div>
          <div>⚡ Ctrl+P to show performance stats</div>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 bg-black bg-opacity-60 rounded-lg px-3 py-2 text-white">
        <div className="text-xs text-gray-300">
          ✨ ATX Bro Enhanced 3D Navigation
        </div>
      </div>
    </div>
  );
};