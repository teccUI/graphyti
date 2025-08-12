import { useState } from 'react'
import { Box, Select, MenuItem, FormControl, Typography, Container, IconButton, Tooltip } from '@mui/material'
import { ZoomIn, ZoomOut, RotateLeft, PanTool, RestartAlt } from '@mui/icons-material'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, Text } from '@react-three/drei'
import graphList from '../graphList.json'
import GraphRenderer from './GraphRenderer'
import './App.css'

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
  const [selectedGraph, setSelectedGraph] = useState<Graph>(graphList[0] as Graph)

  const handleGraphChange = (graphId: string) => {
    const graph = graphList.find(g => g.id === graphId) as Graph
    if (graph) {
      setSelectedGraph(graph)
    }
  }

  return (
    <Container maxWidth={false} sx={{ 
      height: '100vh', 
      maxWidth: '1440px', 
      margin: '0 auto',
      padding: 0,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '16px 24px',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Typography variant="h6" sx={{ 
          fontSize: '24px',
          fontWeight: 600,
          letterSpacing: '-0.2px',
          lineHeight: 'auto',
          color: '#1a1a1a'
        }}>
          🧠 Graphyti
        </Typography>
        
        <FormControl size="small" sx={{ minWidth: 242, height: 38 }}>
          <Select
            value={selectedGraph.id}
            onChange={(e) => handleGraphChange(e.target.value)}
            displayEmpty
            sx={{ fontSize: '14px' }}
          >
            {graphList.map((graph) => (
              <MenuItem key={graph.id} value={graph.id}>
                {graph.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Main Content */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex',
        position: 'relative'
      }}>
        {/* 3D Canvas */}
        <Box sx={{ 
          flex: 1, 
          height: '100%',
          position: 'relative'
        }}>
          <Canvas camera={{ position: [5, 5, 5], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            
            <OrbitControls enablePan enableZoom enableRotate />
            
            {/* Grid and Axes */}
            <Grid args={[10, 10]} />
            
            {/* X, Y, Z Axes Labels */}
            <Text
              position={[5.5, 0, 0]}
              rotation={[0, 0, 0]}
              fontSize={0.5}
              color="red"
            >
              X
            </Text>
            <Text
              position={[0, 5.5, 0]}
              rotation={[0, 0, 0]}
              fontSize={0.5}
              color="green"
            >
              Y
            </Text>
            <Text
              position={[0, 0, 5.5]}
              rotation={[0, 0, 0]}
              fontSize={0.5}
              color="blue"
            >
              Z
            </Text>
            
            {/* Dynamic Graph Rendering */}
            <GraphRenderer graph={selectedGraph} />
          </Canvas>
        </Box>

        {/* Camera Controls */}
        <Box sx={{ 
          position: 'absolute',
          top: 16,
          right: 16,
          display: 'flex',
          gap: '4px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '8px',
          padding: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <Tooltip title="Zoom In">
            <IconButton size="small" sx={{ width: 30, height: 30 }}>
              <ZoomIn sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom Out">
            <IconButton size="small" sx={{ width: 30, height: 30 }}>
              <ZoomOut sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Rotate">
            <IconButton size="small" sx={{ width: 30, height: 30 }}>
              <RotateLeft sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Pan">
            <IconButton size="small" sx={{ width: 30, height: 30 }}>
              <PanTool sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="X-axis view">
            <IconButton size="small" sx={{ width: 30, height: 30 }}>
              <Typography sx={{ fontSize: '10px', fontWeight: 'bold' }}>X</Typography>
            </IconButton>
          </Tooltip>
          <Tooltip title="Y-axis view">
            <IconButton size="small" sx={{ width: 30, height: 30 }}>
              <Typography sx={{ fontSize: '10px', fontWeight: 'bold' }}>Y</Typography>
            </IconButton>
          </Tooltip>
          <Tooltip title="Z-axis view">
            <IconButton size="small" sx={{ width: 30, height: 30 }}>
              <Typography sx={{ fontSize: '10px', fontWeight: 'bold' }}>Z</Typography>
            </IconButton>
          </Tooltip>
          <Tooltip title="Reset View">
            <IconButton size="small" sx={{ width: 30, height: 30 }}>
              <RestartAlt sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Formula Display */}
        <Box sx={{ 
          position: 'absolute',
          bottom: 16,
          left: 16,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          maxWidth: '400px'
        }}>
          <Typography variant="h6" sx={{ fontSize: '16px', marginBottom: '8px', fontWeight: 600 }}>
            {selectedGraph.name}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '14px', fontFamily: 'monospace', marginBottom: '4px' }}>
            {selectedGraph.equation_latex}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>
            {selectedGraph.category} • {selectedGraph.level}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '12px', color: '#666' }}>
            {selectedGraph.description}
          </Typography>
        </Box>
      </Box>
    </Container>
  )
}

export default App
