import { useState, useEffect } from 'react'
import { Box } from '@mui/material'
import LeftSidebar from './components/LeftSidebar'
import RightCanvas from './components/RightCanvas'
import GraphControls from './components/GraphControls'
import graphList from '../graphList.json'
import graphControls from '../graphControls.json'

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

function App() {
  // Create unified ordered list that matches dropdown display order
  const getOrderedGraphList = (): Graph[] => {
    const conceptually2DCurves = ['Viviani\'s Curve', 'Trefoil Knot'] // 3D parametric curves that are conceptually 2D-like
    
    const is2D = (graph: Graph) => 
      graph.type.includes('2D Function') || 
      graph.type.includes('2D Parametric') || 
      graph.type.includes('2D Polar') ||
      (graph.type === '3D Parametric Curve' && conceptually2DCurves.includes(graph.name))
      
    const is3D = (graph: Graph) => 
      graph.type.includes('3D Surface') || 
      graph.type === '2D Function/3D Surface' ||
      (graph.type === '3D Parametric Curve' && !conceptually2DCurves.includes(graph.name))
    
    const graphs2D = graphList.filter(graph => is2D(graph)).sort((a, b) => a.name.localeCompare(b.name))
    const graphs3D = graphList.filter(graph => is3D(graph)).sort((a, b) => a.name.localeCompare(b.name))
    
    return [...graphs2D, ...graphs3D]
  }

  const orderedGraphs = getOrderedGraphList()
  
  const [selectedGraph, setSelectedGraph] = useState<Graph | null>(orderedGraphs[0] as Graph)
  const [controlValues, setControlValues] = useState<Record<string, number>>({})

  useEffect(() => {
    if (selectedGraph) {
      const graphControlData = graphControls.find(gc => gc.id === selectedGraph.id)
      if (graphControlData) {
        const defaultValues: Record<string, number> = {}
        graphControlData.controls.forEach(control => {
          defaultValues[control.name] = control.defaultValue
        })
        setControlValues(defaultValues)
      }
    }
  }, [selectedGraph])

  const handleGraphChange = (graphId: string) => {
    const graph = graphList.find(g => g.id === graphId) as Graph
    if (graph) {
      setSelectedGraph(graph)
    }
  }

  const handleControlValueChange = (controlName: string, value: number) => {
    setControlValues(prev => ({
      ...prev,
      [controlName]: value
    }))
  }

  const handlePreviousGraph = () => {
    if (!selectedGraph) return
    
    const currentIndex = orderedGraphs.findIndex(g => g.id === selectedGraph.id)
    if (currentIndex > 0) {
      const previousGraph = orderedGraphs[currentIndex - 1]
      setSelectedGraph(previousGraph)
    } else {
      // Wrap to the last graph
      const lastGraph = orderedGraphs[orderedGraphs.length - 1]
      setSelectedGraph(lastGraph)
    }
  }

  const handleNextGraph = () => {
    if (!selectedGraph) return
    
    const currentIndex = orderedGraphs.findIndex(g => g.id === selectedGraph.id)
    if (currentIndex < orderedGraphs.length - 1) {
      const nextGraph = orderedGraphs[currentIndex + 1]
      setSelectedGraph(nextGraph)
    } else {
      // Wrap to the first graph
      const firstGraph = orderedGraphs[0]
      setSelectedGraph(firstGraph)
    }
  }

  return (
    <Box sx={{
      width: '100vw',
      minHeight: '100vh',
      backgroundColor: 'background.default',
      display: 'flex',
      alignItems: { xs: 'flex-start', md: 'center' },
      justifyContent: 'center',
      padding: { xs: '16px', md: '24px', lg: '40px' },
      boxSizing: 'border-box'
    }}>
      <Box sx={{
        maxWidth: { xs: '100%', md: '100%', lg: '1280px' },
        minHeight: { xs: 'auto', md: '720px' },
        backgroundColor: 'background.paper',
        borderRadius: { xs: '16px', md: '20px', lg: '24px' },
        padding: { xs: '16px', md: '24px', lg: '40px' },
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: { xs: '16px', md: '24px', lg: '40px' },
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <Box sx={{ 
          width: { xs: '100%', md: '280px', lg: '332px' }, 
          flexShrink: 0,
          minHeight: { xs: 'auto', md: 'unset' }
        }}>
          <LeftSidebar 
            selectedGraph={selectedGraph}
            onGraphChange={handleGraphChange}
          />
        </Box>
        
        <Box sx={{ 
          flexGrow: 1,
          minHeight: { xs: '500px', md: 'unset' },
          height: { xs: '70vh', md: 'auto' }
        }}>
          <RightCanvas 
            selectedGraph={selectedGraph} 
            onPreviousGraph={handlePreviousGraph}
            onNextGraph={handleNextGraph}
            controlValues={controlValues}
          />
        </Box>
      </Box>

      <Box sx={{
        width: '418px',
        maxWidth: '418px',
        marginLeft: '60px',
        display: { xs: 'none', md: 'block' },
        flexShrink: 0
      }}>
        <GraphControls 
          controls={selectedGraph ? graphControls.find(gc => gc.id === selectedGraph.id)?.controls || [] : []}
          values={controlValues}
          onValueChange={handleControlValueChange}
        />
      </Box>
    </Box>
  )
}

export default App
