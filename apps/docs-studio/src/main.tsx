import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.js';
import './studio.css';
import './demo-components.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
