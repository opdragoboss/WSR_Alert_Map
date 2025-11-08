import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { DisasterProvider } from './context/DisasterContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <DisasterProvider>
      <App />
    </DisasterProvider>
  </React.StrictMode>
);

