import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './styles/index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#172033',
            color: '#FFFFFF',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#2677FF', secondary: '#FFFFFF' },
          },
          error: {
            iconTheme: { primary: '#F044A5', secondary: '#FFFFFF' },
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>
);
