export interface PlanetConfig {
  id: string
  position: [number, number, number]
  planetName: string
  planetSubtitle: string
  planetData: string
  planetColor?: string
  appRoute: string
  textureSet?: {
    baseColor: string
    normal: string
    roughness: string
    ao: string
    height: string
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
    initialPosition: [0, 0, 20],
    fov: 45
  },
  planets: [
    {
      id: 'vetnav',
      position: [-8, 4, -3],
      planetName: 'VETNAV-7',
      planetSubtitle: 'Veterans Benefits Navigator',
      planetData: '18.2M Veterans',
      planetColor: '#4a9eff',
      appRoute: '/vetnav'
    },
    {
      id: 'tariff',
      position: [12, -2, 8],
      planetName: 'TARIFF-7',
      planetSubtitle: 'Trade Command Station',
      planetData: '2.4B Trade Records',
      planetColor: '#ff6b47',
      appRoute: '/tariff-explorer'
    },
    {
      id: 'petradar',
      position: [-5, -6, 12],
      planetName: 'PET-RADAR-9',
      planetSubtitle: 'Animal Rescue Network',
      planetData: '847K Pet Records',
      planetColor: '#9d4edd',
      appRoute: '/pet-radar'
    },
    {
      id: 'jetshome',
      position: [7, 8, -6],
      planetName: 'JETS-HOME',
      planetSubtitle: 'Sports Analytics Hub',
      planetData: '156K Game Stats',
      planetColor: '#06ffa5',
      appRoute: '/jets-home'
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
