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
  const [selectedGraph, setSelectedGraph] = useState<Graph | null>(graphList[0] as Graph)
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
    
    const currentIndex = graphList.findIndex(g => g.id === selectedGraph.id)
    if (currentIndex > 0) {
      const previousGraph = graphList[currentIndex - 1]
      setSelectedGraph(previousGraph)
    } else {
      // Wrap to the last graph
      const lastGraph = graphList[graphList.length - 1]
      setSelectedGraph(lastGraph)
    }
  }

  const handleNextGraph = () => {
    if (!selectedGraph) return
    
    const currentIndex = graphList.findIndex(g => g.id === selectedGraph.id)
    if (currentIndex < graphList.length - 1) {
      const nextGraph = graphList[currentIndex + 1]
      setSelectedGraph(nextGraph)
    } else {
      // Wrap to the first graph
      const firstGraph = graphList[0]
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
