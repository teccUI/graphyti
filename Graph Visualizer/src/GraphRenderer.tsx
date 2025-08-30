import { useMemo } from 'react'
import * as THREE from 'three'
import { evaluate } from 'mathjs'
import type { CustomGraph } from './utils/customEquationUtils'
import { validateDomain } from './utils/customEquationUtils'

interface Graph {
  id: string
  name: string
  category: string
  subject: string
  level: string
  type: string
  equation_latex: string
  description: string
}

interface GraphRendererProps {
  graph?: Graph
  customGraph?: CustomGraph
  controlValues: Record<string, number>
}

function GraphRenderer({ graph, customGraph, controlValues }: GraphRendererProps) {
  const geometry = useMemo(() => {
    const resolution = controlValues.resolution || 50
    
    try {
      // Handle custom graphs
      if (customGraph) {
        return createCustomGraphGeometry(customGraph, controlValues)
      }
      
      if (!graph) return new THREE.BufferGeometry()
      
      // Some shapes are better represented with built-in Three.js geometries
      if (graph.name === 'Cylinder' || graph.name === 'Sphere' || graph.name === 'Cone' || 
          graph.name === 'Torus (Doughnut)' || graph.name === 'Ellipsoid' || 
          graph.name === 'Paraboloid' || graph.name === 'Hyperbolic Paraboloid') {
        return createDefaultGeometry(graph, controlValues)
      }
      
      // Special handling for hyperboloid of two sheets which needs two separate surfaces
      if (graph.name === 'Hyperboloid of Two Sheets') {
        return createHyperboloidTwoSheetsGeometry(controlValues)
      }
      
      // Special handling for hyperboloid of one sheet which needs both +z and -z surfaces
      if (graph.name === 'Hyperboloid of One Sheet') {
        return createHyperboloidOneSheetGeometry(controlValues)
      }
      
      // Special handling for Enneper Surface which needs parametric rendering
      if (graph.name === 'Enneper Surface') {
        return createEnneperSurfaceGeometry(controlValues)
      }
      
      // Handle Wave Function specifically as 3D Surface
      if (graph.name === 'Wave Function (Quantum Mechanics)') {
        return createSurfaceGeometry(graph, resolution, controlValues)
      }
      
      switch (graph.type) {
        case '3D Surface':
          return createSurfaceGeometry(graph, resolution, controlValues)
        case '2D Function':
          return create2DFunctionGeometry(graph, resolution, controlValues)
        case '2D Parametric':
          return createParametricGeometry(graph, resolution, controlValues)
        case '3D Parametric Curve':
          return createParametricCurveGeometry(graph, resolution, controlValues)
        case '2D Polar':
          return createPolarGeometry(graph, resolution, controlValues)
        default:
          return createDefaultGeometry(graph, controlValues)
      }
    } catch (error) {
      console.warn(`Error rendering graph ${graph?.name}:`, error)
      return graph ? createDefaultGeometry(graph, controlValues) : new THREE.BufferGeometry()
    }
  }, [graph, customGraph, controlValues])

  const material = useMemo(() => {
    // Handle custom graph materials
    if (customGraph) {
      if (customGraph.type === '2D') {
        return new THREE.LineBasicMaterial({ color: '#ff6b35', linewidth: 2 })
      }
      return new THREE.MeshStandardMaterial({ 
        color: '#4a9eff', 
        wireframe: false,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
      })
    }
    
    if (!graph) return new THREE.MeshStandardMaterial({ color: '#4a9eff' })
    
    if (graph.type.includes('Curve') || graph.type === '2D Function') {
      return new THREE.LineBasicMaterial({ color: '#ff6b35', linewidth: 2 })
    }
    return new THREE.MeshStandardMaterial({ 
      color: '#4a9eff', 
      wireframe: false,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    })
  }, [graph, customGraph])

  // Handle custom graph rendering
  if (customGraph) {
    if (customGraph.type === '2D') {
      return <primitive object={new THREE.Line(geometry, material)} />
    }
    return <mesh geometry={geometry} material={material} />
  }

  if (!graph) {
    return <mesh geometry={geometry} material={material} />
  }

  // Determine if this should be rendered as a filled surface or line
  const shouldRenderAsFilled = graph.name === 'Circle' || graph.name === 'Ellipse' || 
    graph.name === 'Cardioid' || graph.name === 'Rose Curve' || 
    graph.name === 'Lemniscate of Bernoulli' || graph.name === 'Astroid' ||
    graph.name === 'Cycloid' || graph.name === 'Lissajous Curve'

  if ((graph.type.includes('Curve') || graph.type === '2D Function' || graph.type === '2D Parametric' || graph.type === '2D Polar') && !shouldRenderAsFilled) {
    return (
      <primitive object={new THREE.Line(geometry, material)} />
    )
  }

  return (
    <mesh geometry={geometry} material={material} />
  )
}

function createSurfaceGeometry(graph: Graph, resolution: number, controlValues: Record<string, number>): THREE.BufferGeometry {
  const geometry = new THREE.PlaneGeometry(10, 10, resolution, resolution)
  const positions = geometry.attributes.position.array as Float32Array
  
  // Don't recalculate x,y - use the correct coordinates from PlaneGeometry
  // Only modify the z values based on the existing x,y coordinates
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i]     // Use existing x coordinate from PlaneGeometry
    const y = positions[i + 1] // Use existing y coordinate from PlaneGeometry
    
    let z = 0
    try {
      z = calculateSurfaceZ(graph, x, y, controlValues)
    } catch {
      z = 0
    }
    
    // Only modify the z coordinate
    positions[i + 2] = z
  }
  
  geometry.attributes.position.needsUpdate = true
  geometry.computeVertexNormals()
  
  return geometry
}

function create2DFunctionGeometry(graph: Graph, resolution: number, controlValues: Record<string, number>): THREE.BufferGeometry {
  const range = 10
  const step = (2 * range) / resolution
  
  let currentSegment: THREE.Vector3[] = []
  const segments: THREE.Vector3[][] = []
  
  // Get scaling factors for coordinate transformation
  const xScale = controlValues.xScale || 1
  const yScale = controlValues.yScale || 1
  
  for (let i = 0; i <= resolution; i++) {
    const x = -range + i * step
    try {
      const y = calculate2DFunction(graph, x, controlValues)
      
      if (isNaN(y) || !isFinite(y)) {
        // Discontinuity found - end current segment and start new one
        if (currentSegment.length > 1) {
          segments.push([...currentSegment])
        }
        currentSegment = []
      } else {
        // Valid point - add to current segment with coordinate scaling
        // Apply coordinate scaling for visual stretching/compression
        const scaledX = x * xScale
        const scaledY = y * yScale
        
        // Apply Y-axis rotation if specified for Damped Oscillations
        if (graph.name.includes('Damped Oscillations') && controlValues.yRotation) {
          const yRotationDegrees = controlValues.yRotation || 0
          const yRotationRad = (yRotationDegrees * Math.PI) / 180
          const xRotated = scaledX * Math.cos(yRotationRad)
          const zRotated = -scaledX * Math.sin(yRotationRad)
          currentSegment.push(new THREE.Vector3(xRotated, scaledY, zRotated))
        } else {
          currentSegment.push(new THREE.Vector3(scaledX, scaledY, 0))
        }
      }
    } catch {
      // Error encountered - end current segment
      if (currentSegment.length > 1) {
        segments.push([...currentSegment])
      }
      currentSegment = []
    }
  }
  
  // Add final segment if it exists
  if (currentSegment.length > 1) {
    segments.push(currentSegment)
  }
  
  // Combine all segments into a single geometry
  // For discontinuous functions, we'll connect the longest segment
  // In the future, this could be enhanced to render multiple line segments
  if (segments.length === 0) {
    return new THREE.BufferGeometry().setFromPoints([])
  }
  
  // Find the longest continuous segment to display
  let longestSegment = segments[0]
  for (const segment of segments) {
    if (segment.length > longestSegment.length) {
      longestSegment = segment
    }
  }
  
  return new THREE.BufferGeometry().setFromPoints(longestSegment)
}

