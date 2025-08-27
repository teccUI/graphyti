import { useState, useEffect } from 'react'
import { Box } from '@mui/material'
import LeftSidebar from './components/leftsidebar'
import RightCanvas from './components/RightCanvas'
import GraphControls from './components/GraphControls'
import { getOrderedGraphList, getGraphById, getAllCategories, getGraphsByCategory } from './utils/graphUtils'
import type { Graph } from './utils/graphUtils'
import graphControls from '../graphControls.json'

function App() {
  const orderedGraphs = getOrderedGraphList()
  const allCategories = getAllCategories().sort()
  
  // Initialize with the first graph from the first category to ensure consistency
  const getInitialGraph = (): Graph | null => {
    if (allCategories.length > 0) {
      const firstCategory = allCategories[0]
      const firstCategoryGraphs = getGraphsByCategory(firstCategory).sort((a, b) => a.name.localeCompare(b.name))
      return firstCategoryGraphs.length > 0 ? firstCategoryGraphs[0] : null
    }
    return orderedGraphs[0] || null
  }
  
  const [selectedGraph, setSelectedGraph] = useState<Graph | null>(getInitialGraph())
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
    const graph = getGraphById(graphId)
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
        maxWidth: { xs: '100%', md: '100%', lg: '1698px' },
        minHeight: { xs: 'auto', md: 'auto' },
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: { xs: '16px', md: '60px' },
        width: '100%',
        boxSizing: 'border-box',
        alignItems: 'stretch'
      }}>
        <Box sx={{
          backgroundColor: 'background.paper',
          borderRadius: { xs: '16px', md: '20px', lg: '24px' },
          padding: { xs: '16px', md: '24px', lg: '40px' },
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: '16px', md: '24px', lg: '40px' },
          flexGrow: 1,
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
    </Box>
  )
}

export default App
