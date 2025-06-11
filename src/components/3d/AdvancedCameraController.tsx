import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface CameraState {
  position: THREE.Vector3
  quaternion: THREE.Quaternion
  velocity: THREE.Vector3
  angularVelocity: THREE.Quaternion
}

export function useAdvancedCamera() {
  const { camera, controls } = useThree()
  const targetState = useRef<CameraState | null>(null)
  const currentState = useRef<CameraState>({
    position: camera.position.clone(),
    quaternion: camera.quaternion.clone(),
    velocity: new THREE.Vector3(0, 0, 0),
    angularVelocity: new THREE.Quaternion(0, 0, 0, 1)
  })
  const isAnimating = useRef(false)
  const animationProgress = useRef(0)
  const onComplete = useRef<(() => void) | null>(null)
  const hudTriggered = useRef(false)
  const epsilon = 0.0001

  // RESEARCH-BASED FIX: Robust vector normalization with epsilon checking
  const robustNormalize = (vector: THREE.Vector3): THREE.Vector3 => {
    const length = vector.length()
    if (length < epsilon) {
      console.warn('Vector near zero, using fallback direction')
      return new THREE.Vector3(0, 0, -1) // Fallback direction
    }
    return vector.divideScalar(length)
  }

  // CINEMATIC EASING: Smooth start and graceful stop
  const cinematicEase = (t: number): number => {
    // Ease-in-out cubic for smooth acceleration and deceleration
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }

  useFrame((_, delta) => {
    if (!isAnimating.current || !targetState.current) return

    const target = targetState.current
    const current = currentState.current

    // Update animation progress with time-based control
    animationProgress.current += delta * 0.3 // Cinematic speed
    
    // Trigger HUD during deceleration phase (at 75% progress)
    if (animationProgress.current >= 0.75 && !hudTriggered.current) {
      hudTriggered.current = true
      console.log('🎬 DECELERATION PHASE - Triggering laser beam HUD!')
      if (onComplete.current) {
        onComplete.current?.()
      }
    }

    if (animationProgress.current >= 1) {
      animationProgress.current = 1
      isAnimating.current = false
      
      // GRACEFUL STOP: Set exact target position
      current.position.copy(target.position)
      current.quaternion.copy(target.quaternion)
      camera.position.copy(current.position)
      camera.quaternion.copy(current.quaternion)
      
      // CRITICAL: Keep OrbitControls disabled at landing - no teleportation!
      if (controls) {
        (controls as any).enabled = false
        console.log('🔒 OrbitControls DISABLED at landing - no teleportation!')
      }
      
      console.log('🎬 CINEMATIC transition complete - GRACEFUL STOP!')
      console.log('🎯 Final position locked - awaiting HUD...')
      
      // Trigger HUD display callback
      if (onComplete.current) {
        setTimeout(() => {
          onComplete.current?.()
        }, 500) // Small delay for cinematic effect
      }
      return
    }

    // Apply cinematic easing
    const easedProgress = cinematicEase(animationProgress.current)

    // Smooth interpolation with easing
    current.position.lerpVectors(
      currentState.current.position, 
      target.position, 
      easedProgress
    )

    // SLERP for quaternion with easing
    current.quaternion.slerpQuaternions(
      currentState.current.quaternion,
      target.quaternion,
      easedProgress
    )

    // Apply to camera
    camera.position.copy(current.position)
    camera.quaternion.copy(current.quaternion)
  })

  const transitionToTarget = (planetPos: THREE.Vector3, planetRadius: number, onCompleteCallback?: () => void) => {
    console.log('🎯 Starting CINEMATIC camera transition...')
    
    // DISABLE OrbitControls during transition
    if (controls) {
      (controls as any).enabled = false
      console.log('🔒 OrbitControls DISABLED for cinematic transition')
    }
    
    // Store completion callback
    onComplete.current = onCompleteCallback || null
    
    // ROBUST direction calculation with epsilon checking
    const currentPos = camera.position.clone()
    const directionVector = planetPos.clone().sub(currentPos)
    const normalizedDirection = robustNormalize(directionVector)
    
    // Calculate optimal distance for 65% screen coverage (closer view)
    const fovRadians = (camera.fov * Math.PI) / 180
    const optimalDistance = planetRadius / (0.65 * Math.tan(fovRadians / 2))
    
    // Target position with robust calculation
    const targetPosition = planetPos.clone().sub(normalizedDirection.multiplyScalar(optimalDistance))
    
    // Target quaternion - look at planet
    const lookAtMatrix = new THREE.Matrix4().lookAt(targetPosition, planetPos, new THREE.Vector3(0, 1, 0))
    const targetQuaternion = new THREE.Quaternion().setFromRotationMatrix(lookAtMatrix)

    targetState.current = {
      position: targetPosition,
      quaternion: targetQuaternion,
      velocity: new THREE.Vector3(0, 0, 0),
      angularVelocity: new THREE.Quaternion(0, 0, 0, 1)
    }

    // Store initial state for interpolation
    currentState.current = {
      position: camera.position.clone(),
      quaternion: camera.quaternion.clone(),
      velocity: new THREE.Vector3(0, 0, 0),
      angularVelocity: new THREE.Quaternion(0, 0, 0, 1)
    }

    isAnimating.current = true
    animationProgress.current = 0
    hudTriggered.current = false
    
    console.log('Direction Vector:', normalizedDirection.toArray())
    console.log('Target Distance:', optimalDistance)
    console.log('🔬 CINEMATIC PRECISION ENGAGED!')
  }

  const enableFreeNavigation = () => {
    console.log('🚀 INITIATING TAKEOFF SEQUENCE - Launching from planet!')
    
    // Smooth return to overview position
    const overviewPosition = new THREE.Vector3(0, 15, 25)
    const overviewTarget = new THREE.Vector3(0, 0, 0)
    
    // Animate back to overview using the same cinematic system
    targetState.current = {
      position: overviewPosition,
      quaternion: new THREE.Quaternion().setFromRotationMatrix(
        new THREE.Matrix4().lookAt(overviewPosition, overviewTarget, new THREE.Vector3(0, 1, 0))
      ),
      velocity: new THREE.Vector3(0, 0, 0),
      angularVelocity: new THREE.Quaternion(0, 0, 0, 1)
    }
    
    currentState.current = {
      position: camera.position.clone(),
      quaternion: camera.quaternion.clone(),
      velocity: new THREE.Vector3(0, 0, 0),
      angularVelocity: new THREE.Quaternion(0, 0, 0, 1)
    }
    
    isAnimating.current = true
    animationProgress.current = 0
    hudTriggered.current = false
    
    onComplete.current = () => {
      // Re-enable controls AFTER smooth return
      if (controls) {
        (controls as any).enabled = true
        console.log('🔓 OrbitControls RE-ENABLED - Free navigation restored!')
      }
    }
    
    console.log('🚀 TAKEOFF SEQUENCE: Smooth pullback to overview position')
    console.log('Direction Vector (Takeoff):', overviewPosition.clone().sub(camera.position).normalize().toArray())
    console.log('Takeoff Distance:', camera.position.distanceTo(overviewPosition))
  }

  return { transitionToTarget, enableFreeNavigation }
}
