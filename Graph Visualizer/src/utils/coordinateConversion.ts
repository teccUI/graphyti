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

interface MathematicalCoordinates {
  x: number
  y: number
  z: number
  parameterization?: {
    u?: number
    v?: number
    t?: number
    theta?: number
    r?: number
    phi?: number
    R?: number
    h?: number
  }
}

/**
 * Converts 3D scene coordinates back to mathematical coordinates
 * This function accounts for different graph types and their coordinate systems
 */
export const convertSceneToMathematicalCoordinates = (
  scenePoint: { x: number; y: number; z: number },
  graph: Graph,
  controlValues: Record<string, number> = {}
): MathematicalCoordinates => {
  const { x, y, z } = scenePoint

  // For most standard 3D surfaces and explicit functions, the scene coordinates
  // directly represent mathematical coordinates
  if (
    graph.type === '3D Surface' || 
    graph.type === '2D Function' ||
    graph.name === 'Linear Function (Plane)' ||
    graph.name === 'Sine Wave Surface' ||
    graph.name === 'Gaussian (Bell Curve) Surface' ||
    graph.name === 'Monkey Saddle' ||
    graph.name === 'Wave Function (Quantum Mechanics)'
  ) {
    // Apply any scaling transformations that were applied during rendering
    const xScale = controlValues.xScale || 1
    const yScale = controlValues.yScale || 1
    const zScale = controlValues.zScale || 1
    
    return {
      x: x / xScale,
      y: y / yScale, 
      z: z / zScale
    }
  }

  // Handle parametric surfaces with special coordinate systems
  if (graph.name === 'Sphere') {
    const radius = Math.sqrt(x*x + y*y + z*z)
    const theta = Math.atan2(y, x) // azimuthal angle
    const phi = Math.acos(z / radius) // polar angle
    
    return {
      x, y, z,
      parameterization: {
        r: radius,
        theta: theta,
        phi: phi
      }
    }
  }

  if (graph.name === 'Cylinder') {
    const radius = Math.sqrt(x*x + y*y)
    const theta = Math.atan2(y, x)
    
    return {
      x, y, z,
      parameterization: {
        r: radius,
        theta: theta
      }
    }
  }

  if (graph.name === 'Torus (Doughnut)') {
    const R = controlValues.R || 3 // Major radius
    const r = controlValues.r || 1.5 // Minor radius
    const rho = Math.sqrt(x*x + y*y)
    const phi = Math.atan2(y, x) // Angle around major axis
    const theta = Math.atan2(z, rho - R) // Angle around minor circle
    
    return {
      x, y, z,
      parameterization: {
        u: phi,
        v: theta,
        R: R,
        r: r
      }
    }
  }

  if (graph.name === 'Ellipsoid') {
    const a = controlValues.a || 3
    const b = controlValues.b || 2
    const c = controlValues.c || 1.5
    
    // Convert back to normalized sphere coordinates, then to spherical
    const xNorm = x / a
    const yNorm = y / b
    const zNorm = z / c
    const radius = Math.sqrt(xNorm*xNorm + yNorm*yNorm + zNorm*zNorm)
    const theta = Math.atan2(yNorm, xNorm)
    const phi = Math.acos(zNorm / radius)
    
    return {
      x, y, z,
      parameterization: {
        theta: theta,
        phi: phi
      }
    }
  }

  if (graph.name === 'Paraboloid') {
    const r = Math.sqrt(x*x + y*y)
    const theta = Math.atan2(y, x)
    
    return {
      x, y, z,
      parameterization: {
        r: r,
        theta: theta
      }
    }
  }

  if (graph.name === 'Cone') {
    const r = Math.sqrt(x*x + y*y)
    const theta = Math.atan2(y, x)
    const height = z
    
    return {
      x, y, z,
      parameterization: {
        r: r,
        theta: theta,
        h: height
      }
    }
  }

  // Handle 2D parametric curves
  if (graph.type === '2D Parametric' || graph.type === '3D Parametric Curve') {
    // For parametric curves, we can't easily reverse-engineer the parameter t
    // from the 3D coordinates, so we just show the Cartesian coordinates
    return { x, y, z }
  }

  // Handle polar curves
  if (graph.type === '2D Polar') {
    const r = Math.sqrt(x*x + y*y)
    const theta = Math.atan2(y, x)
    
    return {
      x, y, z,
      parameterization: {
        r: r,
        theta: theta
      }
    }
  }

  // Handle physics graphs with special coordinate mappings
  if (graph.name.includes('Position vs. Time') || 
      graph.name.includes('Velocity vs. Time') ||
      graph.name.includes('Acceleration vs. Time')) {
    return {
      x: x, // Time
      y: y, // Position/Velocity/Acceleration
      z: z
    }
  }

  if (graph.name.includes('Force vs. Extension') ||
      graph.name.includes('I-V Characteristic') ||
      graph.name.includes('Pressure vs. Volume')) {
    return {
      x: x, // Independent variable (extension, voltage, volume)
      y: y, // Dependent variable (force, current, pressure)
      z: z
    }
  }

  // Default case - return scene coordinates as mathematical coordinates
  return { x, y, z }
}

/**
 * Formats coordinates for display in tooltip
 */
export const formatCoordinatesForDisplay = (
  coords: MathematicalCoordinates,
  graph: Graph
): string => {
  const formatValue = (value: number): string => {
    if (Math.abs(value) < 0.001) return '0.000'
    return value.toFixed(3)
  }

  // Show parametric coordinates when available and relevant
  if (coords.parameterization) {
    if (graph.type === '2D Polar') {
      return `r=${formatValue(coords.parameterization.r || 0)}, θ=${formatValue(coords.parameterization.theta || 0)}`
    }
    
    if (graph.name === 'Sphere' && coords.parameterization.r && coords.parameterization.theta !== undefined && coords.parameterization.phi !== undefined) {
      return `r=${formatValue(coords.parameterization.r)}, θ=${formatValue(coords.parameterization.theta)}, φ=${formatValue(coords.parameterization.phi)}`
    }
    
    if (graph.name === 'Cylinder' && coords.parameterization.r && coords.parameterization.theta !== undefined) {
      return `r=${formatValue(coords.parameterization.r)}, θ=${formatValue(coords.parameterization.theta)}, z=${formatValue(coords.z)}`
    }
  }

  // Default Cartesian coordinate display
  if (graph.type === '2D Function' || graph.type === '2D Parametric' || graph.type === '2D Polar') {
    // For 2D graphs, show only x,y
    return `(${formatValue(coords.x)}, ${formatValue(coords.y)})`
  }

  // For 3D graphs, show x,y,z
  return `(${formatValue(coords.x)}, ${formatValue(coords.y)}, ${formatValue(coords.z)})`
}