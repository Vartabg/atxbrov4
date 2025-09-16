"use client";

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PlanetAtmosphereProps {
  planetRadius: number;
  atmosphereColor: string;
  density?: number;
  animated?: boolean;
  planetType?: 'terrestrial' | 'gas' | 'desolate' | 'sports';
}

export const PlanetAtmosphere = ({ 
  planetRadius, 
  atmosphereColor, 
  density = 1.0, 
  animated = true,
  planetType = 'terrestrial'
}: PlanetAtmosphereProps) => {
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const rimLightRef = useRef<THREE.Mesh>(null);
  const cloudLayerRef = useRef<THREE.Mesh>(null);

  // Create atmosphere material with rim lighting effect
  const atmosphereMaterial = useMemo(() => {
    const vertexShader = `
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = `
      uniform vec3 color;
      uniform float opacity;
      uniform float rimPower;
      
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      
      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);
        
        float rim = 1.0 - abs(dot(normal, viewDir));
        rim = pow(rim, rimPower);
        
        gl_FragColor = vec4(color, rim * opacity);
      }
    `;

    return new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(atmosphereColor) },
        opacity: { value: 0.6 * density },
        rimPower: { value: 2.0 }
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
  }, [atmosphereColor, density]);

  // Cloud layer material for terrestrial planets
  const cloudMaterial = useMemo(() => {
    if (planetType !== 'terrestrial') return null;
    
    return new THREE.MeshBasicMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
  }, [planetType]);

  // Planet-specific atmosphere configurations
  const atmosphereConfig = useMemo(() => {
    const configs = {
      terrestrial: {
        thickness: 0.1,
        cloudHeight: 0.05,
        animationSpeed: 0.5,
        layers: 2
      },
      gas: {
        thickness: 0.3,
        cloudHeight: 0.15,
        animationSpeed: 1.0,
        layers: 3
      },
      desolate: {
        thickness: 0.05,
        cloudHeight: 0.02,
        animationSpeed: 0.2,
        layers: 1
      },
      sports: {
        thickness: 0.08,
        cloudHeight: 0.04,
        animationSpeed: 0.7,
        layers: 2
      }
    };
    return configs[planetType];
  }, [planetType]);

  // Animation
  useFrame((state, delta) => {
    if (!animated) return;

    // Rotate atmosphere layers
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += delta * atmosphereConfig.animationSpeed * 0.1;
    }

    // Cloud layer rotation (if present)
    if (cloudLayerRef.current) {
      cloudLayerRef.current.rotation.y += delta * atmosphereConfig.animationSpeed * 0.15;
      cloudLayerRef.current.rotation.z += delta * atmosphereConfig.animationSpeed * 0.05;
    }

    // Rim light pulsing
    if (rimLightRef.current) {
      const rimMaterial = rimLightRef.current.material as THREE.ShaderMaterial;
      if (rimMaterial.uniforms) {
        const pulse = 0.6 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
        rimMaterial.uniforms.opacity.value = pulse * density;
      }
    }
  });

  return (
    <group>
      {/* Main atmosphere layer */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[planetRadius * (1 + atmosphereConfig.thickness), 32, 32]} />
        <primitive object={atmosphereMaterial} attach="material" />
      </mesh>

      {/* Rim lighting effect */}
      <mesh ref={rimLightRef}>
        <sphereGeometry args={[planetRadius * 1.02, 32, 32]} />
        <meshBasicMaterial
          color={atmosphereColor}
          transparent
          opacity={0.4 * density}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Cloud layers for terrestrial planets */}
      {cloudMaterial && (
        <mesh ref={cloudLayerRef}>
          <sphereGeometry args={[planetRadius * (1 + atmosphereConfig.cloudHeight), 32, 32]} />
          <primitive object={cloudMaterial} attach="material" />
        </mesh>
      )}

      {/* Multiple atmosphere layers for gas giants */}
      {planetType === 'gas' && Array.from({ length: atmosphereConfig.layers }).map((_, index) => (
        <mesh key={index}>
          <sphereGeometry args={[
            planetRadius * (1 + atmosphereConfig.thickness * (1 + index * 0.3)), 
            24, 
            24
          ]} />
          <meshBasicMaterial
            color={atmosphereColor}
            transparent
            opacity={0.2 * density / (index + 1)}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}

      {/* Atmospheric particles */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={100}
            array={useMemo(() => {
              const positions = new Float32Array(100 * 3);
              for (let i = 0; i < 100; i++) {
                const radius = planetRadius * (1.05 + Math.random() * 0.1);
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                
                positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
                positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
                positions[i * 3 + 2] = radius * Math.cos(phi);
              }
              return positions;
            }, [planetRadius])}
            itemSize={3}
            args={[new Float32Array(100 * 3), 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color={atmosphereColor}
          size={0.02}
          transparent
          opacity={0.5 * density}
          sizeAttenuation={true}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};

// Atmospheric scattering effect component
interface AtmosphericScatteringProps {
  sunPosition: [number, number, number];
  planetPosition: [number, number, number];
  planetRadius: number;
  atmosphereColor: string;
}

export const AtmosphericScattering = ({ 
  sunPosition, 
  planetPosition, 
  planetRadius, 
  atmosphereColor 
}: AtmosphericScatteringProps) => {
  const scatteringRef = useRef<THREE.Mesh>(null);

  const scatteringMaterial = useMemo(() => {
    const vertexShader = `
      varying vec3 vWorldPosition;
      varying vec3 vNormal;
      
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform vec3 sunPosition;
      uniform vec3 planetPosition;
      uniform vec3 atmosphereColor;
      uniform float intensity;
      
      varying vec3 vWorldPosition;
      varying vec3 vNormal;
      
      void main() {
        vec3 toSun = normalize(sunPosition - vWorldPosition);
        vec3 toPlanet = normalize(planetPosition - vWorldPosition);
        
        float sunDot = max(0.0, dot(vNormal, toSun));
        float planetDot = max(0.0, dot(vNormal, -toPlanet));
        
        float scattering = sunDot * planetDot * intensity;
        
        gl_FragColor = vec4(atmosphereColor * scattering, scattering * 0.5);
      }
    `;

    return new THREE.ShaderMaterial({
      uniforms: {
        sunPosition: { value: new THREE.Vector3(...sunPosition) },
        planetPosition: { value: new THREE.Vector3(...planetPosition) },
        atmosphereColor: { value: new THREE.Color(atmosphereColor) },
        intensity: { value: 1.0 }
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending
    });
  }, [sunPosition, planetPosition, atmosphereColor]);

  useFrame(() => {
    if (scatteringRef.current) {
      const material = scatteringRef.current.material as THREE.ShaderMaterial;
      if (material.uniforms) {
        material.uniforms.sunPosition.value.set(...sunPosition);
        material.uniforms.planetPosition.value.set(...planetPosition);
      }
    }
  });

  return (
    <mesh ref={scatteringRef}>
      <sphereGeometry args={[planetRadius * 1.1, 32, 32]} />
      <primitive object={scatteringMaterial} attach="material" />
    </mesh>
  );
};