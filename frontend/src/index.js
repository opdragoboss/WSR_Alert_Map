import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import Landing from './components/landingPage/landingpage';
import { DisasterProvider } from './context/DisasterContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={
          <DisasterProvider>
            <App />
          </DisasterProvider>
        } />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