function createParametricGeometry(graph: Graph, resolution: number, controlValues: Record<string, number> = {}): THREE.BufferGeometry {
  const shouldRenderAsFilled = graph.name === 'Circle' || graph.name === 'Ellipse' || 
    graph.name === 'Astroid' || graph.name === 'Cycloid' || graph.name === 'Lissajous Curve'
    
  if (shouldRenderAsFilled) {
    // Create filled surface using THREE.ShapeGeometry
    const points: THREE.Vector2[] = []
    const tMin = controlValues.tMin || 0
    const tMax = controlValues.tMax || 2 * Math.PI
    const step = (tMax - tMin) / resolution
    
    // Generate outline points that define the shape boundary
    for (let i = 0; i <= resolution; i++) {
      const t = tMin + i * step
      try {
        const { x, y } = calculateParametric2D(graph, t, controlValues)
        points.push(new THREE.Vector2(x, y))
      } catch {
        // Skip invalid points
        continue
      }
    }
    
    if (points.length < 3) {
      // Fallback to line if we don't have enough points for a shape
      return new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(p.x, p.y, 0)))
    }
    
    // Create a Shape from the points and generate ShapeGeometry
    const shape = new THREE.Shape(points)
    return new THREE.ShapeGeometry(shape)
  } else {
    // Create line geometry for curves
    const points: THREE.Vector3[] = []
    const tMin = controlValues.tMin || 0
    const tMax = controlValues.tMax || 2 * Math.PI
    const step = (tMax - tMin) / resolution
    
    for (let i = 0; i <= resolution; i++) {
      const t = tMin + i * step
      try {
        const { x, y } = calculateParametric2D(graph, t, controlValues)
        points.push(new THREE.Vector3(x, y, 0))
      } catch {
        continue
      }
    }
    
    return new THREE.BufferGeometry().setFromPoints(points)
  }
}

function createParametricCurveGeometry(graph: Graph, resolution: number, controlValues: Record<string, number> = {}): THREE.BufferGeometry {
  const points: THREE.Vector3[] = []
  const tMin = controlValues.tMin || 0
  const tMax = controlValues.tMax || 2 * Math.PI
  const step = (tMax - tMin) / resolution
  
  for (let i = 0; i <= resolution; i++) {
    const t = tMin + i * step
    try {
      const { x, y, z } = calculateParametric3D(graph, t, controlValues)
      points.push(new THREE.Vector3(x, y, z))
    } catch {
      continue
    }
  }
  
  return new THREE.BufferGeometry().setFromPoints(points)
}

function createPolarGeometry(graph: Graph, resolution: number, controlValues: Record<string, number> = {}): THREE.BufferGeometry {
  const shouldRenderAsFilled = graph.name === 'Cardioid' || graph.name === 'Rose Curve' || 
    graph.name === 'Lemniscate of Bernoulli'
    
  if (shouldRenderAsFilled) {
    // Create filled surface using THREE.ShapeGeometry
    const points: THREE.Vector2[] = []
    // Use user-controlled theta range for Lemniscate, default for others
    const thetaMin = (graph.name === 'Lemniscate of Bernoulli') ? (controlValues.thetaMin || 0) : 0
    const thetaMax = (graph.name === 'Lemniscate of Bernoulli') ? (controlValues.thetaMax || 2 * Math.PI) : 2 * Math.PI
    const step = (thetaMax - thetaMin) / resolution
    
    // Generate outline points that define the polar shape boundary
    for (let i = 0; i <= resolution; i++) {
      const theta = thetaMin + i * step
      try {
        const r = calculatePolar(graph, theta, controlValues)
        if (r > 0) { // Only add points with positive radius
          const x = r * Math.cos(theta) + (controlValues.xOffset || 0)
          const y = r * Math.sin(theta) + (controlValues.yOffset || 0)
          points.push(new THREE.Vector2(x, y))
        }
      } catch {
        // Skip invalid points
        continue
      }
    }
    
    if (points.length < 3) {
      // Fallback to line if we don't have enough points for a shape
      return new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(p.x, p.y, 0)))
    }
    
    // Create a Shape from the points and generate ShapeGeometry
    const shape = new THREE.Shape(points)
    return new THREE.ShapeGeometry(shape)
  } else {
    // Create line geometry for curves
    const points: THREE.Vector3[] = []
    // Use user-controlled theta range for Lemniscate, default for others
    const thetaMin = (graph.name === 'Lemniscate of Bernoulli') ? (controlValues.thetaMin || 0) : 0
    const thetaMax = (graph.name === 'Lemniscate of Bernoulli') ? (controlValues.thetaMax || 2 * Math.PI) : 2 * Math.PI
    const step = (thetaMax - thetaMin) / resolution
    
    for (let i = 0; i <= resolution; i++) {
      const theta = thetaMin + i * step
      try {
        const r = calculatePolar(graph, theta, controlValues)
        if (r > 0) { // Only add points with positive radius
          const x = r * Math.cos(theta) + (controlValues.xOffset || 0)
          const y = r * Math.sin(theta) + (controlValues.yOffset || 0)
          points.push(new THREE.Vector3(x, y, 0))
        }
      } catch {
        continue
      }
    }
    
    return new THREE.BufferGeometry().setFromPoints(points)
  }
}

function createDefaultGeometry(graph: Graph, controlValues: Record<string, number> = {}): THREE.BufferGeometry {
  switch (graph.name) {
    case 'Sphere': {
      const radius = controlValues.radius || 3
      const resolution = controlValues.resolution || 32
      return new THREE.SphereGeometry(radius, resolution, resolution)
    }
    case 'Paraboloid':
      return createParaboloidGeometry(controlValues)
    case 'Hyperbolic Paraboloid':
      return createHyperbolicParaboloidGeometry(controlValues)
    case 'Ellipsoid':
      return createEllipsoidGeometry(controlValues)
    case 'Cone':
      return createConeGeometry(controlValues)
    case 'Cylinder':
      return createMathematicalCylinderGeometry(controlValues)
    case 'Torus (Doughnut)': {
      const R = controlValues.R || 3
      const r = controlValues.r || 1.5
      const resolutionTorus = controlValues.resolution || 100
      return new THREE.TorusGeometry(R, r, 16, resolutionTorus)
    }
    default:
      return new THREE.BoxGeometry(2, 2, 2)
  }
}

function createParaboloidGeometry(controlValues: Record<string, number> = {}): THREE.BufferGeometry {
  const resolution = controlValues.resolution || 50
  const scale = controlValues.scale || 8
  const a = controlValues.a || 2
  const b = controlValues.b || 2
  
  // Dynamic plane sizing based on mathematical parameters
  const baseSize = 4 // Reference size for consistent visualization
  const scaleFactor = scale / 8 // Normalize scale parameter
  
  // Plane dimensions are proportional to 'a' and 'b' parameters
  const xSize = baseSize * a * scaleFactor
  const ySize = baseSize * b * scaleFactor
  
  // Create plane with dynamic dimensions
  const geometry = new THREE.PlaneGeometry(xSize, ySize, resolution, resolution)
  const positions = geometry.attributes.position.array as Float32Array
  
  // Height scaling factor for Z dimension
  const heightScale = scaleFactor * 2
  
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i]
    const y = positions[i + 1]
    
    // Pure paraboloid equation: z = x²/a² + y²/b²
    // No coordinate tricks - use actual mathematical formula
    const z = ((x * x) / (a * a) + (y * y) / (b * b)) * heightScale
    
    positions[i + 2] = z
  }
  
  geometry.attributes.position.needsUpdate = true
  
  // Apply X-axis rotation if specified
  const xRotation = controlValues.xRotation || 0
  if (xRotation !== 0) {
    const rotationRad = (xRotation * Math.PI) / 180
    geometry.rotateX(rotationRad)
  }
  
  geometry.computeVertexNormals()
  return geometry
}

function createHyperbolicParaboloidGeometry(controlValues: Record<string, number> = {}): THREE.BufferGeometry {
  const resolution = controlValues.resolution || 50
  const scale = controlValues.scale || 8
  const a = controlValues.a || 2
  const b = controlValues.b || 2
  const geometry = new THREE.PlaneGeometry(scale, scale, resolution, resolution)
  const positions = geometry.attributes.position.array as Float32Array
  
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i]
    const y = positions[i + 1]
    // Hyperbolic Paraboloid: z = x²/a² - y²/b² with scale factor
    positions[i + 2] = ((x * x) / (a * a) - (y * y) / (b * b)) * scale / 8
  }
  
  geometry.attributes.position.needsUpdate = true
  geometry.computeVertexNormals()
  return geometry
}

