// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import App from './App.jsx';
import './index.css';

// Si ya tienes aws-exports puedes ignorarlo; aquí configuramos directo con VITE_*
Amplify.configure({
  Auth: {
    region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
    userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,        // ej: us-east-1_XXXXXXXXX
    userPoolWebClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,  // App client ID
    oauth: {
      domain: (import.meta.env.VITE_COGNITO_DOMAIN || '')
        .replace(/^https?:\/\//, '')
        .replace(/\/$/, ''), // sin https:// ni / final
      scope: ['email', 'openid', 'profile'],
      redirectSignIn: import.meta.env.VITE_REDIRECT_URI,   // debe coincidir EXACTO con Cognito
      redirectSignOut: import.meta.env.VITE_REDIRECT_URI,  // lo mismo
      responseType: 'token', // usa 'code' si tienes PKCE habilitado en el App client
    },
    storage: window.localStorage,
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


