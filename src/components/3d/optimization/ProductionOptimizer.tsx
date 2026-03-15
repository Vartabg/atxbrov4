"use client";

import { lazy, Suspense, memo, useMemo, useCallback, Component } from 'react';
import { Canvas } from '@react-three/fiber';

// Simple Error Boundary implementation
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  FallbackComponent: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>;
  onReset?: () => void;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const { FallbackComponent } = this.props;
      return <FallbackComponent error={this.state.error} resetErrorBoundary={this.resetErrorBoundary} />;
    }

    return this.props.children;
  }
}

// Lazy load heavy 3D components
const EnhancedSpaceScene = lazy(() => 
  import('../EnhancedSpaceCanvas').then(module => ({ 
    default: module.EnhancedSpaceCanvas 
  }))
);

const VetNavMapCanvas = lazy(() => 
  import('../VetNavMapCanvas').then(module => ({ 
    default: module.VetNavMapCanvas 
  }))
);

const InteractiveUSMap = lazy(() => 
  import('../InteractiveUSMap').then(module => ({ 
    default: module.InteractiveUSMap 
  }))
);

// Preload critical effects (lazy loaded but not directly used in render)
// These are used by the preloadCriticalComponents function

// Loading components with different complexity levels
const MinimalLoader = memo(() => (
  <div className="flex items-center justify-center h-full bg-gradient-to-b from-blue-900 to-black">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-white text-lg">Loading Space Navigation...</p>
    </div>
  </div>
));
MinimalLoader.displayName = 'MinimalLoader';

const DetailedLoader = memo(() => (
  <div className="flex items-center justify-center h-full bg-gradient-to-b from-blue-900 to-black">
    <div className="text-center max-w-md">
      <div className="relative mb-6">
        <div className="w-20 h-20 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <div className="w-12 h-12 border-4 border-purple-400 border-b-transparent rounded-full animate-spin mx-auto absolute top-4 left-1/2 transform -translate-x-1/2"></div>
      </div>
      <h3 className="text-white text-xl font-bold mb-2">Initializing 3D Environment</h3>
      <p className="text-blue-200 text-sm">Loading enhanced visual effects and interactive systems...</p>
      <div className="mt-4 w-full bg-blue-900 rounded-full h-2">
        <div className="bg-blue-400 h-2 rounded-full animate-pulse w-3/4"></div>
      </div>
    </div>
  </div>
));
DetailedLoader.displayName = 'DetailedLoader';

// Error fallback components
const SpaceErrorFallback = memo(({ error, resetErrorBoundary }: { 
  error: Error; 
  resetErrorBoundary: () => void; 
}) => (
  <div className="flex items-center justify-center h-full bg-gradient-to-b from-red-900 to-black">
    <div className="text-center max-w-md p-6">
      <div className="text-red-400 mb-4">
        <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </div>
      <h3 className="text-white text-xl font-bold mb-2">3D Loading Error</h3>
      <p className="text-gray-300 text-sm mb-4">
        Unable to initialize 3D graphics. This may be due to WebGL compatibility issues.
      </p>
      <button
        onClick={resetErrorBoundary}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-300"
      >
        Retry Loading
      </button>
      <div className="mt-4 text-xs text-gray-400">
        Error: {error.message}
      </div>
    </div>
  </div>
));
SpaceErrorFallback.displayName = 'SpaceErrorFallback';

// Progressive enhancement wrapper
interface ProgressiveCanvasProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  enableWebGL?: boolean;
}

const ProgressiveCanvas = memo(({ children, fallback, enableWebGL = true }: ProgressiveCanvasProps) => {
  const canvasConfig = useMemo(() => {
    // Detect device capabilities
    const isLowEndDevice = navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 4 : false;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    return {
      dpr: isLowEndDevice ? 1 : [1, 2] as [number, number],
      performance: {
        min: isMobile ? 0.3 : 0.5,
        max: 1
      },
      gl: {
        antialias: !isLowEndDevice,
        alpha: false,
        powerPreference: isMobile ? "low-power" as const : "high-performance" as const,
        stencil: false,
        depth: true,
        preserveDrawingBuffer: false,
        premultipliedAlpha: true,
        failIfMajorPerformanceCaveat: isLowEndDevice
      }
    };
  }, []);

  if (!enableWebGL) {
    return <>{fallback}</>;
  }

  return (
    <Canvas {...canvasConfig}>
      {children}
    </Canvas>
  );
});
ProgressiveCanvas.displayName = 'ProgressiveCanvas';

