export interface PlanetConfig {
  id: string
  position: [number, number, number]
  planetName: string
  planetSubtitle: string
  planetData: string
  planetColor?: string
  appRoute: string
  textureSet: {
    baseColor: string
    normal: string
    roughness: string
    ao: string
    height: string
    metallic?: string
    opacity?: string
    specular?: string
  }
}

export interface UniverseConfig {
  camera: {
    initialPosition: [number, number, number]
    fov: number
  }
  planets: PlanetConfig[]
  scene: {
    backgroundColor: string
    stars: {
      count: number
      radius: number
      factor: number
    }
  }
}

export const defaultUniverseConfig: UniverseConfig = {
  camera: {
    initialPosition: [0, 0, 25],
    fov: 50
  },
  planets: [
    {
      id: 'vetnav',
      position: [-35, 15, -10],  // Top left quadrant
      planetName: 'VETNAV-7',
      planetSubtitle: 'Veterans Benefits Navigator',
      planetData: '18.2M Veterans',
      planetColor: '#4a9eff',
      appRoute: '/vetnav',
      textureSet: {
        baseColor: '/textures/greenPlanet_BaseColor.png',
        normal: '/textures/greenPlanet_Normal.png',
        roughness: '/textures/greenPlanet_Roughness.png',
        ao: '/textures/greenPlanet_AmbientOcclusion.png',
        height: '/textures/greenPlanet_Height.png',
        metallic: '/textures/greenPlanet_Metallic.png',
        opacity: '/textures/greenPlanet_Opacity.png'
      }
    },
    {
      id: 'tariff',
      position: [30, 20, 8],     // Top right quadrant  
      planetName: 'TARIFF-7',
      planetSubtitle: 'Trade Command Station',
      planetData: '2.4B Trade Records',
      planetColor: '#ff6b47',
      appRoute: '/tariff-explorer',
      textureSet: {
        baseColor: '/textures/gasPlanet_BaseColor.png',
        normal: '/textures/gasPlanet_Normal.png',
        roughness: '/textures/gasPlanet_Roughness.png',
        ao: '/textures/gasPlanet_AmbientOcclusion.png',
        height: '/textures/gasPlanet_Height.png',
        metallic: '/textures/gasPlanet_Metallic.png',
        opacity: '/textures/gasPlanet_Opacity.png',
        specular: '/textures/gasPlanet_SpecularLevel.png'
      }
    },
    {
      id: 'petradar',
      position: [-25, -18, 15],  // Bottom left quadrant
      planetName: 'PET-RADAR-9',
      planetSubtitle: 'Animal Rescue Network',
      planetData: '847K Pet Records',
      planetColor: '#9d4edd',
      appRoute: '/pet-radar',
      textureSet: {
        baseColor: '/textures/desolate dirt planet_BaseColor.png',
        normal: '/textures/desolate dirt planet_Normal.png',
        roughness: '/textures/desolate dirt planet_Roughness.png',
        ao: '/textures/desolate dirt planet_AmbientOcclusion.png',
        height: '/textures/desolate dirt planet_Height.png',
        metallic: '/textures/desolate dirt planet_Metallic.png',
        opacity: '/textures/desolate dirt planet_Opacity.png',
        specular: '/textures/desolate dirt planet_SpecularLevel.png'
      }
    },
    {
      id: 'jetshome',
      position: [40, -12, -20],  // Bottom right quadrant
      planetName: 'JETS-HOME',
      planetSubtitle: 'Sports Analytics Hub',
      planetData: '156K Game Stats',
      planetColor: '#06ffa5',
      appRoute: '/jets-home',
      textureSet: {
        baseColor: '/textures/jetsSkin_BaseColor.png',
        normal: '/textures/jetsSkin_Normal.png',
        roughness: '/textures/jetsSkin_Roughness.png',
        ao: '/textures/jetsSkin_AmbientOcclusion.png',
        height: '/textures/jetsSkin_Height.png',
        metallic: '/textures/jetsSkin_Metallic.png',
        opacity: '/textures/jetsSkin_Opacity.png',
        specular: '/textures/jetsSkin_SpecularLevel.png'
      }
    }
  ],
  scene: {
    backgroundColor: '#000014',
    stars: {
      count: 5000,
      radius: 300,
      factor: 4
    }
  }
}