function createEllipsoidGeometry(controlValues: Record<string, number> = {}): THREE.BufferGeometry {
  const resolution = controlValues.resolution || 32
  
  // Create a fresh geometry each time to avoid caching issues
  const geometry = new THREE.SphereGeometry(1, resolution, resolution)
  
  // Get scaling and translation parameters
  const a = controlValues.a || 3  // X semi-axis
  const b = controlValues.b || 2  // Y semi-axis  
  const c = controlValues.c || 1.5 // Z semi-axis
  const xOffset = controlValues.x || 0 // X translation
  const yOffset = controlValues.y || 0 // Y translation
  const zOffset = controlValues.z || 0 // Z translation
  
  // Apply scaling first
  geometry.scale(a, b, c)
  
  // Apply translation
  geometry.translate(xOffset, yOffset, zOffset)
  
  // Recompute normals after transformations
  geometry.computeVertexNormals()
  
  return geometry
}

function createMathematicalCylinderGeometry(controlValues: Record<string, number> = {}): THREE.BufferGeometry {
  // Create mathematical cylinder surface: x² + y² = r² (infinite cylinder without caps)
  const radius = controlValues.radius || 2
  const height = controlValues.height || 8 // Extended height for mathematical representation
  const resolution = controlValues.resolution || 32
  const radialSegments = Math.max(8, Math.min(64, resolution))
  const heightSegments = Math.max(4, Math.min(20, resolution / 4))
  
  // Create cylinder without caps using CylinderGeometry
  const geometry = new THREE.CylinderGeometry(radius, radius, height, radialSegments, heightSegments, true) // openEnded = true
  
  return geometry
}

function createHyperboloidOneSheetGeometry(controlValues: Record<string, number> = {}): THREE.BufferGeometry {
  // Create hyperboloid of one sheet: x²/a² + y²/b² - z²/c² = 1
  // This is a connected surface extending in both +z and -z directions
  const a = controlValues.a || 2
  const c = controlValues.c || 2
  const resolution = controlValues.resolution || 40
  const zRange = controlValues.zRange || 4 // Range of z values
  
  const vertices: number[] = []
  const indices: number[] = []
  
  let vertexIndex = 0
  
  // Create surface using parametric approach
  for (let i = 0; i <= resolution; i++) {
    for (let j = 0; j <= resolution; j++) {
      // Use z as parameter from -zRange to +zRange
      const z = -zRange + (2 * zRange * i) / resolution
      const theta = (2 * Math.PI * j) / resolution
      
      // From x²/a² + y²/b² - z²/c² = 1, solve for radius r
      // r²/a² - z²/c² = 1, so r² = a²(1 + z²/c²)
      const rSquared = a * a * (1 + (z * z) / (c * c))
      const r = Math.sqrt(rSquared)
      
      const x = r * Math.cos(theta)
      const y = r * Math.sin(theta)
      
      vertices.push(x, y, z)
      
      // Create indices for triangulation
      if (i < resolution && j < resolution) {
        const current = vertexIndex
        const next = vertexIndex + 1
        const nextRow = vertexIndex + (resolution + 1)
        const nextRowNext = nextRow + 1
        
        // Two triangles per quad
        indices.push(current, next, nextRow)
        indices.push(next, nextRowNext, nextRow)
      }
      
      vertexIndex++
    }
  }
  
  const geometry = new THREE.BufferGeometry()
  geometry.setFromPoints(vertices.map((_, i, arr) => {
    if (i % 3 === 0) {
      return new THREE.Vector3(arr[i], arr[i + 1], arr[i + 2])
    }
  }).filter(Boolean) as THREE.Vector3[])
  
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  
  return geometry
}

function createConeGeometry(controlValues: Record<string, number> = {}): THREE.BufferGeometry {
  // Create a simple cone geometry with user controls
  const radius = controlValues.a || 2 // Base radius
  const height = controlValues.zRange || 4 // Cone height
  const resolution = controlValues.resolution || 16
  const radialSegments = Math.max(8, Math.min(32, resolution))
  
  // Create a single upward-pointing cone
  const cone = new THREE.ConeGeometry(radius, height, radialSegments, 1, false)
  
  // Position cone so base is at y=0 and tip points upward
  cone.translate(0, height/2, 0)
  
  return cone
}

function createEnneperSurfaceGeometry(controlValues: Record<string, number> = {}): THREE.BufferGeometry {
  // Create Enneper Surface using proper parametric equations:
  // x = u - u³/3 + uv²
  // y = v - v³/3 + vu²  
  // z = u² - v²
  
  const resolution = controlValues.resolution || 40
  const scale = controlValues.scale || 0.5
  const uRange = controlValues.uRange || 2
  const vRange = controlValues.vRange || 2
  
  const vertices: number[] = []
  const indices: number[] = []
  
  let vertexIndex = 0
  
  // Create parametric surface mesh
  for (let i = 0; i <= resolution; i++) {
    for (let j = 0; j <= resolution; j++) {
      // Map to parameter space
      const u = -uRange + (2 * uRange * i) / resolution
      const v = -vRange + (2 * vRange * j) / resolution
      
      // Enneper Surface parametric equations
      const x = scale * (u - (u * u * u) / 3 + u * v * v)
      const y = scale * (v - (v * v * v) / 3 + v * u * u)
      const z = scale * (u * u - v * v)
      
      vertices.push(x, y, z)
      
      // Create indices for triangulation
      if (i < resolution && j < resolution) {
        const current = vertexIndex
        const next = vertexIndex + 1
        const nextRow = vertexIndex + (resolution + 1)
        const nextRowNext = nextRow + 1
        
        // Two triangles per quad
        indices.push(current, next, nextRow)
        indices.push(next, nextRowNext, nextRow)
      }
      
      vertexIndex++
    }
  }
  
  const geometry = new THREE.BufferGeometry()
  geometry.setFromPoints(vertices.map((_, i, arr) => {
    if (i % 3 === 0) {
      return new THREE.Vector3(arr[i], arr[i + 1], arr[i + 2])
    }
  }).filter(Boolean) as THREE.Vector3[])
  
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  
  return geometry
}

function createHyperboloidTwoSheetsGeometry(controlValues: Record<string, number> = {}): THREE.BufferGeometry {
  // Create hyperboloid of two sheets: -x²/a² - y²/b² + z²/c² = 1
  // This creates two separate bowl-shaped surfaces
  const a = controlValues.a || 2
  const c = controlValues.c || 2
  const resolution = controlValues.resolution || 30
  const zMin = controlValues.zMin || 1.2 // Start slightly above z = c to avoid singularity
  const zMax = controlValues.zMax || 4
  
  const vertices: number[] = []
  const indices: number[] = []
  
  let vertexIndex = 0
  
  // Create both sheets (positive and negative z)
  for (const sign of [1, -1]) {
    for (let i = 0; i <= resolution; i++) {
      for (let j = 0; j <= resolution; j++) {
        // Parametric approach: use z as parameter, solve for x,y
        const z = sign * (zMin + (zMax - zMin) * (i / resolution))
        const theta = (2 * Math.PI * j) / resolution
        
        // From -x²/a² - y²/b² + z²/c² = 1, solve for radius r where x = r*cos(θ), y = r*sin(θ)
        // -r²/a² + z²/c² = 1 (assuming a=b for simplicity)
        // r² = a²(z²/c² - 1)
        const rSquared = a * a * (z * z / (c * c) - 1)
        
        if (rSquared >= 0) {
          const r = Math.sqrt(rSquared)
          const x = r * Math.cos(theta)
          const y = r * Math.sin(theta)
          
          vertices.push(x, y, z)
          
          // Create indices for triangulation (except for the last row/column)
          if (i < resolution && j < resolution) {
            const current = vertexIndex
            const next = vertexIndex + 1
            const nextRow = vertexIndex + (resolution + 1)
            const nextRowNext = nextRow + 1
            
            // Two triangles per quad
            indices.push(current, next, nextRow)
            indices.push(next, nextRowNext, nextRow)
          }
          
          vertexIndex++
        }
      }
    }
  }
  
  const geometry = new THREE.BufferGeometry()
  geometry.setFromPoints(vertices.map((_, i, arr) => {
    if (i % 3 === 0) {
      return new THREE.Vector3(arr[i], arr[i + 1], arr[i + 2])
    }
  }).filter(Boolean) as THREE.Vector3[])
  
  // Set indices for proper triangulation
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  
  return geometry
}

