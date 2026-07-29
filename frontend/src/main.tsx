import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AppThemeProvider, initializeTheme } from './theme/ThemeProvider';
import { GlobalStyles } from './theme/GlobalStyles';

initializeTheme();

const root = document.getElementById('root');
if (!root) throw new Error('Elemento raiz não encontrado.');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <AppThemeProvider>
      <GlobalStyles />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppThemeProvider>
  </React.StrictMode>
);
