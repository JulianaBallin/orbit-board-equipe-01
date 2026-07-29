import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles.css';
import { AppThemeProvider, initializeTheme } from './theme/ThemeProvider';

initializeTheme();

const root = document.getElementById('root');
if (!root) throw new Error('Elemento raiz não encontrado.');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <AppThemeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppThemeProvider>
  </React.StrictMode>
);
