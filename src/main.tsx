import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './app/App';
import './styles/global.css';
import { ThemeProvider } from './app/providers/ThemeProvider';

if (import.meta.env.DEV) {
  void import('./dev/mocks/adapters/payments.mock');
}

const rootElement = document.getElementById('root');

if (!rootElement) throw new Error('Root element missing');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
