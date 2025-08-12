import { useMemo } from 'react'
import * as THREE from 'three'
import { evaluate } from 'mathjs'

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
  graph: Graph
}

function GraphRenderer({ graph }: GraphRendererProps) {
  const geometry = useMemo(() => {
    const resolution = 50
    
    try {
      switch (graph.type) {
        case '3D Surface':
          return createSurfaceGeometry(graph, resolution)
        case '2D Function':
          return create2DFunctionGeometry(graph, resolution)
        case '2D Parametric':
          return createParametricGeometry(graph, resolution)
        case '3D Parametric Curve':
          return createParametricCurveGeometry(graph, resolution)
        case '2D Polar':
          return createPolarGeometry(graph, resolution)
        default:
          return createDefaultGeometry(graph)
      }
    } catch (error) {
      console.warn(`Error rendering graph ${graph.name}:`, error)
      return createDefaultGeometry(graph)
    }
  }, [graph])

  const material = useMemo(() => {
    if (graph.type.includes('Curve') || graph.type === '2D Function') {
      return new THREE.LineBasicMaterial({ color: '#ff6b35', linewidth: 2 })
    }
    return new THREE.MeshStandardMaterial({ 
      color: '#4a9eff', 
      wireframe: false,
      transparent: true,
      opacity: 0.8
    })
  }, [graph.type])

  if (graph.type.includes('Curve') || graph.type === '2D Function') {
    return (
      <line geometry={geometry} material={material} />
    )
  }

  return (
    <mesh geometry={geometry} material={material} />
  )
}

function createSurfaceGeometry(graph: Graph, resolution: number): THREE.BufferGeometry {
  const geometry = new THREE.PlaneGeometry(10, 10, resolution, resolution)
  const positions = geometry.attributes.position.array as Float32Array
  
  const range = 5
  const step = (2 * range) / resolution

  for (let i = 0; i < positions.length; i += 3) {
    const x = -range + (i / 3 % (resolution + 1)) * step
    const y = -range + Math.floor((i / 3) / (resolution + 1)) * step
    
    let z = 0
    try {
      z = calculateSurfaceZ(graph, x, y)
    } catch {
      z = 0
    }
    
    positions[i] = x
    positions[i + 1] = y
    positions[i + 2] = z
  }
  
  geometry.attributes.position.needsUpdate = true
  geometry.computeVertexNormals()
  
  return geometry
}

function create2DFunctionGeometry(graph: Graph, resolution: number): THREE.BufferGeometry {
  const points: THREE.Vector3[] = []
  const range = 10
  const step = (2 * range) / resolution
  
  for (let i = 0; i <= resolution; i++) {
    const x = -range + i * step
    try {
      const y = calculate2DFunction(graph, x)
      points.push(new THREE.Vector3(x, y, 0))
    } catch {
      continue
    }
  }
  
  return new THREE.BufferGeometry().setFromPoints(points)
}

function createParametricGeometry(graph: Graph, resolution: number): THREE.BufferGeometry {
  const points: THREE.Vector3[] = []
  const tMax = 2 * Math.PI
  const step = tMax / resolution
  
  for (let i = 0; i <= resolution; i++) {
    const t = i * step
    try {
      const { x, y } = calculateParametric2D(graph, t)
      points.push(new THREE.Vector3(x, y, 0))
    } catch {
      continue
    }
  }
  
  return new THREE.BufferGeometry().setFromPoints(points)
}

function createParametricCurveGeometry(graph: Graph, resolution: number): THREE.BufferGeometry {
  const points: THREE.Vector3[] = []
  const tMax = 2 * Math.PI
  const step = tMax / resolution
  
  for (let i = 0; i <= resolution; i++) {
    const t = i * step
    try {
      const { x, y, z } = calculateParametric3D(graph, t)
      points.push(new THREE.Vector3(x, y, z))
    } catch {
      continue
    }
  }
  
  return new THREE.BufferGeometry().setFromPoints(points)
}

