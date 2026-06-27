import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import EmbedApp from './App.js';
import CodeFirstApp from './code-first/App.js';
import './index.css';

const isCodeFirst = new URLSearchParams(window.location.search).get('mode') === 'code-first';

createRoot(document.getElementById('root')!).render(
  <StrictMode>{isCodeFirst ? <CodeFirstApp /> : <EmbedApp />}</StrictMode>,
);
