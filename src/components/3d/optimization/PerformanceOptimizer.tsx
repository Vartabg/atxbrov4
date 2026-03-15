"use client";

import { useRef, useState, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  drawCalls: number;
  triangles: number;
}

export interface QualitySettings {
  particleCount: number;
  shadowQuality: 'low' | 'medium' | 'high';
  textureQuality: 'low' | 'medium' | 'high';
  postProcessing: boolean;
  animationQuality: 'low' | 'medium' | 'high';
  lodDistance: number;
}

const DEFAULT_QUALITY_SETTINGS: Record<string, QualitySettings> = {
  high: {
    particleCount: 1.0,
    shadowQuality: 'high',
    textureQuality: 'high',
    postProcessing: true,
    animationQuality: 'high',
    lodDistance: 100
  },
  medium: {
    particleCount: 0.7,
    shadowQuality: 'medium',
    textureQuality: 'medium',
    postProcessing: true,
    animationQuality: 'medium',
    lodDistance: 75
  },
  low: {
    particleCount: 0.4,
    shadowQuality: 'low',
    textureQuality: 'low',
    postProcessing: false,
    animationQuality: 'low',
    lodDistance: 50
  }
};

interface PerformanceOptimizerProps {
  targetFPS?: number;
  adaptiveQuality?: boolean;
  onQualityChange?: (quality: string, settings: QualitySettings) => void;
  children: React.ReactNode;
}

export const PerformanceOptimizer = ({ 
  targetFPS = 60, 
  adaptiveQuality = true,
  onQualityChange,
  children 
}: PerformanceOptimizerProps) => {
  const { gl } = useThree();
  const [currentQuality, setCurrentQuality] = useState<string>('high');
  const [qualitySettings, setQualitySettings] = useState<QualitySettings>(DEFAULT_QUALITY_SETTINGS.high);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameTime: 16.67,
    memoryUsage: 0,
    drawCalls: 0,
    triangles: 0
  });

  const frameTimeHistory = useRef<number[]>([]);
  const lastTime = useRef<number>(0);
  const qualityAdjustmentCooldown = useRef<number>(0);

  // FPS and performance tracking
  useFrame((state) => {
    const currentTime = state.clock.elapsedTime * 1000;
    const deltaTime = currentTime - lastTime.current;
    
    if (deltaTime > 0) {
      
      // Update frame time history
      frameTimeHistory.current.push(deltaTime);
      if (frameTimeHistory.current.length > 60) {
        frameTimeHistory.current.shift();
      }
      
      // Calculate average FPS
      const averageFrameTime = frameTimeHistory.current.reduce((sum, time) => sum + time, 0) / frameTimeHistory.current.length;
      const averageFPS = 1000 / averageFrameTime;
      
      // Update metrics
      setMetrics(prev => ({
        ...prev,
        fps: Math.round(averageFPS),
        frameTime: Math.round(averageFrameTime * 100) / 100,
        drawCalls: gl.info.render.calls,
        triangles: gl.info.render.triangles
      }));

      // Adaptive quality adjustment
      if (adaptiveQuality && qualityAdjustmentCooldown.current <= 0) {
        adjustQualityBasedOnPerformance(averageFPS);
        qualityAdjustmentCooldown.current = 120; // 2 second cooldown
      }
    }
    
    if (qualityAdjustmentCooldown.current > 0) {
      qualityAdjustmentCooldown.current--;
    }
    
    lastTime.current = currentTime;
  });

  const adjustQualityBasedOnPerformance = useCallback((avgFPS: number) => {
    const fpsThreshold = targetFPS * 0.8; // 80% of target FPS
    const highFpsThreshold = targetFPS * 0.95; // 95% of target FPS
    
    if (avgFPS < fpsThreshold && currentQuality !== 'low') {
      // Reduce quality
      const newQuality = currentQuality === 'high' ? 'medium' : 'low';
      setCurrentQuality(newQuality);
      setQualitySettings(DEFAULT_QUALITY_SETTINGS[newQuality]);
      onQualityChange?.(newQuality, DEFAULT_QUALITY_SETTINGS[newQuality]);
      console.log(`Performance: Reduced quality to ${newQuality} (FPS: ${avgFPS.toFixed(1)})`);
    } else if (avgFPS > highFpsThreshold && currentQuality !== 'high') {
      // Increase quality
      const newQuality = currentQuality === 'low' ? 'medium' : 'high';
      setCurrentQuality(newQuality);
      setQualitySettings(DEFAULT_QUALITY_SETTINGS[newQuality]);
      onQualityChange?.(newQuality, DEFAULT_QUALITY_SETTINGS[newQuality]);
      console.log(`Performance: Increased quality to ${newQuality} (FPS: ${avgFPS.toFixed(1)})`);
    }
  }, [currentQuality, targetFPS, onQualityChange]);

  // Memory usage tracking
  useEffect(() => {
    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as { memory?: { usedJSHeapSize: number } }).memory;
        if (memory) {
          setMetrics(prev => ({
            ...prev,
            memoryUsage: Math.round(memory.usedJSHeapSize / 1024 / 1024)
          }));
        }
      }
    };

    const interval = setInterval(updateMemoryUsage, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {children}
      <PerformanceMonitor metrics={metrics} qualitySettings={qualitySettings} />
    </>
  );
};

