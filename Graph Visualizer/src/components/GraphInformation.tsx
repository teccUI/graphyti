import { Box, Typography } from '@mui/material'
import type { Graph } from '../utils/graphUtils'
import type { CustomGraph } from '../utils/customEquationUtils'

interface GraphInformationProps {
  selectedGraph: Graph | null
  customGraph: CustomGraph | null
  isCustomMode: boolean
}

const GraphInformation = ({ selectedGraph, customGraph, isCustomMode }: GraphInformationProps) => {
  if (isCustomMode && customGraph) {
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
            {customGraph.name}
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
            {customGraph.equation}
          </Typography>
        </Box>

        {/* Graph Type */}
        <Box>
          <Typography sx={{
            fontSize: '14px',
            fontWeight: 600,
            lineHeight: 'auto',
            letterSpacing: '-0.2px',
            marginBottom: '4px',
            color: '#111111'
          }}>
            Graph Type
          </Typography>
          <Typography sx={{
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: 'auto',
            letterSpacing: '-0.2px',
            color: '#787878'
          }}>
            {customGraph.type}
          </Typography>
        </Box>

        {/* Variables */}
        <Box>
          <Typography sx={{
            fontSize: '14px',
            fontWeight: 600,
            lineHeight: 'auto',
            letterSpacing: '-0.2px',
            marginBottom: '4px',
            color: '#111111'
          }}>
            Variables
          </Typography>
          <Typography sx={{
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '1.5',
            letterSpacing: '-0.2px',
            color: '#787878'
          }}>
            {customGraph.variables.length > 0 
              ? customGraph.variables.map(v => v.name).join(', ')
              : 'No variables detected'
            }
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
            This is your custom equation. The graph type was automatically determined as {customGraph.type.toLowerCase()} based on the variables in your equation. Adjust the variable controls to explore different behaviors of your function.
          </Typography>
        </Box>
      </Box>
    )
  }
  
  if (!selectedGraph) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          {isCustomMode ? 'Enter a custom equation to see graph information' : 'No graph selected'}
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