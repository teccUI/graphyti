import { Box, Typography, Slider } from '@mui/material'

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
}

const GraphControls = ({ controls, values, onValueChange }: GraphControlsProps) => {
  return (
    <Box sx={{
      backgroundColor: 'white',
      borderRadius: '24px',
      padding: '32px 36px',
      height: '752px',
      width: '100%'
    }}>
      <Typography variant="h1">Graph Controls</Typography>
      <Typography variant="body1" sx={{ marginTop: '16px' }}>
        Dynamically alter the graphs by adjusting the variables provided in the controls. By modifying parameters such as the range, scale, or coefficients, students can observe real-time changes in the 3D visualizations.
      </Typography>
      <Typography sx={{ 
        marginTop: '100px',
        fontSize: '16px',
        fontWeight: 600,
        lineHeight: 'auto',
        letterSpacing: '-0.2px'
      }}>
        Variables
      </Typography>
      
      {controls.map((control) => (
        <Box key={control.name} sx={{ marginTop: '24px' }}>
          <Typography sx={{
            fontFamily: 'Inter',
            fontSize: '14px',
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
  )
}

export default GraphControls