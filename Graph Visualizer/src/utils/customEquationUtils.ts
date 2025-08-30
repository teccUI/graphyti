import { parse, type MathNode } from 'mathjs'

export interface CustomVariable {
  name: string
  label: string
  defaultValue: number
  min: number
  max: number
  step: number
}

export interface CustomGraph {
  id: string
  name: string
  equation: string
  type: '2D' | '3D'
  variables: CustomVariable[]
}

// Extract variables from a mathematical expression
export const extractVariables = (equation: string): string[] => {
  try {
    const node = parse(equation)
    const variables = new Set<string>()
    
    // Traverse the AST to find all symbol nodes (variables)
    node.traverse((node: MathNode) => {
      if (node.type === 'SymbolNode') {
        const name = (node as unknown as { name: string }).name
        // Filter out mathematical constants and functions
        if (!['e', 'pi', 'PI', 'E', 'sin', 'cos', 'tan', 'log', 'ln', 'sqrt', 'abs', 'exp', 'pow'].includes(name)) {
          variables.add(name)
        }
      }
    })
    
    return Array.from(variables).sort()
  } catch (error) {
    console.error('Error parsing equation:', error)
    return []
  }
}

// Determine if equation is 2D or 3D based on equation format and variables
export const determineGraphType = (equation: string, variables: string[]): '2D' | '3D' => {
  // Check if equation starts with 'z =' to identify 3D surface equations
  const trimmedEquation = equation.trim().toLowerCase()
  if (trimmedEquation.startsWith('z') && equation.includes('=')) {
    return '3D'
  }
  
  // Check for parametric 3D equations (equations with both x,y variables as inputs)
  const commonParameterVars = ['t', 'u', 'v', 'theta', 'phi', 'r']
  const inputVars = variables.filter(v => !commonParameterVars.includes(v))
  
  // If we have 2 or more input variables (like x,y), it's likely 3D
  if (inputVars.length >= 2) {
    return '3D'
  }
  
  return '2D'
}

// Generate control configurations for detected variables
export const generateVariableControls = (variables: string[]): CustomVariable[] => {
  return variables.map(variable => {
    // Default ranges based on common mathematical conventions
    let min = -10
    let max = 10
    let defaultValue = 1
    let step = 0.1
    
    // Special cases for common variables
    switch (variable) {
      case 'a':
      case 'b':
      case 'c':
        min = 0.1
        max = 10
        defaultValue = 2
        step = 0.1
        break
      case 'r':
      case 'radius':
        min = 0.1
        max = 10
        defaultValue = 3
        step = 0.1
        break
      case 'theta':
      case 'phi':
        min = 0
        max = 6.28 // 2π
        defaultValue = 0
        step = 0.1
        break
      case 't':
        min = 0
        max = 10
        defaultValue = 1
        step = 0.1
        break
      case 'omega':
      case 'w':
        min = 0.1
        max = 10
        defaultValue = 1
        step = 0.1
        break
      case 'k':
        min = 0.1
        max = 5
        defaultValue = 1
        step = 0.1
        break
      case 'n':
        min = 1
        max = 10
        defaultValue = 2
        step = 1
        break
      default:
        // Keep defaults
        break
    }
    
    return {
      name: variable,
      label: variable.toUpperCase(),
      defaultValue,
      min,
      max,
      step
    }
  })
}

// Create a custom graph object from equation string
export const createCustomGraph = (equation: string): CustomGraph | null => {
  try {
    const variables = extractVariables(equation)
    const type = determineGraphType(equation, variables)
    const variableControls = generateVariableControls(variables)
    
    return {
      id: 'custom_equation',
      name: 'Custom Equation',
      equation,
      type,
      variables: variableControls
    }
  } catch (error) {
    console.error('Error creating custom graph:', error)
    return null
  }
}

// Domain validation for mathematical functions
export const validateDomain = (equation: string, x: number, y?: number): { isValid: boolean; warning?: string } => {
  const lowerEq = equation.toLowerCase()
  
  // Check for logarithmic functions - need positive arguments
  if (lowerEq.includes('log') || lowerEq.includes('ln')) {
    if (x <= 0) {
      return { isValid: false, warning: 'Logarithmic functions undefined for x ≤ 0' }
    }
    // For 3D surfaces, also check y coordinate if present
    if (y !== undefined && y <= 0 && lowerEq.includes('y')) {
      return { isValid: false, warning: 'Logarithmic functions undefined for y ≤ 0' }
    }
  }
  
  // Check for square root - need non-negative arguments
  if (lowerEq.includes('sqrt')) {
    if (x < 0) {
      return { isValid: false, warning: 'Square root undefined for x < 0' }
    }
    // For 3D surfaces, also check y coordinate if present
    if (y !== undefined && y < 0 && lowerEq.includes('y')) {
      return { isValid: false, warning: 'Square root undefined for y < 0' }
    }
  }
  
  // Check for division by zero in 1/x
  if (lowerEq.includes('1/x') && Math.abs(x) < 1e-10) {
    return { isValid: false, warning: 'Division by zero at x = 0' }
  }
  
  // Check for tangent discontinuities
  if (lowerEq.includes('tan')) {
    const nearDiscontinuity = Math.abs(Math.cos(x)) < 1e-6
    if (nearDiscontinuity) {
      return { isValid: false, warning: 'Tangent discontinuity at x = π/2 + nπ' }
    }
  }
  
  return { isValid: true }
}

// Validate equation syntax
export const validateEquation = (equation: string): { isValid: boolean; error?: string } => {
  if (!equation.trim()) {
    return { isValid: false, error: 'Equation cannot be empty' }
  }
  
  try {
    parse(equation)
    return { isValid: true }
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : 'Invalid equation syntax' 
    }
  }
}