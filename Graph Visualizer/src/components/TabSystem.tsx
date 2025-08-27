import { Box, Typography } from '@mui/material'
import { useState } from 'react'

interface TabSystemProps {
  children: React.ReactNode[]
  tabLabels: string[]
}

const TabSystem = ({ children, tabLabels }: TabSystemProps) => {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <Box sx={{ width: '100%' }}>
      {/* Tab Container */}
      <Box sx={{
        width: '347px',
        height: '40px',
        backgroundColor: '#E7E7E7',
        borderRadius: '14px',
        display: 'flex',
        alignItems: 'center',
        padding: '3px',
        marginBottom: '16px'
      }}>
        {tabLabels.map((label, index) => (
          <Box
            key={label}
            onClick={() => setActiveTab(index)}
            sx={{
              width: '170px',
              height: '34px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backgroundColor: activeTab === index ? '#FFFFFF' : 'transparent',
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <Typography sx={{
              fontSize: '14px',
              fontWeight: 500,
              lineHeight: 'auto',
              letterSpacing: '-0.2px',
              color: activeTab === index ? '#111111' : '#8C8C8C',
              transition: 'color 0.2s ease-in-out'
            }}>
              {label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Tab Content */}
      <Box>
        {children[activeTab]}
      </Box>
    </Box>
  )
}

export default TabSystem