function createPolarGeometry(graph: Graph, resolution: number): THREE.BufferGeometry {
  const points: THREE.Vector3[] = []
  const thetaMax = 2 * Math.PI
  const step = thetaMax / resolution
  
  for (let i = 0; i <= resolution; i++) {
    const theta = i * step
    try {
      const r = calculatePolar(graph, theta)
      const x = r * Math.cos(theta)
      const y = r * Math.sin(theta)
      points.push(new THREE.Vector3(x, y, 0))
    } catch {
      continue
    }
  }
  
  return new THREE.BufferGeometry().setFromPoints(points)
}

function createDefaultGeometry(graph: Graph): THREE.BufferGeometry {
  switch (graph.name) {
    case 'Sphere':
      return new THREE.SphereGeometry(2, 32, 32)
    case 'Paraboloid':
      return createParaboloidGeometry()
    case 'Hyperbolic Paraboloid':
      return createHyperbolicParaboloidGeometry()
    case 'Ellipsoid':
      return new THREE.SphereGeometry(2, 32, 32)
    case 'Cone':
      return new THREE.ConeGeometry(2, 4, 32)
    case 'Cylinder':
      return new THREE.CylinderGeometry(2, 2, 4, 32)
    case 'Torus (Doughnut)':
      return new THREE.TorusGeometry(2, 0.8, 16, 100)
    default:
      return new THREE.BoxGeometry(2, 2, 2)
  }
}

function createParaboloidGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.PlaneGeometry(8, 8, 50, 50)
  const positions = geometry.attributes.position.array as Float32Array
  
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i]
    const y = positions[i + 1]
    positions[i + 2] = (x * x + y * y) / 8
  }
  
  geometry.attributes.position.needsUpdate = true
  geometry.computeVertexNormals()
  return geometry
}

function createHyperbolicParaboloidGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.PlaneGeometry(8, 8, 50, 50)
  const positions = geometry.attributes.position.array as Float32Array
  
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i]
    const y = positions[i + 1]
    positions[i + 2] = (x * x - y * y) / 8
  }
  
  geometry.attributes.position.needsUpdate = true
  geometry.computeVertexNormals()
  return geometry
}

function calculateSurfaceZ(graph: Graph, x: number, y: number): number {
  const expr = convertLatexToMathjs(graph.equation_latex)
  return evaluate(expr, { x, y })
}

function calculate2DFunction(graph: Graph, x: number): number {
  const expr = convertLatexToMathjs(graph.equation_latex)
  return evaluate(expr, { x })
}

function calculateParametric2D(graph: Graph, t: number): { x: number, y: number } {
  if (graph.name === 'Circle') {
    const r = 3
    return { x: r * Math.cos(t), y: r * Math.sin(t) }
  }
  if (graph.name === 'Ellipse') {
    const a = 4, b = 2
    return { x: a * Math.cos(t), y: b * Math.sin(t) }
  }
  return { x: t, y: Math.sin(t) }
}

function calculateParametric3D(graph: Graph, t: number): { x: number, y: number, z: number } {
  if (graph.name === 'Trefoil Knot') {
    return {
      x: (2 + Math.cos(3 * t)) * Math.cos(2 * t),
      y: (2 + Math.cos(3 * t)) * Math.sin(2 * t),
      z: Math.sin(3 * t)
    }
  }
  return { x: Math.cos(t), y: Math.sin(t), z: t / 5 }
}

function calculatePolar(graph: Graph, theta: number): number {
  if (graph.name === 'Cardioid') {
    const a = 2
    return a * (1 - Math.cos(theta))
  }
  if (graph.name === 'Rose Curve') {
    const a = 3, k = 4
    return a * Math.cos(k * theta)
  }
  return 2
}

function convertLatexToMathjs(latex: string): string {
  return latex
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
    .replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)')
    .replace(/\\sin/g, 'sin')
    .replace(/\\cos/g, 'cos')
    .replace(/\\tan/g, 'tan')
    .replace(/\\ln/g, 'log')
    .replace(/\\pi/g, 'pi')
    .replace(/\\e/g, 'e')
    .replace(/\^/g, '^')
    .replace(/\{([^}]+)\}/g, '($1)')
}

export default GraphRenderer