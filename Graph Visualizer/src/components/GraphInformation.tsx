import { Box, Typography } from '@mui/material'
import type { Graph } from '../utils/graphUtils'

interface GraphInformationProps {
  selectedGraph: Graph | null
}

const GraphInformation = ({ selectedGraph }: GraphInformationProps) => {
  if (!selectedGraph) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No graph selected
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      gap: '18px'
    }}>
      {/* Graph Name */}
      <Box>
        <Typography sx={{
          fontSize: '16px',
          fontWeight: 600,
          lineHeight: 'auto',
          letterSpacing: '-0.2px',
          marginBottom: '8px'
        }}>
          {selectedGraph.name}
        </Typography>
      </Box>

      {/* Formula */}
      <Box>
        <Typography sx={{
          fontSize: '14px',
          fontWeight: 600,
          lineHeight: 'auto',
          letterSpacing: '-0.2px',
          marginBottom: '8px',
          color: '#111111'
        }}>
          Formula
        </Typography>
        <Typography sx={{
          fontSize: '16px',
          fontWeight: 400,
          lineHeight: '1.4',
          letterSpacing: '-0.2px',
          fontFamily: 'monospace',
          backgroundColor: '#f8f8f8',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid #e0e0e0'
        }}>
          {selectedGraph.equation_latex}
        </Typography>
      </Box>

      {/* Category */}
      <Box>
        <Typography sx={{
          fontSize: '14px',
          fontWeight: 600,
          lineHeight: 'auto',
          letterSpacing: '-0.2px',
          marginBottom: '4px',
          color: '#111111'
        }}>
          Category
        </Typography>
        <Typography sx={{
          fontSize: '14px',
          fontWeight: 400,
          lineHeight: 'auto',
          letterSpacing: '-0.2px',
          color: '#787878'
        }}>
          {selectedGraph.category}
        </Typography>
      </Box>

      {/* Description */}
      <Box>
        <Typography sx={{
          fontSize: '14px',
          fontWeight: 600,
          lineHeight: 'auto',
          letterSpacing: '-0.2px',
          marginBottom: '4px',
          color: '#111111'
        }}>
          Description
        </Typography>
        <Typography sx={{
          fontSize: '14px',
          fontWeight: 400,
          lineHeight: '1.5',
          letterSpacing: '-0.2px',
          color: '#787878'
        }}>
          {selectedGraph.description || 'This is a mathematical function that demonstrates various properties and behaviors in 3D space. Use the controls to explore how different parameters affect the graph\'s shape and characteristics.'}
        </Typography>
      </Box>
    </Box>
  )
}

export default GraphInformation