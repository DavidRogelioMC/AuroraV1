// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import App from './App.jsx';
import './index.css';

// --- Config Amplify sólo con variables VITE_ ---
const REGION = import.meta.env.VITE_AWS_REGION || 'us-east-1';
const USER_POOL_ID = import.meta.env.VITE_COGNITO_USER_POOL_ID || '';
const CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID || '';
const DOMAIN_RAW = (import.meta.env.VITE_COGNITO_DOMAIN || '');
const REDIRECT = (import.meta.env.VITE_REDIRECT_URI_TESTING || (window.location.origin + '/'));

const DOMAIN = DOMAIN_RAW.replace(/^https?:\/\//, '').replace(/\/$/, '');

if (!USER_POOL_ID || !CLIENT_ID || !DOMAIN || !REDIRECT) {
  // No usamos top-level await ni imports dinámicos. Sólo warn en consola.
  // La app sigue montando (útil para pantallas públicas sin login).
  console.warn('[Amplify] Faltan variables VITE_ requeridas:', {
    VITE_AWS_REGION: REGION,
    VITE_COGNITO_USER_POOL_ID: USER_POOL_ID,
    VITE_COGNITO_CLIENT_ID: CLIENT_ID,
    VITE_COGNITO_DOMAIN: DOMAIN,
    VITE_REDIRECT_URI_TESTING: REDIRECT,
  });
} else {
  Amplify.configure({
    Auth: {
      region: REGION,
      userPoolId: USER_POOL_ID,
      userPoolWebClientId: CLIENT_ID,
      oauth: {
        domain: DOMAIN,                     // sin https://
        scope: ['email', 'openid', 'profile'],
        redirectSignIn: REDIRECT,           // debe coincidir EXACTO con Cognito
        redirectSignOut: REDIRECT,
        responseType: 'token',              // usa 'code' si tu app client tiene PKCE
      },
      storage: window.localStorage,
    },
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