function calculateSurfaceZ(graph: Graph, x: number, y: number, controlValues: Record<string, number>): number {
  const originalEquation = graph.equation_latex
  
  // Handle parametric surfaces (u,v parameterization)
  if (graph.name === 'Helicoid') {
    // Right-handed helicoid: x = u*cos(v), y = u*sin(v), z = c*v
    // Given (x,y), find (u,v) and return z with range controls
    const c = controlValues.c || 1.0  // Use pitch from controls
    const uRange = controlValues.uRange || 3 // Radius range
    const vRange = controlValues.vRange || 2 * Math.PI // Angle range
    
    // Map x,y plane to u,v parameters
    const r = Math.sqrt(x*x + y*y)
    const v = Math.atan2(y, x) * (vRange / (2 * Math.PI))
    
    // Only show surface within u range
    if (r <= uRange) {
      return c * v
    } else {
      return NaN // Outside surface
    }
  }
  
  // Note: Enneper Surface now uses dedicated parametric geometry function
  // No surface calculation needed here
  
  // Handle specific implicit equations by solving for z
  if (graph.name === 'Ellipsoid') {
    // x^2/a^2 + y^2/b^2 + z^2/c^2 = 1 -> z = ±c*sqrt(1 - x^2/a^2 - y^2/b^2)
    const a = controlValues.a || 3
    const b = controlValues.b || 2
    const c = controlValues.c || 1.5
    const term = 1 - (x*x)/(a*a) - (y*y)/(b*b)
    return term >= 0 ? c * Math.sqrt(term) : 0
  }
  
  if (graph.name === 'Cone') {
    // x^2/a^2 + y^2/b^2 - z^2/c^2 = 0 -> z = ±c*sqrt(x^2/a^2 + y^2/b^2)
    const a = controlValues.a || 2  // X-axis scale
    const b = controlValues.a || 2  // Y-axis scale (same as a for circular cone)
    const c = controlValues.c || 2  // Z-axis scale
    return c * Math.sqrt((x*x)/(a*a) + (y*y)/(b*b))
  }
  
  if (graph.name === 'Hyperboloid of One Sheet') {
    // x^2/a^2 + y^2/b^2 - z^2/c^2 = 1 -> z = ±c*sqrt(x^2/a^2 + y^2/b^2 - 1)
    const a = controlValues.a || 2
    const b = controlValues.a || 2  // Use same value for b as a for symmetrical hyperboloid
    const c = controlValues.c || 2
    const term = (x*x)/(a*a) + (y*y)/(b*b) - 1
    return term >= 0 ? c * Math.sqrt(term) : 0
  }
  
  if (graph.name === 'Hyperboloid of Two Sheets') {
    // -x^2/a^2 - y^2/b^2 + z^2/c^2 = 1 -> z = ±c*sqrt(1 + x^2/a^2 + y^2/b^2)
    const a = controlValues.a || 2
    const b = controlValues.a || 2  // Use same value for b as a for symmetrical hyperboloid
    const c = controlValues.c || 2
    return c * Math.sqrt(1 + (x*x)/(a*a) + (y*y)/(b*b))
  }
  
  if (graph.name === 'Cylinder') {
    // For a cylinder x^2 + y^2 = r^2, z can be any value
    // Create a proper cylindrical surface by using the radius constraint
    const r = controlValues.radius || 2
    const dist = Math.sqrt(x*x + y*y)
    if (dist <= r) {
      return 0 // Flat cylinder surface at z=0 within radius
    } else {
      return NaN // Outside cylinder radius - will be handled by error handling
    }
  }
  
  if (graph.name === 'Torus (Doughnut)') {
    // (sqrt(x^2+y^2)-R)^2 + z^2 = r^2 -> z = ±r*sqrt(1 - ((sqrt(x^2+y^2)-R)/r)^2)
    const R = controlValues.R || 3
    const r = controlValues.r || 1.5
    const rho = Math.sqrt(x*x + y*y)
    const term = 1 - Math.pow((rho - R)/r, 2)
    return term >= 0 ? r * Math.sqrt(term) : 0
  }
  
  if (graph.name === 'Sphere') {
    // x^2 + y^2 + z^2 = r^2 -> z = ±sqrt(r^2 - x^2 - y^2)
    const r = controlValues.radius || 3
    const term = r*r - x*x - y*y
    return term >= 0 ? Math.sqrt(term) : 0
  }
  
  if (graph.name === 'Sine Wave Surface') {
    // z = A1*sin(f1*x) + A2*cos(f2*y)
    const xAmplitude = controlValues.xAmplitude || 1
    const xFrequency = controlValues.xFrequency || 1
    const yAmplitude = controlValues.yAmplitude || 1
    const yFrequency = controlValues.yFrequency || 1
    return xAmplitude * Math.sin(xFrequency * x) + yAmplitude * Math.cos(yFrequency * y)
  }
  
  if (graph.name === 'Gaussian (Bell Curve) Surface') {
    // z = A * e^(-(x^2+y^2)/σ^2) - standard 2D Gaussian centered at origin
    const sigma = controlValues.sigma || 2.5 // Standard deviation from controls
    const amplitude = controlValues.amplitude || 4 // Height scaling from controls
    // Create proper bell curve that peaks upward at center (0,0)
    return amplitude * Math.exp(-(x*x + y*y) / (2 * sigma * sigma))
  }
  
  if (graph.name === 'Monkey Saddle') {
    // z = x^3 - 3*x*y^2, but limit the growth
    const z = x*x*x - 3*x*y*y
    const scale = controlValues.scale || 0.2
    // Clamp the values to prevent extreme scaling
    return Math.max(-5, Math.min(5, z * scale))
  }
  
  if (graph.name === 'Wave Function (Quantum Mechanics)') {
    // Show actual wave oscillations rather than just |Ψ|²
    // This shows the real part of a quantum wave function with spatial oscillations
    const waveLength = controlValues.waveLength || 2 // Spatial wavelength from controls
    const amplitude = controlValues.amplitude || 1.5 // Wave amplitude from controls
    const envelope = controlValues.envelope || 3 // Gaussian envelope width from controls
    
    // Wave function: Ψ(x,y) = A * exp(-(x²+y²)/σ²) * cos(2π*√(x²+y²)/λ)
    const r = Math.sqrt(x*x + y*y) // Radial distance
    const gaussianEnvelope = Math.exp(-(x*x + y*y) / (envelope * envelope))
    const oscillation = Math.cos(2 * Math.PI * r / waveLength)
    
    return amplitude * gaussianEnvelope * oscillation
  }
  
  if (graph.name === 'Linear Function (Plane)') {
    // ax + by + cz = d -> z = (d - ax - by)/c
    const a = controlValues.a || 1
    const b = controlValues.b || 1
    const c = controlValues.c || 1
    const d = controlValues.d || 0
    return (d - a*x - b*y) / c
  }
  
  // For explicit equations (z = ...), use the conversion
  try {
    const expr = convertLatexToMathjs(originalEquation)
    const scope = { x, y, a: 2, b: 2, c: 2, r: 2, R: 3 }
    // Add controlValues to scope for dynamic parameters
    const extendedScope = { ...scope, ...controlValues }
    const result = evaluate(expr, extendedScope)
    
    // Handle invalid results
    if (isNaN(result) || !isFinite(result)) {
      console.warn(`Invalid result for surface ${graph.name} at (${x.toFixed(2)}, ${y.toFixed(2)}): ${result}`)
      return 0
    }
    
    // Clamp extreme values to keep surfaces visible
    const clampedResult = Math.max(-10, Math.min(10, result))
    if (clampedResult !== result) {
      console.info(`Clamped extreme value for ${graph.name}: ${result} -> ${clampedResult}`)
    }
    
    return clampedResult
  } catch (error) {
    console.error(`Error calculating surface for ${graph.name} at (${x.toFixed(2)}, ${y.toFixed(2)}):`, error)
    console.info(`Original equation: ${originalEquation}`)
    console.info(`Converted expression: ${convertLatexToMathjs(originalEquation)}`)
    return 0
  }
}


