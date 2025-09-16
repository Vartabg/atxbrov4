import { useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { PlanetConfig } from '../systems/UniverseConfig';
import { textureLoader } from '../systems/TextureLoader';

interface LoadedTextures {
  baseColor?: THREE.Texture;
  normal?: THREE.Texture;
  roughness?: THREE.Texture;
  ao?: THREE.Texture;
  height?: THREE.Texture;
  metallic?: THREE.Texture;
  opacity?: THREE.Texture;
  specular?: THREE.Texture;
}

interface PlanetMaterialConfig {
  hovered: boolean;
  planetType: 'terrestrial' | 'gas' | 'desolate' | 'sports';
  fallbackColor?: string;
  fallbackEmissive?: string;
}

export const usePlanetMaterial = (
  planetConfig: PlanetConfig | null,
  config: PlanetMaterialConfig
) => {
  const [textures, setTextures] = useState<LoadedTextures>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load textures
  useEffect(() => {
    let isMounted = true;
    
    if (!planetConfig) {
      setIsLoading(false);
      return;
    }
    
    const loadTextures = async () => {
      try {
        const loadedTextures = await textureLoader.loadPlanetTextures(planetConfig);
        if (isMounted) {
          setTextures(loadedTextures);
          setIsLoading(false);
        }
      } catch (error) {
        console.warn(`Failed to load textures for planet ${planetConfig.id}:`, error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadTextures();

    return () => {
      isMounted = false;
    };
  }, [planetConfig]);

  // Create enhanced PBR material
  const material = useMemo(() => {
    if (isLoading || !planetConfig) {
      // Return a basic fallback material
      return new THREE.MeshStandardMaterial({
        color: config.fallbackColor || planetConfig?.planetColor || '#ffffff',
        emissive: config.hovered ? '#333333' : (config.fallbackEmissive || '#000000'),
        emissiveIntensity: config.hovered ? 0.3 : 0.1,
        metalness: 0.1,
        roughness: 0.8,
      });
    }

    // Planet type specific material settings
    const materialSettings = getPlanetMaterialSettings(config.planetType);
    
    const pbrMaterial = new THREE.MeshStandardMaterial({
      // Base properties
      map: textures.baseColor,
      normalMap: textures.normal,
      roughnessMap: textures.roughness,
      aoMap: textures.ao,
      displacementMap: textures.height,
      metalnessMap: textures.metallic,
      
      // Material properties
      metalness: materialSettings.metalness,
      roughness: materialSettings.roughness,
      
      // Displacement settings (for surface detail)
      displacementScale: materialSettings.displacementScale,
      
      // Environmental settings
      envMapIntensity: materialSettings.envMapIntensity,
      
      // Hover effects
      emissive: config.hovered ? 
        new THREE.Color(materialSettings.hoverEmissive) : 
        new THREE.Color(materialSettings.baseEmissive),
      emissiveIntensity: config.hovered ? 
        materialSettings.hoverEmissiveIntensity : 
        materialSettings.baseEmissiveIntensity,
      
      // Additional properties
      transparent: materialSettings.transparent,
      opacity: materialSettings.opacity,
    });

    // Set AO map to second UV channel if available
    if (textures.ao) {
      pbrMaterial.aoMapIntensity = materialSettings.aoIntensity;
    }

    // Configure normal map intensity
    if (textures.normal) {
      pbrMaterial.normalScale = new THREE.Vector2(
        materialSettings.normalIntensity, 
        materialSettings.normalIntensity
      );
    }

    return pbrMaterial;
  }, [textures, config.hovered, config.planetType, config.fallbackColor, config.fallbackEmissive, planetConfig, isLoading]);

  return { material, isLoading };
};

// Planet-specific material configurations
function getPlanetMaterialSettings(planetType: string) {
  const baseSettings = {
    metalness: 0.1,
    roughness: 0.8,
    displacementScale: 0.2,
    envMapIntensity: 0.8,
    baseEmissive: '#000000',
    baseEmissiveIntensity: 0.05,
    hoverEmissive: '#333333',
    hoverEmissiveIntensity: 0.3,
    transparent: false,
    opacity: 1.0,
    aoIntensity: 1.0,
    normalIntensity: 1.0,
  };

  switch (planetType) {
    case 'terrestrial': // VetNav - Green planet
      return {
        ...baseSettings,
        metalness: 0.05,
        roughness: 0.9,
        displacementScale: 0.15,
        envMapIntensity: 0.6,
        hoverEmissive: '#0a4a2a',
        aoIntensity: 1.2,
        normalIntensity: 0.8,
      };

    case 'gas': // Tariff Explorer - Gas giant
      return {
        ...baseSettings,
        metalness: 0.0,
        roughness: 0.7,
        displacementScale: 0.1,
        envMapIntensity: 1.2,
        hoverEmissive: '#4a2a0a',
        baseEmissiveIntensity: 0.1,
        hoverEmissiveIntensity: 0.4,
        normalIntensity: 1.2,
      };

    case 'desolate': // Pet Radar - Desolate planet
      return {
        ...baseSettings,
        metalness: 0.2,
        roughness: 0.95,
        displacementScale: 0.3,
        envMapIntensity: 0.4,
        hoverEmissive: '#2a1a4a',
        baseEmissiveIntensity: 0.02,
        aoIntensity: 1.5,
        normalIntensity: 1.5,
      };

    case 'sports': // JetsHome - Sports themed
      return {
        ...baseSettings,
        metalness: 0.3,
        roughness: 0.6,
        displacementScale: 0.1,
        envMapIntensity: 1.0,
        hoverEmissive: '#0a4a3a',
        baseEmissiveIntensity: 0.08,
        hoverEmissiveIntensity: 0.35,
        normalIntensity: 0.9,
      };

    default:
      return baseSettings;
  }
}