import { useState, useCallback, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'

interface CoordinateData {
  x: number
  y: number
  z: number
}

interface InspectionState {
  coordinates: CoordinateData | null
  mousePosition: { x: number; y: number }
  isVisible: boolean
}

export const useCoordinateInspection = () => {
  const { camera, gl, scene } = useThree()
  const [inspectionState, setInspectionState] = useState<InspectionState>({
    coordinates: null,
    mousePosition: { x: 0, y: 0 },
    isVisible: false
  })

  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const mouse = useMemo(() => new THREE.Vector2(), [])
  const lastCallTimeRef = useRef<number>(0)

  // Simple throttling function
  const throttle = useCallback((func: (event: MouseEvent) => void, limit: number) => {
    return (event: MouseEvent) => {
      const now = Date.now()
      if (now - lastCallTimeRef.current >= limit) {
        lastCallTimeRef.current = now
        func(event)
      }
    }
  }, [])

  // Mouse move handler for raycasting
  const handleRaycast = useCallback((event: MouseEvent) => {
    const canvas = gl.domElement
    const rect = canvas.getBoundingClientRect()

    // Convert mouse coordinates to normalized device coordinates (-1 to +1)
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    // Update raycaster
    raycaster.setFromCamera(mouse, camera)

    // Find all intersectable objects (meshes and lines)
    const intersectableObjects: THREE.Object3D[] = []
    scene.traverse((child) => {
      if (
        (child instanceof THREE.Mesh || 
         child instanceof THREE.Line || 
         child instanceof THREE.Points) &&
        child.visible &&
        child.geometry &&
        child.geometry.attributes.position
      ) {
        // Skip grid lines and axes by checking material properties or object names
        if (child.material instanceof THREE.LineBasicMaterial && 
            (child.material.opacity < 1 || child.material.color.getHex() === 0x999999)) {
          return // Skip grid lines
        }
        intersectableObjects.push(child)
      }
    })

    // Find intersections
    const intersects = raycaster.intersectObjects(intersectableObjects)

    if (intersects.length > 0) {
      const intersection = intersects[0]
      const point = intersection.point

      setInspectionState({
        coordinates: {
          x: point.x,
          y: point.y,
          z: point.z
        },
        mousePosition: {
          x: event.clientX,
          y: event.clientY
        },
        isVisible: true
      })
    } else {
      setInspectionState(prev => ({
        ...prev,
        isVisible: false
      }))
    }
  }, [camera, gl.domElement, mouse, raycaster, scene])

  // Throttled mouse move handler for performance
  const throttledMouseMove = useMemo(
    () => throttle(handleRaycast, 16), // ~60fps throttling
    [handleRaycast, throttle]
  )

  const handleMouseMove = useCallback((event: MouseEvent) => {
    throttledMouseMove(event)
  }, [throttledMouseMove])

  const handleMouseLeave = useCallback(() => {
    setInspectionState(prev => ({
      ...prev,
      isVisible: false
    }))
  }, [])

  const enableInspection = useCallback(() => {
    const canvas = gl.domElement
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [gl.domElement, handleMouseMove, handleMouseLeave])

  return {
    inspectionState,
    enableInspection
  }
}