interface PerformanceMonitorProps {
  metrics: PerformanceMetrics;
  qualitySettings: QualitySettings;
}

const PerformanceMonitor = ({ metrics, qualitySettings }: PerformanceMonitorProps) => {
  const [showStats, setShowStats] = useState(false);

  // Toggle stats with keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'p' && event.ctrlKey) {
        setShowStats(prev => !prev);
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!showStats) {
    return (
      <div className="fixed top-2 right-2 text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
        Ctrl+P for stats
      </div>
    );
  }

  const getFPSColor = (fps: number) => {
    if (fps >= 55) return 'text-green-400';
    if (fps >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed top-2 right-2 bg-black bg-opacity-80 text-white p-4 rounded-lg text-sm font-mono">
      <div className="space-y-2">
        <div className="text-blue-300 font-bold">Performance Stats</div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className={`font-bold ${getFPSColor(metrics.fps)}`}>
              FPS: {metrics.fps}
            </div>
            <div className="text-gray-300">
              Frame: {metrics.frameTime}ms
            </div>
            <div className="text-gray-300">
              Memory: {metrics.memoryUsage}MB
            </div>
          </div>
          
          <div>
            <div className="text-gray-300">
              Draws: {metrics.drawCalls}
            </div>
            <div className="text-gray-300">
              Tris: {metrics.triangles.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-600 pt-2">
          <div className="text-blue-300 font-bold">Quality Settings</div>
          <div className="text-gray-300 text-xs">
            <div>Particles: {Math.round(qualitySettings.particleCount * 100)}%</div>
            <div>Shadows: {qualitySettings.shadowQuality}</div>
            <div>Textures: {qualitySettings.textureQuality}</div>
            <div>Post-FX: {qualitySettings.postProcessing ? 'On' : 'Off'}</div>
          </div>
        </div>

        <div className="text-xs text-gray-400 pt-2">
          Press Ctrl+P to hide
        </div>
      </div>
    </div>
  );
};

// Level of Detail (LOD) component for objects
interface LODObjectProps {
  position: [number, number, number];
  children: React.ReactNode[];
  distances: number[];
  cameraPosition?: THREE.Vector3;
}

export const LODObject = ({ position, children, distances, cameraPosition }: LODObjectProps) => {
  const { camera } = useThree();
  const [currentLOD, setCurrentLOD] = useState(0);
  const objectRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!objectRef.current) return;

    const cam = cameraPosition || camera.position;
    const distance = cam.distanceTo(new THREE.Vector3(...position));
    
    let newLOD = children.length - 1;
    for (let i = 0; i < distances.length; i++) {
      if (distance < distances[i]) {
        newLOD = i;
        break;
      }
    }

    if (newLOD !== currentLOD) {
      setCurrentLOD(newLOD);
    }
  });

  return (
    <group ref={objectRef} position={position}>
      {children[currentLOD]}
    </group>
  );
};

// Frustum culling helper
export const useFrustumCulling = (enabled: boolean = true) => {
  const { camera } = useThree();
  const frustum = useRef(new THREE.Frustum());
  const cameraMatrix = useRef(new THREE.Matrix4());

  useFrame(() => {
    if (!enabled) return;
    
    cameraMatrix.current.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.current.setFromProjectionMatrix(cameraMatrix.current);
  });

  const isVisible = useCallback((object: THREE.Object3D) => {
    if (!enabled) return true;
    return frustum.current.intersectsObject(object);
  }, [enabled]);

  return isVisible;
};