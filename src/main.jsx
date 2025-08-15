// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import App from './App.jsx';
import './index.css';

// ⚠️ Config explícito SOLO con VITE_*. No usamos aws-exports.js.
const REGION = import.meta.env.VITE_AWS_REGION || 'us-east-1';
const USER_POOL_ID = import.meta.env.VITE_COGNITO_USER_POOL_ID;      // ej: us-east-1_AbCdEf123
const CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID;            // app client id
const DOMAIN = (import.meta.env.VITE_COGNITO_DOMAIN || '')           // ej: https://xxx.auth.us-east-1.amazoncognito.com
  .replace(/^https?:\/\//, '')
  .replace(/\/$/, '');
const REDIRECT = import.meta.env.VITE_REDIRECT_URI_TESTING           // ej: http://localhost:5173/ o tu Amplify URL
  || window.location.origin + '/';

// 🔒 Si falta algo crítico, lanza un error visible en consola
if (!USER_POOL_ID || !CLIENT_ID || !DOMAIN || !REDIRECT) {
  console.error('[Amplify] Faltan variables VITE_ requeridas:', {
    VITE_AWS_REGION: REGION,
    VITE_COGNITO_USER_POOL_ID: USER_POOL_ID,
    VITE_COGNITO_CLIENT_ID: CLIENT_ID,
    VITE_COGNITO_DOMAIN: DOMAIN,
    VITE_REDIRECT_URI_TESTING: REDIRECT,
  });
}

Amplify.configure({
  Auth: {
    region: REGION,
    userPoolId: USER_POOL_ID,
    userPoolWebClientId: CLIENT_ID,
    oauth: {
      domain: DOMAIN,                 // sin https://
      scope: ['email', 'openid', 'profile'],
      redirectSignIn: REDIRECT,       // DEBE coincidir EXACTO con Cognito (incluye / final si así está)
      redirectSignOut: REDIRECT,
      responseType: 'token',          // usa 'code' si tu App Client tiene PKCE habilitado
    },
    storage: window.localStorage,
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);



