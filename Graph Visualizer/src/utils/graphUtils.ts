import graphListData from '../../graphList.json'

interface BaseGraph {
  id: string
  name: string
  level: string
  type: string
  equation_latex: string
  description: string
}

export interface Graph extends BaseGraph {
  category: string
  subject: string
}

export interface GraphCategory {
  [subject: string]: BaseGraph[]
}

export interface GraphData {
  [category: string]: GraphCategory
}

const typedGraphData = graphListData as GraphData

export const getAllGraphs = (): Graph[] => {
  const graphs: Graph[] = []
  
  Object.entries(typedGraphData).forEach(([category, subjects]) => {
    Object.entries(subjects).forEach(([subject, graphArray]) => {
      graphArray.forEach((graph) => {
        graphs.push({
          ...graph,
          category,
          subject
        })
      })
    })
  })
  
  return graphs
}

export const getGraphById = (id: string): Graph | undefined => {
  const allGraphs = getAllGraphs()
  return allGraphs.find(graph => graph.id === id)
}

export const getGraphsByCategory = (category: string): Graph[] => {
  const categoryData = typedGraphData[category]
  if (!categoryData) return []
  
  const graphs: Graph[] = []
  Object.entries(categoryData).forEach(([subject, graphArray]) => {
    graphArray.forEach((graph) => {
      graphs.push({
        ...graph,
        category,
        subject
      })
    })
  })
  
  return graphs
}

export const getGraphsBySubject = (subject: string): Graph[] => {
  const graphs: Graph[] = []
  
  Object.entries(typedGraphData).forEach(([category, subjects]) => {
    if (subjects[subject]) {
      subjects[subject].forEach((graph) => {
        graphs.push({
          ...graph,
          category,
          subject
        })
      })
    }
  })
  
  return graphs
}

export const getCategorizeGraphs = () => {
  const allGraphs = getAllGraphs()
  const conceptually2DCurves = ['Viviani\'s Curve', 'Trefoil Knot']
  
  const is2D = (graph: Graph) => 
    graph.type.includes('2D Function') || 
    graph.type.includes('2D Parametric') || 
    graph.type.includes('2D Polar') ||
    (graph.type === '3D Parametric Curve' && conceptually2DCurves.includes(graph.name))
    
  const is3D = (graph: Graph) => 
    graph.type.includes('3D Surface') || 
    graph.type === '2D Function/3D Surface' ||
    (graph.type === '3D Parametric Curve' && !conceptually2DCurves.includes(graph.name))
  
  const graphs2D = allGraphs.filter(graph => is2D(graph)).sort((a, b) => a.name.localeCompare(b.name))
  const graphs3D = allGraphs.filter(graph => is3D(graph)).sort((a, b) => a.name.localeCompare(b.name))
  
  return { graphs2D, graphs3D }
}

export const getOrderedGraphList = (): Graph[] => {
  const { graphs2D, graphs3D } = getCategorizeGraphs()
  return [...graphs2D, ...graphs3D]
}

export const getAllCategories = (): string[] => {
  return Object.keys(typedGraphData)
}

export const getAllSubjects = (): string[] => {
  const subjects = new Set<string>()
  
  Object.values(typedGraphData).forEach((categoryData) => {
    Object.keys(categoryData).forEach((subject) => {
      subjects.add(subject)
    })
  })
  
  return Array.from(subjects)
}