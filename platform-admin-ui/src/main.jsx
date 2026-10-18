import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import App from "./App";
import "./index.css";

const theme = createTheme({
  palette: {
    primary: {
      main: "#233636",
    },
    background: {
      default: "#FFFCF4",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#2D3A3A",
      secondary: "#77796F",
    },
  },
  typography: {
    fontFamily: '"DM Sans", sans-serif',
  },
  shape: {
    borderRadius: 4,
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