// Coordinate mapping helper function to map visual coordinates to graph-specific domains
function mapCoordinateToGraphDomain(x: number, graphName: string, controlValues: Record<string, number> = {}): number {
  switch (graphName) {
    case 'Binding Energy per Nucleon':
      // Map x(-10 to +10) to mass numbers (0 to 240 for comprehensive nuclear range)
      return ((x + 10) / 20) * 240
    
    case 'Blackbody Radiation Spectrum': {
      // Map x(-10 to +10) to wavelength using user-controlled range
      const lambdaMin = controlValues.lambdaMin || 0.5
      const lambdaMax = controlValues.lambdaMax || 10.0
      return lambdaMin + ((x + 10) / 20) * (lambdaMax - lambdaMin)
    }
    
    case 'Photoelectric Effect': {
      // Map x(-10 to +10) to frequency range (0 to user-defined max * 10^14 Hz)
      // This controls ONLY the display range - work function should NOT affect frequency scale
      const frequencyMax = controlValues.frequencyMax || 15
      // Pure frequency range control - no dependency on work function
      return ((x + 10) / 20) * frequencyMax
    }
    
    case 'Volume vs. Temperature (Charles\'s Law)':
    case 'Pressure vs. Temperature (Gay-Lussac\'s Law)':
      // Map x(-10 to +10) to temperature (-300°C to +500°C, practical range)
      return -300 + ((x + 10) / 20) * 800
    
    case 'I-V Characteristic of a Diode':
      // Map x(-10 to +10) to voltage (-3V to +1V, includes breakdown region)
      return -3 + ((x + 10) / 20) * 4
    
    default:
      // For most mathematical functions, keep the standard -10 to +10 range
      return x
  }
}

