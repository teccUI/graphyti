import { Box, Typography, Slider } from '@mui/material'
import TabSystem from './TabSystem'
import GraphInformation from './GraphInformation'
import type { Graph } from '../utils/graphUtils'

interface Control {
  name: string
  label: string
  defaultValue: number
  min: number
  max: number
  step: number
}

interface GraphControlsProps {
  controls: Control[]
  values: Record<string, number>
  onValueChange: (controlName: string, value: number) => void
  selectedGraph: Graph | null
}

const GraphControls = ({ controls, values, onValueChange, selectedGraph }: GraphControlsProps) => {
  const shouldEnableScrolling = controls.length > 7
  
  const scrollableStyles = {
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '480px',
    overflowY: 'auto',
    paddingRight: '8px',
    marginTop: '24px',
    '&::-webkit-scrollbar': {
      width: '4px',
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: '#f5f5f5',
      borderRadius: '99px',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#dfdfdf',
      borderRadius: '99px',
      // minHeight: '100px',
      '&:hover': {
        backgroundColor: '#bfbfbf',
      },
    },
  }
  
  const normalStyles = {
    display: 'flex',
    flexDirection: 'column',
    marginTop: '24px',
  }
  // Graph Controls Tab Content
  const graphControlsContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Typography variant="body1" sx={{ marginBottom: '12px' }}>
        Dynamically alter the graphs by adjusting the variables provided in the controls. By modifying parameters such as the range, scale, or coefficients, students can observe real-time changes in the 3D visualizations.
      </Typography>
      <Typography sx={{ 
        marginTop: '36px',
        fontSize: '16px',
        fontWeight: 600,
        lineHeight: 'auto',
        letterSpacing: '-0.2px'
      }}>
        Variable Controls
      </Typography>

      {/* Scrollable container for controls */}
      <Box sx={shouldEnableScrolling ? scrollableStyles : normalStyles}>
        {controls.map((control, index) => (
        <Box key={control.name} sx={{ marginTop: index === 0 ? '0px' : '24px' }}>
          <Typography sx={{
            fontFamily: 'Inter',
            fontSize: '12px',
            fontWeight: 500,
            lineHeight: 'auto',
            letterSpacing: '-0.2px',
            marginBottom: '8px'
          }}>
            {control.label}
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            width: '100%'
          }}>
            <Typography sx={{
              fontFamily: 'Inter',
              fontSize: '11px',
              fontWeight: 400,
              lineHeight: 'auto',
              letterSpacing: '-0.2px',
              color: '#787878'
            }}>
              {control.min}
            </Typography>
            
            <Box sx={{ flexGrow: 1, maxWidth: '286px' }}>
              <Slider
                value={values[control.name] || control.defaultValue}
                min={control.min}
                max={control.max}
                step={control.step}
                onChange={(_, newValue) => onValueChange(control.name, newValue as number)}
                sx={{
                  height: '6px',
                  padding: 0,
                  '& .MuiSlider-track': {
                    backgroundColor: '#111111',
                    border: 'none',
                    height: '6px'
                  },
                  '& .MuiSlider-rail': {
                    backgroundColor: '#dfdfdf',
                    border: '1px solid #dfdfdf',
                    height: '6px'
                  },
                  '& .MuiSlider-thumb': {
                    width: 0,
                    height: 0,
                    '&:hover': {
                      boxShadow: 'none'
                    },
                    '&.Mui-focusVisible': {
                      boxShadow: 'none'
                    }
                  }
                }}
              />
            </Box>
            
            <Typography sx={{
              fontFamily: 'Inter',
              fontSize: '11px',
              fontWeight: 400,
              lineHeight: 'auto',
              letterSpacing: '-0.2px',
              color: '#787878'
            }}>
              {control.max}
            </Typography>
          </Box>
        </Box>
        ))}
      </Box>
    </Box>
  )

  return (
    <Box sx={{
      backgroundColor: 'white',
      borderRadius: '24px',
      padding: '32px 36px',
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <TabSystem 
        tabLabels={['Graph Controls', 'Information']}
      >
        {graphControlsContent}
        <GraphInformation selectedGraph={selectedGraph} />
      </TabSystem>
    </Box>
  )
}

export default GraphControls