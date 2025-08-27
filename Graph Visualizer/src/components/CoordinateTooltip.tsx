import { Box, Typography } from '@mui/material'
import { convertSceneToMathematicalCoordinates, formatCoordinatesForDisplay } from '../utils/coordinateConversion'

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

interface CoordinateTooltipProps {
  visible: boolean
  coordinates: {
    x: number
    y: number
    z: number
  } | null
  mousePosition: {
    x: number
    y: number
  }
  graph: Graph | null
  controlValues: Record<string, number>
}

const CoordinateTooltip = ({ visible, coordinates, mousePosition, graph, controlValues }: CoordinateTooltipProps) => {
  if (!visible || !coordinates || !graph) {
    return null
  }

  // Convert scene coordinates to mathematical coordinates
  const mathCoordinates = convertSceneToMathematicalCoordinates(coordinates, graph, controlValues)
  const displayText = formatCoordinatesForDisplay(mathCoordinates, graph)

  return (
    <Box
      sx={{
        position: 'fixed',
        left: mousePosition.x + 15,
        top: mousePosition.y - 10,
        backgroundColor: '#ffffff',
        border: '1px solid #E0E0E0',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        color: '#111111',
        fontSize: '12px',
        padding: '6px 12px',
        pointerEvents: 'none',
        zIndex: 1000,
        transform: mousePosition.x > window.innerWidth / 2 ? 'translateX(-100%)' : 'none',
        whiteSpace: 'nowrap'
      }}
    >
      <Typography sx={{
        fontSize: '12px',
        fontWeight: 500,
        lineHeight: '1.2',
        margin: 0
      }}>
        {displayText}
      </Typography>
    </Box>
  )
}

export default CoordinateTooltip