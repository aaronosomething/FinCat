import React, { useEffect } from "react";
import ReactDOM from 'react-dom/client';
import App from "./App";
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from './assets/theme';
import { useState } from 'react';
import getRouter from './router'

const Root = () => {
  const [mode, setMode] = useState('light');
  const theme = getTheme(mode);
  const router = getRouter(App, mode, setMode);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    console.log(savedTheme);
    if (savedTheme) {
      setMode(savedTheme);
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router}>
        {/* <App setMode={setMode} mode={mode} /> */}
      </RouterProvider>
    </ThemeProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);