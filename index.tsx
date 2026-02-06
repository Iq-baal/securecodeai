import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { logConfigStatus } from './utils/config';

// Log configuration status on startup so I know if something's broken
logConfigStatus();

const rootElement = document.getElementById('root');
if (!rootElement) {
  // This should never happen but JavaScript is weird
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);