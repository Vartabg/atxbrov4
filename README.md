<div align="center">

# 🌌 ATX Bro v4

**Interactive 3D Solar System Portfolio**

*Navigate a solar system. Dock at a space station. Enter the Stargate.*

[![Next.js](https://img.shields.io/badge/Next.js-0D1117?style=flat-square&logo=nextdotjs&logoColor=00D4FF)](https://nextjs.org)
[![Three.js](https://img.shields.io/badge/Three.js-0D1117?style=flat-square&logo=threedotjs&logoColor=00D4FF)](https://threejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-0D1117?style=flat-square&logo=typescript&logoColor=00D4FF)](https://typescriptlang.org)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-0D1117?style=flat-square&logo=vercel&logoColor=00D4FF)](https://atxbro.com)

</div>

---

## What Is This

A portfolio site disguised as a space game. Instead of a boring list of projects, visitors fly through a solar system where each planet represents a skill domain. Approach a planet to see its details. Dock at the central space station. Pass through the Stargate to enter the application layer.

Built with **Next.js 15**, **React Three Fiber**, and custom **GLSL shaders** for planet surfaces, atmospheric glow, and post-processing effects.

## Architecture

```
src/
├── components/
│   ├── SolarSystem/       # Planet configs, orbit mechanics, camera rig
│   ├── SpaceStation/      # Dockable station with morph geometry
│   ├── Stargate/          # Warp transition + Next.js routing bridge
│   └── HUD/               # In-canvas UI overlays (no DOM layering)
├── shaders/               # Custom GLSL (atmosphere, fresnel, noise)
├── hooks/                 # useCamera, useNavigation, usePlanetData
└── app/                   # Next.js app router pages
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| 3D Engine | React Three Fiber + Drei |
| Shaders | Custom GLSL (vertex + fragment) |
| State | Zustand |
| Styling | Tailwind CSS |
| Deployment | Vercel |
| Language | TypeScript (98.7%) |

## Run Locally

```bash
git clone https://github.com/Vartabg/atxbrov4.git
cd atxbrov4
npm install
npm run dev
# Open http://localhost:3000
```

## License

MIT
