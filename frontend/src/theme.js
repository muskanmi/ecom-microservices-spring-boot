import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#E4A93B', contrastText: '#122828' },
    error: { main: '#C1443C' },
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
  },
  components: {
    MuiTextField: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        root: {
          '& label': { fontFamily: '"IBM Plex Mono", monospace', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase' },
          '& .MuiOutlinedInput-root': {
            borderRadius: 3,
            backgroundColor: '#fff',
            '& fieldset': { borderColor: 'rgba(31,36,33,0.18)' },
            '&:hover fieldset': { borderColor: 'rgba(31,36,33,0.32)' },
            '&.Mui-focused fieldset': { borderColor: '#E4A93B', borderWidth: 2 },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 3,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: 15,
          padding: '10px 0',
          boxShadow: 'none',
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: 12,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          borderRadius: 3,
          border: '1.5px solid rgba(31,36,33,0.18)',
          color: '#6B6156',
          flex: 1,
          '&.Mui-selected': {
            backgroundColor: 'rgba(228,169,59,0.12)',
            borderColor: '#E4A93B',
            color: '#1F2421',
            fontWeight: 600,
          },
        },
      },
    },
  },
});

export default theme;