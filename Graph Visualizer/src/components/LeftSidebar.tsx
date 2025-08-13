import React from 'react'
import { Box, Typography, Select, MenuItem, FormControl, IconButton } from '@mui/material'
import { EnvelopeSimple, LinkedinLogo, CaretDown } from 'phosphor-react'
import graphList from '../../graphList.json'
import logoGraphyti from '../assets/logo__graphyti.svg'

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

interface LeftSidebarProps {
  selectedGraph: Graph | null
  onGraphChange: (graphId: string) => void
}

export default function LeftSidebar({ selectedGraph, onGraphChange }: LeftSidebarProps) {
  // Categorize graphs into 2D and 3D and sort alphabetically
  const categorizeGraphs = () => {
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
    
    return { graphs2D, graphs3D }
  }

  const { graphs2D, graphs3D } = categorizeGraphs()

  // Auto-select first formula on component mount if none selected
  React.useEffect(() => {
    if (!selectedGraph && graphList.length > 0) {
      onGraphChange(graphList[0].id)
    }
  }, [selectedGraph, onGraphChange])
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      height: '100%'
    }}>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <img src={logoGraphyti} alt="Graphyti Logo" style={{ width: '36px', height: '36px' }} />
        <Typography variant="h1">Graphyti</Typography>
      </Box>

      {/* Description */}
      <Typography variant="body1" sx={{ marginBottom: '16px', color: '#111111', lineHeight: '150%' }}>
        A single-page web application designed and developed by{' '}
        <Typography
          component="a"
          href="https://www.linkedin.com/in/pauldesigns/"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            color: 'inherit',
            textDecoration: 'underline',
            '&:hover': {
              textDecoration: 'none'
            }
          }}
        >
          Raj Paul(@paul_designs)
        </Typography>{' '}
        to be an interactive 3D visualizer for mathematical graphs and formulas.
      </Typography>
      
      <Typography variant="body1" sx={{ marginBottom: '40px', color: '#111111', lineHeight: '150%' }}>
        The vision is to transform abstract mathematical concepts into tangible, interactive 3D visualizations with the aim to deepen a student's understanding.
      </Typography>

      {/* Formula Selector */}
      <Typography variant="subtitle1" sx={{ 
        marginBottom: '8px',
        fontSize: '14px',
        fontWeight: 500,
        lineHeight: 'auto',
        letterSpacing: '-0.2px'
      }}>
        Select formula
      </Typography>
      
      <FormControl fullWidth sx={{ marginBottom: '24px' }}>
        <Select
          value={selectedGraph?.id || ''}
          onChange={(e) => onGraphChange(e.target.value)}
          displayEmpty
          renderValue={(selected) => {
            if (!selected) {
              return <Typography sx={{ 
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: '11px',
                lineHeight: 'auto',
                letterSpacing: '-0.2px',
                color: '#787878' 
              }}>select a formula to render</Typography>
            }
            const graph = graphList.find(g => g.id === selected)
            return graph?.name
          }}
          MenuProps={{
            anchorOrigin: {
              vertical: 'bottom',
              horizontal: 'left',
            },
            transformOrigin: {
              vertical: 'top',
              horizontal: 'left',
            },
            PaperProps: {
              style: {
                maxHeight: 320,
                marginTop: '8px',
                boxShadow: '0 4px 20px rgba(201, 201, 201, 0.7)',
                width: '330px',
              },
              sx: {
                '@media (max-width: 768px)': {
                  width: '254px !important',
                  minWidth: '254px !important',
                  maxWidth: '254px !important'
                },
                '&::-webkit-scrollbar': {
                  width: '4px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#ffffff',
                  borderRadius: '4px',
                  border: 'none',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  backgroundColor: '#f0f0f0',
                },
              },
            },
          }}
          sx={{
            height: '44px',
            borderRadius: '8px',
            border: '1px solid #DFDFDF',
            fontSize: '14px',
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none'
            }
          }}
          TransitionProps={{
            timeout: 65
          }}
          IconComponent={() => (
            <Box sx={{ 
              position: 'absolute', 
              right: '12px', 
              top: '55%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none' 
            }}>
              <CaretDown size={16} color="#787878" />
            </Box>
          )}
        >
          {graphs2D.map((graph) => (
            <MenuItem 
              key={graph.id} 
              value={graph.id}
              sx={{
                marginLeft: '8px',
                borderRadius: '4px',
                fontSize: '14px',
                '&:hover': {
                  backgroundColor: '#f8f8f8'
                },
                '&.Mui-selected': {
                  backgroundColor: '#f6f6f6'
                },
                '&.Mui-selected:hover': {
                  backgroundColor: '#f6f6f6'
                }
              }}
            >
              {graph.name}
            </MenuItem>
          ))}
          {graphs3D.map((graph) => (
            <MenuItem 
              key={graph.id} 
              value={graph.id}
              sx={{
                marginLeft: '8px',
                borderRadius: '4px',
                fontSize: '14px',
                '&:hover': {
                  backgroundColor: '#f8f8f8'
                },
                '&.Mui-selected': {
                  backgroundColor: '#f6f6f6'
                },
                '&.Mui-selected:hover': {
                  backgroundColor: '#f6f6f6'
                }
              }}
            >
              {graph.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Formula Display */}
      {selectedGraph && (
        <>
          <Typography variant="subtitle1" sx={{ 
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: 500,
            lineHeight: 'auto',
            letterSpacing: '-0.2px'
          }}>
            Formula Name and Description
          </Typography>
          
          <Box sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '16px',
            border: '1px solid #DFDFDF'
          }}>
            <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
              {selectedGraph.name}
            </Typography>
            
            <Typography variant="body2" sx={{ 
              fontSize: '14px', 
              fontFamily: 'monospace', 
              backgroundColor: '#f5f5f5',
              padding: '8px',
              borderRadius: '4px',
              marginBottom: '8px'
            }}>
              {selectedGraph.equation_latex}
            </Typography>
            
            <Typography variant="caption" sx={{ 
              fontSize: '12px', 
              color: '#666',
              display: 'block',
              marginBottom: '8px'
            }}>
              {selectedGraph.category} • {selectedGraph.level}
            </Typography>
            
            <Typography variant="body2" sx={{ fontSize: '14px', color: '#333' }}>
              {selectedGraph.description}
            </Typography>
          </Box>
        </>
      )}

      {/* Social Links - pushed to bottom */}
      <Box sx={{
        marginTop: 'auto',
        display: 'flex',
        gap: '8px'
      }}>
        <IconButton 
          size="small" 
          component="a" 
          href="mailto:rajpaul075@gmail.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <EnvelopeSimple size={16} color="#111111" />
        </IconButton>
        <IconButton 
          size="small" 
          component="a" 
          href="https://www.linkedin.com/in/pauldesigns/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <LinkedinLogo size={16} color="#111111" />
        </IconButton>
      </Box>
    </Box>
  )
}