function calculate2DFunction(graph: Graph, x: number, controlValues: Record<string, number>): number {
  // Handle specific problematic functions
  if (graph.name === 'Square Root Function') {
    const xScale = controlValues.xScale || 1
    const yScale = controlValues.yScale || 1
    const xTranslation = controlValues.xTranslation || 0
    const yTranslation = controlValues.yTranslation || 0
    const scaledX = (x - xTranslation) / xScale
    return scaledX >= 0 ? yScale * Math.sqrt(scaledX) + yTranslation : 0
  }
  
  if (graph.name === 'Absolute Value Function') {
    const xScale = controlValues.xScale || 1
    const yScale = controlValues.yScale || 1
    const xTranslation = controlValues.xTranslation || 0
    const yTranslation = controlValues.yTranslation || 0
    const scaledX = (x - xTranslation) / xScale
    return yScale * Math.abs(scaledX) + yTranslation
  }
  
  if (graph.name === 'Reciprocal Function (Hyperbola)') {
    // Pure mathematical function - scaling is handled in coordinate system
    return x !== 0 ? 1 / x : 0
  }
  
  if (graph.name === 'Tangent Function') {
    // Handle tangent function with proper asymptotes at π/2, 3π/2, etc.
    const amplitude = controlValues.amplitude || 1
    const frequency = controlValues.frequency || 1
    const phase = controlValues.phase || 0
    const scaledX = frequency * x + phase
    
    // Check if we're near an asymptote (where cos(x) ≈ 0)
    const tolerance = 0.01
    const cosValue = Math.cos(scaledX)
    
    if (Math.abs(cosValue) < tolerance) {
      // Near asymptote - return NaN to create discontinuity
      return NaN
    }
    
    const tanValue = amplitude * Math.tan(scaledX)
    
    // Clamp extreme values near asymptotes for better visualization
    if (!isFinite(tanValue) || Math.abs(tanValue) > 100) {
      return NaN
    }
    
    return tanValue
  }
  
  if (graph.name === 'Logarithmic Function') {
    const base = controlValues.base || Math.E
    // Pure mathematical function - scaling is handled in coordinate system
    return x > 0 ? Math.log(x) / Math.log(base) : 0
  }
  
  if (graph.name === 'Sine and Cosine Waves') {
    const amplitude = controlValues.amplitude || controlValues.A || 1
    const frequency = controlValues.frequency || controlValues.B || 1
    const phaseShift = controlValues.phaseShift || controlValues.C || 0
    const verticalShift = controlValues.verticalShift || controlValues.D || 0
    return amplitude * Math.sin(frequency * x + phaseShift) + verticalShift
  }
  
  // Handle physics equations with correct mathematical relationships
  if (graph.name === 'Position vs. Time (Kinematics)') {
    // Show motion with initial velocity and acceleration: x = x₀ + v₀t + ½at²
    // Let x represent time t, return position x(t)
    const x0 = controlValues.x0 || controlValues.initialPosition || 1 // Initial position from controls
    const v0 = controlValues.v0 || controlValues.initialVelocity || 2 // Initial velocity from controls
    const a = controlValues.a || controlValues.acceleration || 0.3 // Acceleration from controls
    return x0 + v0 * x + 0.5 * a * x * x // Classic kinematic equation
  }
  
  if (graph.name === 'Velocity vs. Time (Kinematics)') {
    // Velocity as function of time: v = v₀ + at
    const v0 = controlValues.v0 || controlValues.initialVelocity || 2 // Initial velocity from controls
    const a = controlValues.a || controlValues.acceleration || 0.3 // Acceleration from controls
    return v0 + a * x // Derivative of position function
  }
  
  if (graph.name === 'Acceleration vs. Time (Kinematics)') {
    // Acceleration as function of time - derivative of velocity
    // For constant acceleration, this should be horizontal line
    const a = controlValues.a || controlValues.acceleration || 0.3 // Constant acceleration from controls
    return a // Constant acceleration
  }
  
  if (graph.name === "Force vs. Extension (Hooke's Law)") {
    // Hooke's Law: F = kx (showing applied force vs extension)
    // The restoring force is F_restoring = -kx, but for extension graphs we typically show F_applied = kx
    // This represents the external force needed to create extension x
    const k = controlValues.k || controlValues.springConstant || 2 // Spring constant
    return k * x // Linear relationship: force proportional to extension
  }
  
  if (graph.name === 'Pressure vs. Volume (Boyle\'s Law)') {
    // P ∝ 1/V (hyperbolic)
    const constant = controlValues.k || controlValues.constant || 5
    return x !== 0 ? constant/x : 0
  }
  
  if (graph.name === "Volume vs. Temperature (Charles's Law)") {
    // Charles's Law: V ∝ T (absolute temperature in Kelvin)
    const temperatureCelsius = mapCoordinateToGraphDomain(x, graph.name, controlValues) // Map to temperature domain
    const temperatureKelvin = temperatureCelsius + 273.15 // Convert °C to K
    const k = controlValues.k || controlValues.proportionalityConstant || 0.01 // Proportionality constant (small for reasonable scale)
    
    // Volume should be zero at absolute zero, proportional to T in Kelvin
    return temperatureKelvin > 0 ? k * temperatureKelvin : 0
  }
  
  if (graph.name === "Pressure vs. Temperature (Gay-Lussac's Law)") {
    // Gay-Lussac's Law: P ∝ T (absolute temperature in Kelvin)
    const temperatureCelsius = mapCoordinateToGraphDomain(x, graph.name, controlValues) // Map to temperature domain
    const temperatureKelvin = temperatureCelsius + 273.15 // Convert °C to K
    const k = controlValues.k || controlValues.proportionalityConstant || 0.02 // Proportionality constant (for reasonable pressure scale)
    
    // Pressure should be zero at absolute zero (-273.15°C), linear with T in Kelvin
    // This creates a straight line that intercepts y-axis at pressure corresponding to 0°C
    return temperatureKelvin > 0 ? k * temperatureKelvin : 0
  }
  
  if (graph.name === 'I-V Characteristic of a Resistor') {
    // V = IR (linear through origin)
    const resistance = controlValues.R || controlValues.resistance || 2
    const currentScale = controlValues.I || 1
    // Scale the input current (x) by the current control, then apply Ohm's law
    return resistance * (x * currentScale)
  }
  
  if (graph.name === 'I-V Characteristic of a Diode') {
    // Shockley diode equation: I = I₀(e^(V/nVₜ) - 1)
    // Map visual coordinate to voltage domain
    const V = mapCoordinateToGraphDomain(x, graph.name, controlValues) // Voltage in volts
    
    // Physical parameters from controls
    const I_0_nA = controlValues.I_0 || 100 // Saturation current in nanoamps
    const n = controlValues.n || 1.2 // Ideality factor
    const T = controlValues.T || 300 // Temperature in Kelvin
    const V_breakdown = controlValues.V_breakdown || -10 // Breakdown voltage
    
    // Calculate thermal voltage: V_T = kT/q
    const k = 1.381e-23 // Boltzmann constant (J/K)
    const q = 1.602e-19 // Elementary charge (C)
    const V_T = (k * T) / q // Thermal voltage in volts (≈26mV at 300K)
    
    // Convert I_0 from nanoamps to amps for calculation
    const I_0 = I_0_nA * 1e-9
    
    let current = 0
    
    if (V < V_breakdown) {
      // Reverse breakdown region - exponential current increase
      const breakdownDepth = Math.abs(V - V_breakdown)
      current = -I_0 * Math.exp(breakdownDepth * 15) // Steep breakdown characteristic
    } else if (V < 0) {
      // Normal reverse bias - small reverse current
      current = -I_0
    } else {
      // Forward bias operation: I = I₀(e^(V/nVₜ) - 1)
      // Use more conservative exponential limiting for better parameter sensitivity
      const exponentialArg = V / (n * V_T)
      if (exponentialArg > 25) {
        // For very large arguments, use linear approximation to preserve scaling
        current = I_0 * Math.exp(25) * exponentialArg / 25
      } else {
        current = I_0 * (Math.exp(exponentialArg) - 1)
      }
    }
    
    // Logarithmic scaling for better parameter visibility
    // Convert current to a logarithmic scale for visualization
    if (current > 0) {
      // Forward current: use log scaling to show exponential behavior
      const logCurrent = Math.log10(current * 1e9 + 1) // Convert to nA and add 1 to avoid log(0)
      return Math.min(10, logCurrent) // Scale to 0-10 range
    } else if (current < 0) {
      // Reverse current: logarithmic scaling to show breakdown effects
      const reverseCurrent_nA = Math.abs(current * 1e9) // Convert to positive nA
      if (reverseCurrent_nA > I_0_nA * 2) {
        // In breakdown region - use logarithmic scaling
        const logReverseCurrent = Math.log10(reverseCurrent_nA + 1)
        return -Math.min(10, logReverseCurrent) // Negative values for reverse current
      } else {
        // Normal reverse bias - linear scaling
        return Math.max(-10, -(reverseCurrent_nA / (I_0_nA / 2)))
      }
    } else {
      return 0
    }
  }
  
  if (graph.name === 'Blackbody Radiation Spectrum') {
    // Planck's law: B(λ,T) = 2hc²/λ⁵ * 1/(e^(hc/λkT) - 1)
    const T = controlValues.T || 300 // Temperature in Kelvin
    const lambda = mapCoordinateToGraphDomain(x, graph.name, controlValues) // Wavelength in micrometers
    const scalingFactor = controlValues.scalingFactor || 1000 // User-controlled scaling
    const hc_kT = 14387.7 / T // Wien's displacement constant approximation
    const intensity = 1 / (Math.pow(lambda, 5) * (Math.exp(hc_kT/lambda) - 1))
    // Scale the result to be visible (normalize by typical peak value)
    return intensity * Math.pow(lambda, 4) * scalingFactor // Use user-controlled scaling factor
  }
  
  if (graph.name === 'Photoelectric Effect') {
    // K_max = hf - φ (pure photoelectric equation)
    const workFunction = controlValues.workFunction || 2
    const frequency = mapCoordinateToGraphDomain(x, graph.name, controlValues) // Map to frequency domain
    
    // Pure photoelectric equation: K_max = hf - φ 
    // (h is implicitly 1 in our units for simplicity)
    const kineticEnergy = frequency > workFunction ? frequency - workFunction : 0
    
    return kineticEnergy
  }
  
  if (graph.name === 'Binding Energy per Nucleon') {
    // Bell curve peaking at Iron-56 (configurable)
    // Map visual x-coordinate to mass number domain
    const A = mapCoordinateToGraphDomain(x, graph.name, controlValues)
    const peakMass = controlValues.peakMass || 56
    const peakEnergy = controlValues.peakEnergy || 8.5
    const width = controlValues.width || 25
    return peakEnergy - Math.pow((A - peakMass)/width, 2)
  }
  
  if (graph.name.includes('Simple Harmonic Motion')) {
    const A = controlValues.A || controlValues.amplitude || 2
    const omega = controlValues.omega || controlValues.angularFrequency || 1
    const phi = controlValues.phi || controlValues.phaseAngle || 0
    return A * Math.cos(omega * x + phi)
  }
  
  if (graph.name.includes('Damped Oscillations')) {
    const A = controlValues.A || controlValues.amplitude || 2
    const gamma = controlValues.gamma || controlValues.dampingCoefficient || 0.1
    const omega = controlValues.omega || controlValues.angularFrequency || 1
    const phi = controlValues.phi || controlValues.phaseAngle || 0
    return A * Math.exp(-gamma * x) * Math.cos(omega * x + phi)
  }
  
  if (graph.name === 'Exponential Growth/Decay') {
    // y = a * e^(k(x - h)) + v
    const a = controlValues.a || 1 // Amplitude
    const k = controlValues.k || 1 // Growth/decay rate
    const h = controlValues.h || 0 // Horizontal shift
    const v = controlValues.v || 0 // Vertical shift
    return a * Math.exp(k * (x - h)) + v
  }

  if (graph.name === 'Witch of Agnesi') {
    // y = 8a³/(x² + 4a²) with scaling and translation
    const a = controlValues.a || 1
    const xScale = controlValues.xScale || 1
    const yScale = controlValues.yScale || 1
    const xTranslation = controlValues.xTranslation || 0
    const yTranslation = controlValues.yTranslation || 0
    const scaledX = (x - xTranslation) / xScale
    const result = (8 * a * a * a) / (scaledX * scaledX + 4 * a * a)
    return yScale * result + yTranslation
  }
  
  // Try to evaluate the LaTeX equation
  try {
    const expr = convertLatexToMathjs(graph.equation_latex)
    const scope = { 
      x, 
      a: 1, b: 1, c: 0, d: 0, k: 1, 
      A: 1, B: 1, C: 0, D: 0,
      r: 2,
      t: x, // For some functions that use t instead of x
      I: 1, I_0: 1, V: x, V_T: 0.026, n: 1, // For physics equations
      f: Math.abs(x), phi: 0, omega: 1, gamma: 0.1, // For physics equations
      h: 6.626e-34, hbar: 1.055e-34, kB: 1.381e-23, // Physical constants
      lambda: Math.abs(x) + 1, T: 300, // For blackbody radiation
      pi: Math.PI, e: Math.E, E: x
    }
    
    // Add controlValues to scope for dynamic parameters
    const extendedScope = { ...scope, ...controlValues }
    const result = evaluate(expr, extendedScope)
    
    // Handle invalid results
    if (isNaN(result) || !isFinite(result)) {
      console.warn(`Invalid result for 2D function ${graph.name} at x=${x.toFixed(2)}: ${result}`)
      return NaN // Return NaN to break line segments at discontinuities
    }
    
    // Clamp extreme values to keep things visible
    const clampedResult = Math.max(-100, Math.min(100, result))
    if (clampedResult !== result) {
      console.info(`Clamped extreme value for ${graph.name}: ${result} -> ${clampedResult}`)
    }
    
    return clampedResult
  } catch (error) {
    console.error(`Error calculating 2D function for ${graph.name} at x=${x.toFixed(2)}:`, error)
    console.info(`Original equation: ${graph.equation_latex}`)
    console.info(`Converted expression: ${convertLatexToMathjs(graph.equation_latex)}`)
    return NaN // Return NaN to break line segments at discontinuities
  }
}

