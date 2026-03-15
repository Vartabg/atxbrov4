"use client";

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Suspense } from 'react';
import { InteractiveUSMap } from './InteractiveUSMap';
import { StateData } from '../../data/usStatesData';

interface VetNavMapCanvasProps {
  onStateSelect?: (state: StateData | null) => void;
  selectedStateCode?: string;
}

const MapLoadingFallback = () => {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#4a9eff" wireframe opacity={0.5} transparent />
      </mesh>
      <mesh position={[0, 2, 0]}>
        <sphereGeometry args={[0.8, 6, 6]} />
        <meshBasicMaterial color="#ffffff" wireframe opacity={0.3} transparent />
      </mesh>
    </group>
  );
};

export const VetNavMapCanvas = ({ onStateSelect, selectedStateCode }: VetNavMapCanvasProps) => {
  return (
    <div className="w-full h-[600px] bg-gradient-to-b from-indigo-900 to-blue-900 rounded-lg overflow-hidden">
      <Canvas>
        {/* Camera setup - positioned to view the US map optimally */}
        <PerspectiveCamera
          makeDefault
          position={[0, 8, 12]}
          fov={60}
        />

        {/* Controls for user interaction */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={25}
          maxPolarAngle={Math.PI / 2}
          target={[0, 0, 0]}
        />

        {/* Lighting setup */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-10, 5, -10]} intensity={0.5} color="#4a9eff" />
        <pointLight position={[10, 5, 10]} intensity={0.5} color="#10b981" />

        {/* The interactive US map */}
        <Suspense fallback={<MapLoadingFallback />}>
          <InteractiveUSMap 
            onStateSelect={onStateSelect}
            selectedStateCode={selectedStateCode}
          />
        </Suspense>

        {/* Background stars for atmosphere */}
        <group>
          {Array.from({ length: 200 }).map((_, i) => (
            <mesh
              key={i}
              position={[
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 50 + 10,
                (Math.random() - 0.5) * 100
              ]}
            >
              <sphereGeometry args={[0.1, 4, 4]} />
              <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={Math.random() * 0.5 + 0.2}
              />
            </mesh>
          ))}
        </group>
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute top-4 left-4 bg-blue-900 bg-opacity-80 rounded-lg p-3 text-white">
        <p className="text-sm font-semibold mb-1">Interactive Map Controls:</p>
        <ul className="text-xs space-y-1 text-blue-200">
          <li>🖱️ Click & drag to rotate</li>
          <li>🔍 Scroll to zoom</li>
          <li>📍 Click states for details</li>
        </ul>
      </div>

      {/* Statistics Overlay */}
      <div className="absolute top-4 right-4 bg-blue-900 bg-opacity-80 rounded-lg p-3 text-white">
        <p className="text-sm font-semibold mb-1">US Veterans Overview:</p>
        <ul className="text-xs space-y-1 text-blue-200">
          <li>📊 {(18.2).toFixed(1)}M Total Veterans</li>
          <li>🏥 {(150).toLocaleString()} VA Facilities</li>
          <li>🎯 {(40).toLocaleString()}+ Benefit Programs</li>
        </ul>
      </div>

      {/* Loading indicator when needed */}
      <div className="absolute bottom-4 left-4 bg-blue-900 bg-opacity-80 rounded-lg px-3 py-2 text-white text-sm">
        <span>🗺️ Interactive 3D Veterans Benefits Map</span>
      </div>
    </div>
  );
};