// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import App from './App.jsx';
import './index.css';

// 👇 Si el archivo está en src/, el import es relativo dentro de src
import awsExports from './aws-exports.js';

Amplify.configure({
  ...awsExports,
  oauth: {
    ...(awsExports.oauth || {}),
    domain: import.meta.env.VITE_COGNITO_DOMAIN.replace(/^https?:\/\//, ''),
    clientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
    redirectSignIn: import.meta.env.VITE_REDIRECT_URI,
    redirectSignOut: import.meta.env.VITE_REDIRECT_URI,
    scope: ['email', 'openid', 'phone', 'profile'],
    responseType: 'code',
  },
  Auth: {
    ...(awsExports.Auth || {}),
    storage: window.localStorage,
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
