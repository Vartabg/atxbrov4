import * as THREE from 'three';
import { PlanetConfig } from './UniverseConfig';

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

interface TextureCacheEntry {
  texture: THREE.Texture;
  timestamp: number;
  usage: number;
}

export class EnhancedTextureLoader {
  private static instance: EnhancedTextureLoader;
  private loader: THREE.TextureLoader;
  private cache = new Map<string, TextureCacheEntry>();
  private loadingPromises = new Map<string, Promise<THREE.Texture>>();
  
  // Performance settings
  private maxCacheSize = 50;
  private cacheTimeout = 300000; // 5 minutes
  
  private constructor() {
    this.loader = new THREE.TextureLoader();
    this.setupTextureDefaults();
  }
  
  static getInstance(): EnhancedTextureLoader {
    if (!EnhancedTextureLoader.instance) {
      EnhancedTextureLoader.instance = new EnhancedTextureLoader();
    }
    return EnhancedTextureLoader.instance;
  }
  
  private setupTextureDefaults() {
    // Configure loader for better performance
    this.loader.setCrossOrigin('anonymous');
  }
  
  private async loadSingleTexture(path: string): Promise<THREE.Texture> {
    // Check cache first
    const cached = this.cache.get(path);
    if (cached) {
      cached.usage++;
      cached.timestamp = Date.now();
      return cached.texture;
    }
    
    // Check if already loading
    const existingPromise = this.loadingPromises.get(path);
    if (existingPromise) {
      return existingPromise;
    }
    
    // Load new texture
    const loadPromise = new Promise<THREE.Texture>((resolve) => {
      this.loader.load(
        path,
        (texture: THREE.Texture) => {
          // Configure texture for PBR
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          texture.generateMipmaps = true;
          texture.minFilter = THREE.LinearMipmapLinearFilter;
          texture.magFilter = THREE.LinearFilter;
          
          // Cache the texture
          this.cache.set(path, {
            texture,
            timestamp: Date.now(),
            usage: 1
          });
          
          this.loadingPromises.delete(path);
          this.cleanCache();
          resolve(texture);
        },
        undefined,
        (error: unknown) => {
          this.loadingPromises.delete(path);
          console.warn(`Failed to load texture: ${path}`, error);
          // Return a fallback white texture
          const fallback = new THREE.Texture();
          fallback.image = { width: 1, height: 1 };
          fallback.needsUpdate = true;
          resolve(fallback);
        }
      );
    });
    
    this.loadingPromises.set(path, loadPromise);
    return loadPromise;
  }
  
  async loadPlanetTextures(planetConfig: PlanetConfig): Promise<LoadedTextures> {
    const { textureSet } = planetConfig;
    const loadedTextures: LoadedTextures = {};
    
    try {
      // Load all textures in parallel
      const loadPromises: Promise<void>[] = [];
      
      if (textureSet.baseColor) {
        loadPromises.push(
          this.loadSingleTexture(textureSet.baseColor).then(tex => {
            tex.colorSpace = THREE.SRGBColorSpace;
            loadedTextures.baseColor = tex;
          })
        );
      }
      
      if (textureSet.normal) {
        loadPromises.push(
          this.loadSingleTexture(textureSet.normal).then(tex => {
            tex.colorSpace = THREE.NoColorSpace;
            loadedTextures.normal = tex;
          })
        );
      }
      
      if (textureSet.roughness) {
        loadPromises.push(
          this.loadSingleTexture(textureSet.roughness).then(tex => {
            tex.colorSpace = THREE.NoColorSpace;
            loadedTextures.roughness = tex;
          })
        );
      }
      
      if (textureSet.ao) {
        loadPromises.push(
          this.loadSingleTexture(textureSet.ao).then(tex => {
            tex.colorSpace = THREE.NoColorSpace;
            loadedTextures.ao = tex;
          })
        );
      }
      
      if (textureSet.height) {
        loadPromises.push(
          this.loadSingleTexture(textureSet.height).then(tex => {
            tex.colorSpace = THREE.NoColorSpace;
            loadedTextures.height = tex;
          })
        );
      }
      
      if (textureSet.metallic) {
        loadPromises.push(
          this.loadSingleTexture(textureSet.metallic).then(tex => {
            tex.colorSpace = THREE.NoColorSpace;
            loadedTextures.metallic = tex;
          })
        );
      }
      
      if (textureSet.opacity) {
        loadPromises.push(
          this.loadSingleTexture(textureSet.opacity).then(tex => {
            tex.colorSpace = THREE.NoColorSpace;
            loadedTextures.opacity = tex;
          })
        );
      }
      
      if (textureSet.specular) {
        loadPromises.push(
          this.loadSingleTexture(textureSet.specular).then(tex => {
            tex.colorSpace = THREE.NoColorSpace;
            loadedTextures.specular = tex;
          })
        );
      }
      
      await Promise.all(loadPromises);
      
    } catch (error) {
      console.warn(`Error loading textures for planet ${planetConfig.id}:`, error);
    }
    
    return loadedTextures;
  }
  
  private cleanCache() {
    if (this.cache.size <= this.maxCacheSize) return;
    
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    // Sort by usage and age
    entries.sort((a, b) => {
      const ageA = now - a[1].timestamp;
      const ageB = now - b[1].timestamp;
      const scoreA = a[1].usage / (ageA + 1);
      const scoreB = b[1].usage / (ageB + 1);
      return scoreA - scoreB;
    });
    
    // Remove least used/oldest entries
    const toRemove = entries.slice(0, entries.length - this.maxCacheSize);
    toRemove.forEach(([path, entry]) => {
      entry.texture.dispose();
      this.cache.delete(path);
    });
  }
  
  // Preload textures for better performance
  async preloadPlanetTextures(planets: PlanetConfig[]): Promise<void> {
    const preloadPromises = planets.map(planet => 
      this.loadPlanetTextures(planet)
    );
    
    try {
      await Promise.all(preloadPromises);
      console.log('All planet textures preloaded successfully');
    } catch (error) {
      console.warn('Some textures failed to preload:', error);
    }
  }
  
  // Clean up resources
  dispose() {
    this.cache.forEach(entry => entry.texture.dispose());
    this.cache.clear();
    this.loadingPromises.clear();
  }
}

// Export singleton instance
export const textureLoader = EnhancedTextureLoader.getInstance();