"use client";

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';

export const EnhancedCosmicBackground = () => {
  const nebulaRef = useRef<THREE.Mesh>(null);
  const innerStarsRef = useRef<THREE.Points>(null);
  const outerStarsRef = useRef<THREE.Points>(null);
  const shootingStarsRef = useRef<THREE.Points>(null);
  
  // Enhanced multi-layer star field with much smaller, realistic sizing
  const { innerStars, outerStars } = useMemo(() => {
    // Inner layer - closer, brighter stars
    const innerPositions = new Float32Array(3000 * 3);
    const innerSizes = new Float32Array(3000);
    const innerColors = new Float32Array(3000 * 3);
    
    // Outer layer - distant stars
    const outerPositions = new Float32Array(8000 * 3);
    const outerSizes = new Float32Array(8000);
    const outerColors = new Float32Array(8000 * 3);
    
    // Generate inner stars (radius 50-100)
    for (let i = 0; i < 3000; i++) {
      const radius = 50 + Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      innerPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      innerPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      innerPositions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Much smaller star sizes
      const magnitude = Math.random();
      innerSizes[i] = 0.05 + magnitude * 0.15; // Max 0.2 instead of 2.5
      
      // Star colors based on magnitude
      if (magnitude > 0.8) {
        // Bright blue giants
        innerColors[i * 3] = 0.7; innerColors[i * 3 + 1] = 0.8; innerColors[i * 3 + 2] = 1;
      } else if (magnitude > 0.6) {
        // White stars
        innerColors[i * 3] = 1; innerColors[i * 3 + 1] = 1; innerColors[i * 3 + 2] = 1;
      } else if (magnitude > 0.3) {
        // Yellow stars
        innerColors[i * 3] = 1; innerColors[i * 3 + 1] = 0.9; innerColors[i * 3 + 2] = 0.7;
      } else {
        // Red dwarfs
        innerColors[i * 3] = 1; innerColors[i * 3 + 1] = 0.6; innerColors[i * 3 + 2] = 0.4;
      }
    }
    
    // Generate outer stars (radius 200-300)
    for (let i = 0; i < 8000; i++) {
      const radius = 200 + Math.random() * 100;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      outerPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      outerPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      outerPositions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Even smaller distant stars
      outerSizes[i] = 0.02 + Math.random() * 0.08; // Max 0.1 instead of 1.0
      
      // Mostly white with some variation
      const colorVar = 0.8 + Math.random() * 0.2;
      outerColors[i * 3] = colorVar;
      outerColors[i * 3 + 1] = colorVar;
      outerColors[i * 3 + 2] = colorVar;
    }
    
    return {
      innerStars: { positions: innerPositions, sizes: innerSizes, colors: innerColors },
      outerStars: { positions: outerPositions, sizes: outerSizes, colors: outerColors }
    };
  }, []);
  
  // Shooting stars
  const shootingStarPositions = useMemo(() => {
    const positions = new Float32Array(8 * 3); // Reduced from 15 to 8
    for (let i = 0; i < 8; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = 50 + Math.random() * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    return positions;
  }, []);
  
  // Procedural nebula shader
  const nebulaShader = useMemo(() => ({
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      varying vec3 vWorldPosition;
      
      // Simple noise function
      float noise(vec3 p) {
        return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
      }
      
      // Fractal noise
      float fbm(vec3 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        
        for(int i = 0; i < 4; i++) {
          value += amplitude * noise(p * frequency);
          amplitude *= 0.5;
          frequency *= 2.0;
        }
        
        return value;
      }
      
      void main() {
        vec3 coord = normalize(vWorldPosition) * 2.0;
        
        // Add time-based movement
        coord += time * 0.02;
        
        // Generate nebula density
        float density = fbm(coord);
        density = smoothstep(0.4, 0.8, density);
        
        // Color gradient (deep space colors)
        vec3 color1 = vec3(0.1, 0.0, 0.3); // Deep purple
        vec3 color2 = vec3(0.3, 0.1, 0.6); // Purple
        vec3 color3 = vec3(0.6, 0.2, 0.8); // Bright purple
        
        vec3 nebulaColor = mix(color1, color2, density);
        nebulaColor = mix(nebulaColor, color3, density * density);
        
        // Add some cyan highlights
        float highlight = fbm(coord * 3.0 + time * 0.05);
        highlight = smoothstep(0.7, 1.0, highlight);
        nebulaColor += vec3(0.0, 0.3, 0.6) * highlight * 0.3;
        
        gl_FragColor = vec4(nebulaColor, density * 0.08); // Reduced opacity from 0.15
      }
    `,
    uniforms: {
      time: { value: 0 }
    }
  }), []);

  useFrame((state, delta) => {
    // Slowly rotate star fields for parallax
    if (innerStarsRef.current) {
      innerStarsRef.current.rotation.y += delta * 0.01;
      innerStarsRef.current.rotation.x += delta * 0.005;
    }
    
    if (outerStarsRef.current) {
      outerStarsRef.current.rotation.y += delta * 0.005;
      outerStarsRef.current.rotation.x += delta * 0.002;
    }
    
    // Animate nebula
    if (nebulaRef.current) {
      nebulaRef.current.rotation.y += delta * 0.003;
      const material = nebulaRef.current.material as THREE.ShaderMaterial;
      if (material && material.uniforms && material.uniforms.time) {
        material.uniforms.time.value = state.clock.elapsedTime;
      }
    }
    
    // Animate shooting stars
    if (shootingStarsRef.current) {
      const positions = shootingStarsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        // Move diagonally down and forward
        positions[i] += delta * 15;     // X
        positions[i + 1] -= delta * 10; // Y
        positions[i + 2] += delta * 20; // Z
        
        // Reset if too far
        if (positions[i] > 100 || positions[i + 1] < -30) {
          positions[i] = -100 + Math.random() * 50;
          positions[i + 1] = 50 + Math.random() * 50;
          positions[i + 2] = -100 + Math.random() * 200;
        }
      }
      shootingStarsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Outer nebula shell */}
      <Sphere ref={nebulaRef} args={[300, 32, 32]}>
        <shaderMaterial
          attach="material"
          vertexShader={nebulaShader.vertexShader}
          fragmentShader={nebulaShader.fragmentShader}
          uniforms={nebulaShader.uniforms}
          transparent
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>
      
      {/* Outer star field layer */}
      <Points
        ref={outerStarsRef}
        positions={outerStars.positions}
        colors={outerStars.colors}
        stride={3}
        frustumCulled={false}
      >
        <PointMaterial
          transparent
          vertexColors
          size={0.3} // Reduced from 1
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.6} // Reduced from 0.8
        />
      </Points>
      
      {/* Inner star field layer */}
      <Points
        ref={innerStarsRef}
        positions={innerStars.positions}
        colors={innerStars.colors}
        stride={3}
        frustumCulled={false}
      >
        <PointMaterial
          transparent
          vertexColors
          size={0.5} // Reduced from 2
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.7} // Reduced from 0.9
        />
      </Points>
      
      {/* Shooting stars */}
      <Points
        ref={shootingStarsRef}
        positions={shootingStarPositions}
        stride={3}
        frustumCulled={false}
      >
        <PointMaterial
          transparent
          color="#ffff88"
          size={1.5} // Reduced from 4
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.6} // Reduced from 0.8
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
};