function calculateParametric2D(graph: Graph, t: number, controlValues: Record<string, number> = {}): { x: number, y: number } {
  // Handle specific problematic parametric equations
  if (graph.name === 'Astroid') {
    // x = a*cos^3(t), y = a*sin^3(t)
    const a = controlValues.a || 3
    const cosT = Math.cos(t)
    const sinT = Math.sin(t)
    return { x: a * cosT * cosT * cosT, y: a * sinT * sinT * sinT }
  }
  
  if (graph.name === 'Lissajous Curve') {
    // x = A*sin(at + δ), y = B*sin(bt)
    const A = controlValues.A || controlValues.xAmplitude || 3
    const B = controlValues.B || controlValues.yAmplitude || 2
    const a = controlValues.a || controlValues.xFrequency || 3
    const b = controlValues.b || controlValues.yFrequency || 2
    const delta = controlValues.delta || controlValues.phaseShift || Math.PI/4
    
    // Calculate base coordinates
    let x = A * Math.sin(a * t + delta)
    let y = B * Math.sin(b * t)
    
    // Apply rotation if specified
    const rotation = controlValues.rotation || 0
    if (rotation !== 0) {
      const rotationRad = (rotation * Math.PI) / 180
      const cosRot = Math.cos(rotationRad)
      const sinRot = Math.sin(rotationRad)
      const xRotated = x * cosRot - y * sinRot
      const yRotated = x * sinRot + y * cosRot
      x = xRotated
      y = yRotated
    }
    
    // Apply translation offsets
    const xOffset = controlValues.xOffset || 0
    const yOffset = controlValues.yOffset || 0
    x += xOffset
    y += yOffset
    
    return { x, y }
  }
  
  if (graph.name === 'Cycloid') {
    // Cycloid: x = r(t - sin(t)), y = r(1 - cos(t))
    const r = controlValues.r || controlValues.radius || 1.5 // Wheel radius
    const rotationDegrees = controlValues.rotation || 0
    const alpha = (rotationDegrees * Math.PI) / 180 // Convert degrees to radians
    const xOffset = controlValues.xOffset || 0
    const yOffset = controlValues.yOffset || 0
    
    // Basic cycloid equations
    const x = r * (t - Math.sin(t))
    const y = r * (1 - Math.cos(t))
    
    // Apply rotation transformation
    const xRotated = x * Math.cos(alpha) - y * Math.sin(alpha)
    const yRotated = x * Math.sin(alpha) + y * Math.cos(alpha)
    
    return { 
      x: xRotated + xOffset,
      y: yRotated + yOffset
    }
  }
  
  if (graph.name === 'Circle') {
    const r = controlValues.r || controlValues.radius || 3
    const xOffset = controlValues.xOffset || 0
    const yOffset = controlValues.yOffset || 0
    return { 
      x: r * Math.cos(t) + xOffset, 
      y: r * Math.sin(t) + yOffset 
    }
  }
  
  if (graph.name === 'Ellipse') {
    const a = controlValues.a || controlValues.xRadius || 4
    const b = controlValues.b || controlValues.yRadius || 2
    const rotationDegrees = controlValues.rotation || 0
    const alpha = (rotationDegrees * Math.PI) / 180 // Convert degrees to radians
    const xOffset = controlValues.xOffset || 0
    const yOffset = controlValues.yOffset || 0
    
    // Basic ellipse equations
    const x = a * Math.cos(t)
    const y = b * Math.sin(t)
    
    // Apply rotation transformation
    const xRotated = x * Math.cos(alpha) - y * Math.sin(alpha)
    const yRotated = x * Math.sin(alpha) + y * Math.cos(alpha)
    
    return { 
      x: xRotated + xOffset, 
      y: yRotated + yOffset 
    }
  }
  
  // Try to parse parametric equations from LaTeX
  try {
    const equations = graph.equation_latex.split(',').map(eq => eq.trim())
    const scope = { 
      t, 
      a: 3, b: 2, c: 1, r: 3,
      A: 3, B: 2, 
      delta: Math.PI/4, phi: 0
    }
    
    if (equations.length >= 2) {
      // Extract x and y equations
      let xExpr = equations[0].includes('=') ? equations[0].split('=')[1].trim() : equations[0]
      let yExpr = equations[1].includes('=') ? equations[1].split('=')[1].trim() : equations[1]
      
      xExpr = convertLatexToMathjs(xExpr)
      yExpr = convertLatexToMathjs(yExpr)
      
      const x = evaluate(xExpr, scope)
      const y = evaluate(yExpr, scope)
      
      // Validate results
      if (isNaN(x) || isNaN(y) || !isFinite(x) || !isFinite(y)) {
        console.warn(`Invalid parametric result for ${graph.name} at t=${t.toFixed(2)}: (${x}, ${y})`)
        return { x: NaN, y: NaN }
      }
      
      return { x, y }
    }
  } catch (error) {
    console.error(`Error parsing parametric equation for ${graph.name} at t=${t.toFixed(2)}:`, error)
    console.info(`Original equation: ${graph.equation_latex}`)
    return { x: NaN, y: NaN }
  }
  
  return { x: t, y: Math.sin(t) }
}

function calculateParametric3D(graph: Graph, t: number, controlValues: Record<string, number> = {}): { x: number, y: number, z: number } {
  // Parse 3D parametric equations from LaTeX
  const equations = graph.equation_latex.split(',').map(eq => eq.trim())
  const scope = { 
    t, 
    a: 2, b: 1, c: 1, r: 2, R: 2,
    A: 1, B: 1
  }
  
  try {
    if (equations.length >= 3) {
      // Extract x, y, z equations
      let xExpr = equations[0].includes('=') ? equations[0].split('=')[1].trim() : equations[0]
      let yExpr = equations[1].includes('=') ? equations[1].split('=')[1].trim() : equations[1]
      let zExpr = equations[2].includes('=') ? equations[2].split('=')[1].trim() : equations[2]
      
      xExpr = convertLatexToMathjs(xExpr)
      yExpr = convertLatexToMathjs(yExpr)
      zExpr = convertLatexToMathjs(zExpr)
      
      const x = evaluate(xExpr, scope)
      const y = evaluate(yExpr, scope)
      const z = evaluate(zExpr, scope)
      
      return { x, y, z }
    }
  } catch (error) {
    console.warn(`Error parsing 3D parametric equation for ${graph.name}:`, error)
  }
  
  // Fallback for specific known shapes with controls
  if (graph.name === 'Trefoil Knot') {
    // Use controls from the graph controls
    const scope = { 
      t, 
      a: 2, b: 1, c: 1, r: 2, R: controlValues.R || 2,
      A: 1, B: 1, n: controlValues.n || 3
    }
    return {
      x: (scope.R + Math.cos(scope.n * t)) * Math.cos(2 * t),
      y: (scope.R + Math.cos(scope.n * t)) * Math.sin(2 * t),
      z: Math.sin(scope.n * t)
    }
  }
  
  if (graph.name === 'Viviani\'s Curve') {
    // x = a(1+cos(t)), y = a*sin(t), z = 2a*sin(t/2)
    const a = controlValues.a || 2
    return {
      x: a * (1 + Math.cos(t)),
      y: a * Math.sin(t),
      z: 2 * a * Math.sin(t / 2)
    }
  }
  return { x: Math.cos(t), y: Math.sin(t), z: t / 5 }
}

function calculatePolar(graph: Graph, theta: number, controlValues: Record<string, number> = {}): number {
  // Handle specific problematic polar equations
  if (graph.name === 'Lemniscate of Bernoulli') {
    // r^2 = a^2 * cos(n*(theta - alpha)) -> r = a * sqrt(cos(n*(theta - alpha)))
    // Where alpha is the rotation angle in radians and n is the curve parameter
    const a = controlValues.a || 2
    const n = controlValues.n || 2 // Curve parameter (2 = classic lemniscate)
    const rotationDegrees = controlValues.rotation || 0
    const alpha = (rotationDegrees * Math.PI) / 180 // Convert degrees to radians
    const cosNtheta = Math.cos(n * (theta - alpha))
    return cosNtheta >= 0 ? a * Math.sqrt(cosNtheta) : 0
  }
  
  if (graph.name === 'Cardioid') {
    const a = controlValues.a || 2
    const rotationDegrees = controlValues.rotation || 0
    const alpha = (rotationDegrees * Math.PI) / 180 // Convert degrees to radians
    return a * (1 - Math.cos(theta - alpha))
  }
  
  if (graph.name === 'Rose Curve') {
    const a = controlValues.a || controlValues.scale || 3
    const k = controlValues.k || controlValues.petals || 5  // k=5 creates 5 petals (clearer for students than k=4 which creates 8 petals)
    return a * Math.cos(k * theta)
  }
  
  // Try to evaluate the LaTeX equation
  try {
    const expr = convertLatexToMathjs(graph.equation_latex)
    const scope = { 
      theta, 
      r: 2, a: 2, k: 4, 
      pi: Math.PI, e: Math.E
    }
    
    // Add controlValues to scope for dynamic parameters
    const extendedScope = { ...scope, ...controlValues }
    const result = evaluate(expr, extendedScope)
    return isNaN(result) ? 0 : Math.abs(result) // Ensure positive radius
  } catch (error) {
    console.warn(`Error parsing polar equation for ${graph.name}:`, error)
    return 2
  }
}

