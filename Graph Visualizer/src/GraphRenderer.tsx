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
      // Some shapes are better represented with built-in Three.js geometries
      if (graph.name === 'Cylinder' || graph.name === 'Sphere' || graph.name === 'Cone' || 
          graph.name === 'Torus (Doughnut)') {
        return createDefaultGeometry(graph)
      }
      
      // Handle Wave Function specifically as 3D Surface
      if (graph.name === 'Wave Function (Quantum Mechanics)') {
        return createSurfaceGeometry(graph, resolution)
      }
      
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
      opacity: 0.8,
      side: THREE.DoubleSide
    })
  }, [graph.type])

  // Determine if this should be rendered as a filled surface or line
  const shouldRenderAsFilled = graph.name === 'Circle' || graph.name === 'Ellipse' || 
    graph.name === 'Cardioid' || graph.name === 'Rose Curve' || 
    graph.name === 'Lemniscate of Bernoulli' || graph.name === 'Astroid' ||
    graph.name === 'Cycloid' || graph.name === 'Lissajous Curve'

  if ((graph.type.includes('Curve') || graph.type === '2D Function' || graph.type === '2D Parametric' || graph.type === '2D Polar') && !shouldRenderAsFilled) {
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
  
  // Don't recalculate x,y - use the correct coordinates from PlaneGeometry
  // Only modify the z values based on the existing x,y coordinates
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i]     // Use existing x coordinate from PlaneGeometry
    const y = positions[i + 1] // Use existing y coordinate from PlaneGeometry
    
    let z = 0
    try {
      z = calculateSurfaceZ(graph, x, y)
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
  const shouldRenderAsFilled = graph.name === 'Circle' || graph.name === 'Ellipse' || 
    graph.name === 'Astroid' || graph.name === 'Cycloid' || graph.name === 'Lissajous Curve'
    
  if (shouldRenderAsFilled) {
    // Create filled surface for these shapes
    const geometry = new THREE.PlaneGeometry(1, 1, resolution, resolution)
    const positions = geometry.attributes.position.array as Float32Array
    
    const tMax = 2 * Math.PI
    const step = tMax / resolution
    
    for (let i = 0; i < positions.length; i += 3) {
      const t = (i / 3) * step / (resolution + 1) * tMax
      try {
        const { x, y } = calculateParametric2D(graph, t)
        positions[i] = x
        positions[i + 1] = y
        positions[i + 2] = 0
      } catch {
        positions[i] = 0
        positions[i + 1] = 0
        positions[i + 2] = 0
      }
    }
    
    geometry.attributes.position.needsUpdate = true
    return geometry
  } else {
    // Create line geometry for curves
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
  const shouldRenderAsFilled = graph.name === 'Cardioid' || graph.name === 'Rose Curve' || 
    graph.name === 'Lemniscate of Bernoulli'
    
  if (shouldRenderAsFilled) {
    // Create filled surface for polar shapes
    const geometry = new THREE.PlaneGeometry(1, 1, resolution, resolution)
    const positions = geometry.attributes.position.array as Float32Array
    
    const thetaMax = 2 * Math.PI
    const step = thetaMax / resolution
    
    for (let i = 0; i < positions.length; i += 3) {
      const theta = (i / 3) * step / (resolution + 1) * thetaMax
      try {
        const r = calculatePolar(graph, theta)
        const x = r * Math.cos(theta)
        const y = r * Math.sin(theta)
        positions[i] = x
        positions[i + 1] = y
        positions[i + 2] = 0
      } catch {
        positions[i] = 0
        positions[i + 1] = 0
        positions[i + 2] = 0
      }
    }
    
    geometry.attributes.position.needsUpdate = true
    return geometry
  } else {
    // Create line geometry for curves
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
}

function createDefaultGeometry(graph: Graph): THREE.BufferGeometry {
  switch (graph.name) {
    case 'Sphere':
      return new THREE.SphereGeometry(3, 32, 32)
    case 'Paraboloid':
      return createParaboloidGeometry()
    case 'Hyperbolic Paraboloid':
      return createHyperbolicParaboloidGeometry()
    case 'Ellipsoid':
      return new THREE.SphereGeometry(2, 32, 32)
    case 'Cone':
      return new THREE.ConeGeometry(2, 4, 32)
    case 'Cylinder':
      return new THREE.CylinderGeometry(2, 2, 6, 32) // Proper cylinder
    case 'Torus (Doughnut)':
      return new THREE.TorusGeometry(3, 1, 16, 100)
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
  const originalEquation = graph.equation_latex
  
  // Handle parametric surfaces (u,v parameterization)
  if (graph.name === 'Helicoid') {
    // x = u*cos(v), y = u*sin(v), z = c*v
    // Given (x,y), find (u,v) and return z
    const c = 0.5
    const u = Math.sqrt(x*x + y*y)
    const v = Math.atan2(y, x)
    return c * v
  }
  
  if (graph.name === 'Enneper Surface') {
    // This is complex - let's create a simpler approximation
    // x=u-u^3/3+uv^2, y=v-v^3/3+vu^2, z=u^2-v^2
    // Use x and y as approximations for u and v
    const u = x * 0.5
    const v = y * 0.5
    return u*u - v*v
  }
  
  // Handle specific implicit equations by solving for z
  if (graph.name === 'Ellipsoid') {
    // x^2/a^2 + y^2/b^2 + z^2/c^2 = 1 -> z = ±c*sqrt(1 - x^2/a^2 - y^2/b^2)
    const a = 3, b = 2, c = 1.5
    const term = 1 - (x*x)/(a*a) - (y*y)/(b*b)
    return term >= 0 ? c * Math.sqrt(term) : 0
  }
  
  if (graph.name === 'Cone') {
    // x^2/a^2 + y^2/b^2 - z^2/c^2 = 0 -> z = ±c*sqrt(x^2/a^2 + y^2/b^2)
    const a = 2, b = 2, c = 2
    return c * Math.sqrt((x*x)/(a*a) + (y*y)/(b*b))
  }
  
  if (graph.name === 'Hyperboloid of One Sheet') {
    // x^2/a^2 + y^2/b^2 - z^2/c^2 = 1 -> z = ±c*sqrt(x^2/a^2 + y^2/b^2 - 1)
    const a = 2, b = 2, c = 2
    const term = (x*x)/(a*a) + (y*y)/(b*b) - 1
    return term >= 0 ? c * Math.sqrt(term) : 0
  }
  
  if (graph.name === 'Hyperboloid of Two Sheets') {
    // -x^2/a^2 - y^2/b^2 + z^2/c^2 = 1 -> z = ±c*sqrt(1 + x^2/a^2 + y^2/b^2)
    const a = 2, b = 2, c = 2
    return c * Math.sqrt(1 + (x*x)/(a*a) + (y*y)/(b*b))
  }
  
  if (graph.name === 'Cylinder') {
    // x^2 + y^2 = r^2 -> create cylindrical surface
    const r = 2
    const dist = Math.sqrt(x*x + y*y)
    // Create a cylindrical surface that varies smoothly
    return dist <= r ? y * 0.5 : 0 // Linear variation along y-axis
  }
  
  if (graph.name === 'Torus (Doughnut)') {
    // (sqrt(x^2+y^2)-R)^2 + z^2 = r^2 -> z = ±r*sqrt(1 - ((sqrt(x^2+y^2)-R)/r)^2)
    const R = 3, r = 1
    const rho = Math.sqrt(x*x + y*y)
    const term = 1 - Math.pow((rho - R)/r, 2)
    return term >= 0 ? r * Math.sqrt(term) : 0
  }
  
  if (graph.name === 'Sphere') {
    // x^2 + y^2 + z^2 = r^2 -> z = ±sqrt(r^2 - x^2 - y^2)
    const r = 3
    const term = r*r - x*x - y*y
    return term >= 0 ? Math.sqrt(term) : 0
  }
  
  if (graph.name === 'Sine Wave Surface') {
    // z = sin(x) + cos(y)
    return Math.sin(x) + Math.cos(y)
  }
  
  if (graph.name === 'Gaussian (Bell Curve) Surface') {
    // z = e^(-(x^2+y^2)/σ^2) with proper scaling for visualization
    const sigma = 3 // Standard deviation - controls width of bell curve
    const amplitude = 3 // Height scaling for better visibility
    return amplitude * Math.exp(-((x*x + y*y) / (2 * sigma * sigma)))
  }
  
  if (graph.name === 'Monkey Saddle') {
    // z = x^3 - 3*x*y^2, but limit the growth
    const z = x*x*x - 3*x*y*y
    // Clamp the values to prevent extreme scaling
    return Math.max(-5, Math.min(5, z * 0.2))
  }
  
  if (graph.name === 'Wave Function (Quantum Mechanics)') {
    // Show actual wave oscillations rather than just |Ψ|²
    // This shows the real part of a quantum wave function with spatial oscillations
    const waveLength = 2 // Spatial wavelength
    const amplitude = 1.5 // Wave amplitude
    const envelope = 3 // Gaussian envelope width
    
    // Wave function: Ψ(x,y) = A * exp(-(x²+y²)/σ²) * cos(2π*√(x²+y²)/λ)
    const r = Math.sqrt(x*x + y*y) // Radial distance
    const gaussianEnvelope = Math.exp(-(x*x + y*y) / (envelope * envelope))
    const oscillation = Math.cos(2 * Math.PI * r / waveLength)
    
    return amplitude * gaussianEnvelope * oscillation
  }
  
  if (graph.name === 'Linear Function (Plane)') {
    // ax + by + cz = d -> z = (d - ax - by)/c
    const a = 1, b = 1, c = 1, d = 0
    return (d - a*x - b*y) / c
  }
  
  // For explicit equations (z = ...), use the conversion
  try {
    const expr = convertLatexToMathjs(originalEquation)
    const scope = { x, y, a: 2, b: 2, c: 2, r: 2, R: 3 }
    const result = evaluate(expr, scope)
    
    // Clamp extreme values to keep surfaces visible
    if (isNaN(result) || !isFinite(result)) return 0
    return Math.max(-10, Math.min(10, result))
  } catch (error) {
    console.warn(`Error calculating surface for ${graph.name}:`, error)
    return 0
  }
}

function calculate2DFunction(graph: Graph, x: number): number {
  // Handle specific problematic functions
  if (graph.name === 'Square Root Function') {
    return x >= 0 ? Math.sqrt(x) : 0
  }
  
  if (graph.name === 'Absolute Value Function') {
    return Math.abs(x)
  }
  
  if (graph.name === 'Reciprocal Function (Hyperbola)') {
    return x !== 0 ? 1/x : 0
  }
  
  if (graph.name === 'Tangent Function') {
    return Math.tan(x)
  }
  
  if (graph.name === 'Logarithmic Function') {
    return x > 0 ? Math.log(x) : 0
  }
  
  if (graph.name === 'Sine and Cosine Waves') {
    const A = 1, B = 1, C = 0, D = 0
    return A * Math.sin(B * x + C) + D
  }
  
  // Handle physics equations with correct mathematical relationships
  if (graph.name === 'Position vs. Time (Kinematics)') {
    // Show motion with initial velocity and acceleration: x = x₀ + v₀t + ½at²
    // Let x represent time t, return position x(t)
    const x0 = 1 // Initial position
    const v0 = 2 // Initial velocity  
    const a = 0.3 // Acceleration
    return x0 + v0 * x + 0.5 * a * x * x // Classic kinematic equation
  }
  
  if (graph.name === 'Velocity vs. Time (Kinematics)') {
    // Linear acceleration: v = v₀ + at
    return x // Linear relationship
  }
  
  if (graph.name === 'Acceleration vs. Time (Kinematics)') {
    // Show realistic acceleration profile: acceleration then deceleration
    // Like a car accelerating then braking
    if (x < 0) return 0 // No acceleration before t=0
    if (x < 3) return 2 // Constant acceleration phase
    if (x < 5) return 2 - 2 * (x - 3) // Linear deceleration 
    return -2 // Constant braking/negative acceleration
  }
  
  if (graph.name === "Force vs. Extension (Hooke's Law)") {
    // For Force vs Extension: F_applied = kx (positive slope)
    // This is the force needed to stretch the spring by extension x
    // Note: Hooke's law F = -kx is the restoring force, but this graph shows applied force
    const k = 2 // Spring constant
    return k * Math.abs(x) // Applied force proportional to extension (always positive for stretching)
  }
  
  if (graph.name === 'Pressure vs. Volume (Boyle\'s Law)') {
    // P ∝ 1/V (hyperbolic)
    return x !== 0 ? 5/x : 0
  }
  
  if (graph.name === "Volume vs. Temperature (Charles's Law)") {
    // Charles's Law: V ∝ T (absolute temperature in Kelvin)
    // If x represents temperature in Celsius, convert to Kelvin
    const temperatureKelvin = x + 273.15 // Convert °C to K
    const k = 0.01 // Proportionality constant (small for reasonable scale)
    
    // Volume should be zero at absolute zero, proportional to T in Kelvin
    return temperatureKelvin > 0 ? k * temperatureKelvin : 0
  }
  
  if (graph.name === "Pressure vs. Temperature (Gay-Lussac's Law)") {
    // Gay-Lussac's Law: P ∝ T (absolute temperature in Kelvin)
    // If x represents temperature in Celsius, convert to Kelvin
    const temperatureKelvin = x + 273.15 // Convert °C to K
    const k = 0.1 // Proportionality constant (for reasonable pressure scale)
    
    // Pressure should be zero at absolute zero, proportional to T in Kelvin
    return temperatureKelvin > 0 ? k * temperatureKelvin : 0
  }
  
  if (graph.name === 'I-V Characteristic of a Resistor') {
    // V = IR (linear through origin)
    return 2 * x
  }
  
  if (graph.name === 'I-V Characteristic of a Diode') {
    // I = I₀(e^(V/Vₜ) - 1) (exponential)
    const V_T = 0.026
    return x > 0 ? Math.exp(x / V_T) - 1 : 0
  }
  
  if (graph.name === 'Blackbody Radiation Spectrum') {
    // Planck's law approximation
    const lambda = Math.abs(x) + 0.5
    return 1 / (Math.pow(lambda, 5) * (Math.exp(1/lambda) - 1))
  }
  
  if (graph.name === 'Photoelectric Effect') {
    // K_max = hf - φ (linear with threshold)
    const workFunction = 2
    return x > workFunction ? x - workFunction : 0
  }
  
  if (graph.name === 'Binding Energy per Nucleon') {
    // Bell curve peaking at Iron-56
    const A = Math.abs(x)
    return 8.5 - Math.pow((A - 56)/30, 2)
  }
  
  if (graph.name.includes('Simple Harmonic Motion')) {
    const A = 2, omega = 1, phi = 0
    return A * Math.cos(omega * x + phi)
  }
  
  if (graph.name.includes('Damped Oscillations')) {
    const A = 2, gamma = 0.1, omega = 1, phi = 0
    return A * Math.exp(-gamma * x) * Math.cos(omega * x + phi)
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
    
    const result = evaluate(expr, scope)
    
    // Clamp extreme values to keep things visible
    if (isNaN(result) || !isFinite(result)) return 0
    if (result > 100) return 100
    if (result < -100) return -100
    
    return result
  } catch (error) {
    console.warn(`Error calculating 2D function for ${graph.name}:`, error)
    return 0
  }
}

function calculateParametric2D(graph: Graph, t: number): { x: number, y: number } {
  // Handle specific problematic parametric equations
  if (graph.name === 'Astroid') {
    // x = a*cos^3(t), y = a*sin^3(t)
    const a = 3
    const cosT = Math.cos(t)
    const sinT = Math.sin(t)
    return { x: a * cosT * cosT * cosT, y: a * sinT * sinT * sinT }
  }
  
  if (graph.name === 'Lissajous Curve') {
    // x = A*sin(at + δ), y = B*sin(bt)
    const A = 3, B = 2, a = 3, b = 2, delta = Math.PI/4
    return { 
      x: A * Math.sin(a * t + delta), 
      y: B * Math.sin(b * t) 
    }
  }
  
  if (graph.name === 'Cycloid') {
    // x = r(t - sin(t)), y = r(1 - cos(t))
    // Visible canvas is roughly -10 to +10, so arch width should be ~8 units max
    const r = 0.8 // Small radius: arch width = 2πr ≈ 5 units
    
    const x = r * (t - Math.sin(t))
    const y = r * (1 - Math.cos(t))
    
    // Center the arch: width spans from 0 to 2πr ≈ 5 units
    const archWidth = 2 * Math.PI * r
    return { 
      x: x - archWidth/2, // Center: spans roughly -2.5 to +2.5
      y: y - r // Cusps at y=-0.8, peak at y=+0.8
    }
  }
  
  if (graph.name === 'Circle') {
    const r = 3
    return { x: r * Math.cos(t), y: r * Math.sin(t) }
  }
  
  if (graph.name === 'Ellipse') {
    const a = 4, b = 2
    return { x: a * Math.cos(t), y: b * Math.sin(t) }
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
      
      return { x, y }
    }
  } catch (error) {
    console.warn(`Error parsing parametric equation for ${graph.name}:`, error)
  }
  
  return { x: t, y: Math.sin(t) }
}

function calculateParametric3D(graph: Graph, t: number): { x: number, y: number, z: number } {
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
  
  // Fallback for specific known shapes
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
  // Handle specific problematic polar equations
  if (graph.name === 'Lemniscate of Bernoulli') {
    // r^2 = a^2 * cos(2*theta) -> r = a * sqrt(cos(2*theta))
    const a = 2
    const cos2theta = Math.cos(2 * theta)
    return cos2theta >= 0 ? a * Math.sqrt(cos2theta) : 0
  }
  
  if (graph.name === 'Cardioid') {
    const a = 2
    return a * (1 - Math.cos(theta))
  }
  
  if (graph.name === 'Rose Curve') {
    const a = 3, k = 4
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
    
    const result = evaluate(expr, scope)
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
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
    .replace(/\\sqrt\{([^}]+)\}\{([^}]+)\}/g, 'sqrt($1)')
    .replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)')
    // Handle trigonometric functions with powers: \cos^3(t) -> cos(t)^3
    .replace(/\\sin\^(\d+)\(([^)]+)\)/g, 'sin($2)^$1')
    .replace(/\\cos\^(\d+)\(([^)]+)\)/g, 'cos($2)^$1')
    .replace(/\\tan\^(\d+)\(([^)]+)\)/g, 'tan($2)^$1')
    .replace(/\\sin/g, 'sin')
    .replace(/\\cos/g, 'cos')
    .replace(/\\tan/g, 'tan')
    .replace(/\\ln/g, 'log')
    .replace(/\\log/g, 'log')
    .replace(/\\exp/g, 'exp')
    .replace(/\\pi/g, 'pi')
    .replace(/\\theta/g, 'theta')
    .replace(/\\delta/g, 'delta')
    .replace(/\\phi/g, 'phi')
    .replace(/\\omega/g, 'omega')
    .replace(/\\gamma/g, 'gamma')
    .replace(/\\e/g, 'e')
    .replace(/\^/g, '^')
    .replace(/\{([^}]+)\}/g, '($1)')
    .replace(/\\propto/g, '*') // Handle proportionality
    .replace(/\\approx/g, '=') // Handle approximation as equality
    // Handle specific implicit multiplication patterns
    .replace(/([xy])([xy])/g, '$1*$2') // Handle xy, xx, yy -> x*y, x*x, y*y  
    .replace(/([abcrkABCR])([xyt])/g, '$1*$2') // Handle ax, by, etc. -> a*x, b*y
    .replace(/([xyt])([abcrkABCR])/g, '$1*$2') // Handle xa, yb, etc. -> x*a, y*b
    .replace(/(\))([a-z])/gi, '$1*$2') // Handle )x -> )*x
    .replace(/([a-z])(\()/gi, '$1*$2') // Handle x( -> x*(
    .replace(/([0-9])([a-z])/gi, '$1*$2') // Handle 2x -> 2*x
  
  return expr
}

export default GraphRenderer