// Bundle size optimization utilities
export const preloadCriticalComponents = () => {
  // Preload components that are likely to be used
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    (window as Window & { requestIdleCallback: typeof requestIdleCallback }).requestIdleCallback(() => {
      import('../effects/EnhancedStarField');
      import('../effects/NebulaSystem');
    });
  }
};

export const getOptimizedComponentLoader = (component: string) => {
  const loaderConfig = {
    'space-canvas': {
      component: EnhancedSpaceScene,
      loader: DetailedLoader,
      preload: true
    },
    'map-canvas': {
      component: VetNavMapCanvas,
      loader: MinimalLoader,
      preload: false
    },
    'us-map': {
      component: InteractiveUSMap,
      loader: MinimalLoader,
      preload: false
    }
  };

  return loaderConfig[component as keyof typeof loaderConfig];
};

// Memory management hook
export const useMemoryOptimization = () => {
  const cleanupMemory = useCallback(() => {
    // Force garbage collection if available
    if ('gc' in window) {
      (window as Window & { gc?: () => void }).gc?.();
    }
    
    // Clear Three.js caches
    if (typeof window !== 'undefined' && (window as Window & { THREE?: { Cache?: { clear: () => void } } }).THREE) {
      // Clear texture cache
      const textureCache = (window as Window & { THREE?: { Cache?: { clear: () => void } } }).THREE?.Cache;
      if (textureCache) {
        textureCache.clear();
      }
    }
  }, []);

  const getMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory;
      if (memory) {
        return {
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
          percentage: Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100)
        };
      }
    }
    return null;
  }, []);

  return { cleanupMemory, getMemoryUsage };
};

// Production-ready component wrapper
interface OptimizedSpaceComponentProps {
  componentType: 'space-canvas' | 'map-canvas' | 'us-map';
  onPlanetClick?: (planet: string) => void;
  className?: string;
  [key: string]: unknown;
}

export const OptimizedSpaceComponent = memo(({
  componentType,
  onPlanetClick,
  className = '',
  ...props
}: OptimizedSpaceComponentProps) => {
  const config = getOptimizedComponentLoader(componentType);
  
  if (!config) {
    return <div className="text-red-500">Unknown component type: {componentType}</div>;
  }

  const { component: Component, loader: Loader } = config;

  return (
    <div className={`relative ${className}`}>
      <ErrorBoundary
        FallbackComponent={SpaceErrorFallback}
        onReset={() => window.location.reload()}
      >
        <Suspense fallback={<Loader />}>
          <Component 
            onPlanetClick={onPlanetClick || (() => {})}
            {...props}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
});
OptimizedSpaceComponent.displayName = 'OptimizedSpaceComponent';

// Resource preloader
export const ResourcePreloader = memo(() => {
  // Preload critical textures and assets
  useMemo(() => {
    if (typeof window === 'undefined') return;

    const preloadTextures = [
      '/textures/greenPlanet_BaseColor.png',
      '/textures/gasPlanet_BaseColor.png',
      '/textures/jetsSkin_BaseColor.png'
    ];

    const preloadPromises = preloadTextures.map(url => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });
    });

    Promise.allSettled(preloadPromises).then(results => {
      const failed = results.filter(r => r.status === 'rejected').length;
      console.log(`Preloaded ${results.length - failed}/${results.length} critical textures`);
    });
  }, []);

  return null;
});
ResourcePreloader.displayName = 'ResourcePreloader';

// Code splitting boundaries
export const SpaceNavigationApp = memo(() => (
  <ErrorBoundary FallbackComponent={SpaceErrorFallback}>
    <ResourcePreloader />
    <Suspense fallback={<DetailedLoader />}>
      <OptimizedSpaceComponent componentType="space-canvas" />
    </Suspense>
  </ErrorBoundary>
));
SpaceNavigationApp.displayName = 'SpaceNavigationApp';

export const VetNavMapApp = memo(({ onStateSelect }: { onStateSelect?: (state: unknown) => void }) => (
  <ErrorBoundary FallbackComponent={SpaceErrorFallback}>
    <Suspense fallback={<MinimalLoader />}>
      <OptimizedSpaceComponent 
        componentType="map-canvas" 
        onStateSelect={onStateSelect}
      />
    </Suspense>
  </ErrorBoundary>
));
VetNavMapApp.displayName = 'VetNavMapApp';

// Export optimization utilities
export { 
  MinimalLoader, 
  DetailedLoader, 
  SpaceErrorFallback, 
  ProgressiveCanvas 
};