function convertLatexToMathjs(latex: string): string {
  let expr = latex
  
  // Handle equations in the form "z = ..." or "y = ..." - extract right-hand side
  if (expr.includes('=')) {
    expr = expr.split('=')[1].trim()
  }
  
  // Convert LaTeX to mathjs syntax
  expr = expr
    // Handle fractions
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
    // Handle square roots
    .replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)')
    // Handle trigonometric functions with powers: \cos^3(t) -> cos(t)^3
    .replace(/\\sin\^(\d+)\(([^)]+)\)/g, 'sin($2)^$1')
    .replace(/\\cos\^(\d+)\(([^)]+)\)/g, 'cos($2)^$1')
    .replace(/\\tan\^(\d+)\(([^)]+)\)/g, 'tan($2)^$1')
    // Handle powers like x^{-2} -> x^(-2)
    .replace(/\^{([^}]+)}/g, '^($1)')
    // Handle trigonometric and other functions
    .replace(/\\sin/g, 'sin')
    .replace(/\\cos/g, 'cos')
    .replace(/\\tan/g, 'tan')
    .replace(/\\ln/g, 'log')
    .replace(/\\log/g, 'log')
    .replace(/\\exp/g, 'exp')
    // Handle Greek letters and constants
    .replace(/\\pi/g, 'pi')
    .replace(/\\theta/g, 'theta')
    .replace(/\\delta/g, 'delta')
    .replace(/\\phi/g, 'phi')
    .replace(/\\omega/g, 'omega')
    .replace(/\\gamma/g, 'gamma')
    .replace(/\\e/g, 'e')
    // Handle mathematical symbols
    .replace(/\\propto/g, '*') // Handle proportionality
    .replace(/\\approx/g, '=') // Handle approximation as equality
    // Convert remaining braces to parentheses
    .replace(/\{([^}]+)\}/g, '($1)')
    
  // Handle implicit multiplication more robustly
  expr = expr
    // Handle variable-variable multiplication: xy -> x*y, but avoid overriding function names
    .replace(/([a-z])([a-z])/g, (_, p1, p2) => {
      // Don't split common function names or constants
      const combined = p1 + p2
      if (['sin', 'cos', 'tan', 'log', 'exp', 'pi'].includes(combined)) {
        return combined
      }
      return `${p1}*${p2}`
    })
    // Handle coefficient-variable: 2x -> 2*x, 3y -> 3*y
    .replace(/(\d+)([a-z])/gi, '$1*$2')
    // Handle variable-coefficient: x2 -> x*2 (less common but possible)
    .replace(/([a-z])(\d+)/gi, '$1*$2')
    // Handle closing parenthesis followed by variable/opening parenthesis
    .replace(/(\))([a-z(])/gi, '$1*$2')
    // Handle variable/constant followed by opening parenthesis
    .replace(/([a-z\d])(\()/gi, '$1*$2')
    // Handle square terms more explicitly: x^2y -> x^2*y
    .replace(/(\^(?:\d+|\([^)]+\)))([a-z])/gi, '$1*$2')
    
  return expr
}

// Function to create geometry for custom graphs
function createCustomGraphGeometry(customGraph: CustomGraph, controlValues: Record<string, number>): THREE.BufferGeometry {
  const { equation, type, variables } = customGraph
  
  try {
    // Prepare variable values for evaluation
    const scope: Record<string, number> = {}
    variables.forEach(variable => {
      scope[variable.name] = controlValues[variable.name] || variable.defaultValue
    })

    if (type === '3D') {
      // For 3D surfaces, try to render as z = f(x, y)
      return createCustom3DSurface(equation, scope)
    } else {
      // For 2D curves, try to render as y = f(x) or parametric
      return createCustom2DCurve(equation, scope)
    }
  } catch (error) {
    console.error('Error creating custom graph geometry:', error)
    // Return empty geometry on error
    return new THREE.BufferGeometry()
  }
}

// Create 3D surface geometry from custom equation
function createCustom3DSurface(equation: string, scope: Record<string, number>): THREE.BufferGeometry {
  const resolution = 50
  const range = 10
  const step = (2 * range) / resolution
  
  const vertices: number[] = []
  const indices: number[] = []
  
  // Try to evaluate the equation as z = f(x, y)
  for (let i = 0; i <= resolution; i++) {
    for (let j = 0; j <= resolution; j++) {
      const x = -range + i * step
      const y = -range + j * step
      
      try {
        // Validate domain for 3D surfaces (primarily affects x coordinate)
        const domainCheck = validateDomain(equation, x, y)
        let z = 0
        
        if (domainCheck.isValid) {
          const evalScope = { ...scope, x, y }
          const result = evaluate(equation, evalScope)
          z = typeof result === 'number' && isFinite(result) ? result : 0
        }
        
        // Clamp z values to reasonable range
        const clampedZ = Math.max(-50, Math.min(50, z))
        
        vertices.push(x, clampedZ, y) // Note: Three.js uses Y-up, so we swap y and z
      } catch {
        vertices.push(x, 0, y) // Default to z=0 if evaluation fails
      }
    }
  }
  
  // Create indices for triangles
  for (let i = 0; i < resolution; i++) {
    for (let j = 0; j < resolution; j++) {
      const a = i * (resolution + 1) + j
      const b = a + resolution + 1
      const c = a + 1
      const d = b + 1
      
      // Two triangles per quad
      indices.push(a, b, c)
      indices.push(b, d, c)
    }
  }
  
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  
  return geometry
}

// Create 2D curve geometry from custom equation
function createCustom2DCurve(equation: string, scope: Record<string, number>): THREE.BufferGeometry {
  const resolution = 200
  const range = 10
  const step = (2 * range) / resolution
  
  let currentSegment: THREE.Vector3[] = []
  const segments: THREE.Vector3[][] = []
  
  // Try to evaluate as y = f(x)
  for (let i = 0; i <= resolution; i++) {
    const x = -range + i * step
    
    try {
      // Validate domain before evaluation
      const domainCheck = validateDomain(equation, x)
      if (!domainCheck.isValid) {
        // Domain issue - end current segment and start new one
        if (currentSegment.length > 1) {
          segments.push([...currentSegment])
        }
        currentSegment = []
        continue
      }
      
      const evalScope = { ...scope, x }
      const y = evaluate(equation, evalScope)
      
      if (isNaN(y) || !isFinite(y)) {
        // Invalid result - end current segment
        if (currentSegment.length > 1) {
          segments.push([...currentSegment])
        }
        currentSegment = []
      } else {
        // Valid point - add to current segment
        const clampedY = Math.max(-50, Math.min(50, y))
        currentSegment.push(new THREE.Vector3(x, clampedY, 0))
      }
    } catch {
      // Error encountered - end current segment
      if (currentSegment.length > 1) {
        segments.push([...currentSegment])
      }
      currentSegment = []
    }
  }
  
  // Add final segment if it exists
  if (currentSegment.length > 1) {
    segments.push(currentSegment)
  }
  
  // Find the longest continuous segment to display
  if (segments.length === 0) {
    return new THREE.BufferGeometry().setFromPoints([])
  }
  
  let longestSegment = segments[0]
  for (const segment of segments) {
    if (segment.length > longestSegment.length) {
      longestSegment = segment
    }
  }
  
  const geometry = new THREE.BufferGeometry()
  geometry.setFromPoints(longestSegment)
  
  return geometry
}

export default GraphRenderer