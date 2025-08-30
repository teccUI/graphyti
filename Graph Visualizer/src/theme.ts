import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  typography: {
    fontFamily: ['Inter', 'sans-serif'].join(','),
    h1: {
      fontFamily: 'Inter, sans-serif',
      fontSize: '20px',
      fontWeight: 700,
      lineHeight: 'normal',
      letterSpacing: '-0.2px',
      color: '#111',
    },
    body1: {
      fontSize: '14px',
      lineHeight: 1.5,
      color: '#111',
    },
    subtitle1: { // For labels
      fontSize: '12px',
      lineHeight: 1.2,
      color: '#787878',
      letterSpacing: '-0.2px',
    },
    body2: { // For formula description
      fontSize: '14px',
      lineHeight: 1.5,
      letterSpacing: '-0.2px',
      color: '#111',
    },
  },
  palette: {
    background: {
      default: '#EAEAEA', // Page background
      paper: '#FFFFFF',   // Main card background
    },
    text: {
      primary: '#111',
      secondary: '#787878',
    }
  },
  components: {
    MuiButtonGroup: {
      styleOverrides: {
        root: {
          '& .MuiButton-outlined': {
            borderColor: '#DFDFDF',
            '&:hover': {
              borderColor: '#DFDFDF',
            },
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&.MuiButton-outlined': {
            borderColor: '#DFDFDF',
            '&:hover': {
              borderColor: '#DFDFDF',
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          fontSize: '14px !important',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          lineHeight: 'auto',
          letterSpacing: '-0.2px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-input': {
            fontSize: '14px !important',
            fontFamily: 'monospace',
            lineHeight: 'auto',
          },
        },
      },
    },
  },
});