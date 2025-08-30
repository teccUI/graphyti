// React is not used directly in this file, removed unused import
import { Box, Typography, Select, MenuItem, FormControl, IconButton, TextField } from '@mui/material'
import { EnvelopeSimple, LinkedinLogo, CaretDown } from 'phosphor-react'
import { getAllCategories, getGraphsByCategory, getGraphById } from '../utils/graphUtils'
import type { Graph } from '../utils/graphUtils'
import logoGraphyti from '../assets/logo__graphyti.svg'

interface LeftSidebarProps {
  selectedGraph: Graph | null
  selectedCategory: string
  onGraphChange: (graphId: string) => void
  onCategoryChange: (categoryName: string) => void
  customEquation: string
  onCustomEquationChange: (equation: string) => void
  isCustomMode: boolean
}

export default function LeftSidebar({ selectedGraph, selectedCategory, onGraphChange, onCategoryChange, customEquation, onCustomEquationChange, isCustomMode }: LeftSidebarProps) {
  const allCategories = getAllCategories().sort()
  const categoryGraphs = selectedCategory ? getGraphsByCategory(selectedCategory).sort((a, b) => a.name.localeCompare(b.name)) : []

  const handleCategoryChange = (categoryName: string) => {
    onCategoryChange(categoryName)
  }
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

      {/* Category Selector */}
      <Typography variant="subtitle1" sx={{ 
        marginBottom: '8px',
        fontSize: '14px',
        fontWeight: 500,
        lineHeight: 'auto',
        letterSpacing: '-0.2px'
      }}>
        Select category
      </Typography>
      
      <FormControl fullWidth sx={{ marginBottom: '24px' }}>
        <Select
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
          displayEmpty
          disabled={isCustomMode}
          renderValue={(selected) => {
            if (!selected) {
              return <Typography sx={{ 
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: '11px',
                lineHeight: 'auto',
                letterSpacing: '-0.2px',
                color: isCustomMode ? '#666666' : '#787878' 
              }}>select a category first</Typography>
            }
            return selected
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
            },
            '&.Mui-disabled': {
              backgroundColor: '#f8f8f8',
              '& .MuiSelect-select': {
                color: '#666666'
              }
            }
          }}
          IconComponent={() => (
            <Box sx={{ 
              position: 'absolute', 
              right: '12px', 
              top: '55%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none' 
            }}>
              <CaretDown size={16} color={isCustomMode ? "#666666" : "#787878"} />
            </Box>
          )}
        >
          {allCategories.map((category) => (
            <MenuItem 
              key={category} 
              value={category}
              sx={{
                marginLeft: '7px',
                marginRight: '2px',
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
              {category}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

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
          value={selectedGraph && categoryGraphs.some(g => g.id === selectedGraph.id) ? selectedGraph.id : ''}
          onChange={(e) => onGraphChange(e.target.value)}
          displayEmpty
          disabled={!selectedCategory || isCustomMode}
          renderValue={(selected) => {
            if (!selected) {
              if (!selectedCategory) {
                return <Typography sx={{ 
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '11px',
                  lineHeight: 'auto',
                  letterSpacing: '-0.2px',
                  color: isCustomMode ? '#666666' : '#787878' 
                }}>select a category first</Typography>
              }
              return <Typography sx={{ 
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: '11px',
                lineHeight: 'auto',
                letterSpacing: '-0.2px',
                color: isCustomMode ? '#666666' : '#787878' 
              }}>select a formula to render</Typography>
            }
            const graph = getGraphById(selected)
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
            },
            '&.Mui-disabled': {
              backgroundColor: '#f8f8f8',
              '& .MuiSelect-select': {
                color: '#666666'
              }
            }
          }}
          IconComponent={() => (
            <Box sx={{ 
              position: 'absolute', 
              right: '12px', 
              top: '55%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none' 
            }}>
              <CaretDown size={16} color={(selectedCategory && !isCustomMode) ? "#787878" : "#666666"} />
            </Box>
          )}
        >
          {categoryGraphs.map((graph) => (
            <MenuItem 
              key={graph.id} 
              value={graph.id}
              sx={{
                marginLeft: '7px',
                marginRight: '5px',
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

      {/* Custom Equation Input */}
      <Typography variant="subtitle1" sx={{ 
        marginBottom: '8px',
        fontSize: '14px',
        fontWeight: 500,
        lineHeight: 'auto',
        letterSpacing: '-0.2px'
      }}>
        Custom equation
      </Typography>
      
      <TextField
        value={customEquation}
        onChange={(e) => onCustomEquationChange(e.target.value)}
        placeholder="Enter your equation (e.g., x^2 + y^2, sin(x)*cos(y))"
        multiline
        maxRows={4}
        fullWidth
        sx={{
          marginBottom: '24px',
          '& .MuiOutlinedInput-root': {
            minHeight: '44px',
            maxHeight: '200px',
            borderRadius: '8px',
            border: '1px solid #DFDFDF',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            '& fieldset': {
              border: 'none'
            },
            '&:hover fieldset': {
              border: 'none'
            },
            '&.Mui-focused fieldset': {
              border: 'none'
            }
          },
          '& .MuiInputBase-input': {
           fontFamily: 'monospace',
            fontSize: '14px',
            '&::placeholder': {
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              color: '#787878',
              opacity: 1
            },
            '&:placeholder-shown': {
              padding: '0px'
            }
          }
        }}
      />

      {/* Formula Display
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
      )} */}

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