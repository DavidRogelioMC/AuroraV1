// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// ⚙️ Configuración de Amplify (segura si faltan variables)
let amplifyConfigured = false;
try {
  // Import diferido para no romper si algo falla
  const { Amplify } = await import('aws-amplify');

  const REGION      = import.meta.env.VITE_AWS_REGION || 'us-east-1';
  const USER_POOL_ID= import.meta.env.VITE_COGNITO_USER_POOL_ID;
  const CLIENT_ID   = import.meta.env.VITE_COGNITO_CLIENT_ID;
  const DOMAIN      = (import.meta.env.VITE_COGNITO_DOMAIN || '')
                        .replace(/^https?:\/\//, '')
                        .replace(/\/$/, '');
  const REDIRECT    = import.meta.env.VITE_REDIRECT_URI_TESTING || (window.location.origin + '/');

  const hasAllAuthEnv = USER_POOL_ID && CLIENT_ID && DOMAIN && REDIRECT;

  if (hasAllAuthEnv) {
    Amplify.configure({
      Auth: {
        region: REGION,
        userPoolId: USER_POOL_ID,
        userPoolWebClientId: CLIENT_ID,
        oauth: {
          domain: DOMAIN,                // sin https://
          scope: ['email', 'openid', 'profile'],
          redirectSignIn: REDIRECT,      // debe coincidir EXACTO con Cognito
          redirectSignOut: REDIRECT,
          responseType: 'token',         // usa 'code' si tu App Client tiene PKCE
        },
        storage: window.localStorage,
      },
    });
    amplifyConfigured = true;
  } else {
    // No hay variables: no configuramos Auth para evitar errores ruidosos
    console.info('[Amplify] Auth no configurado: faltan variables VITE_. La app continuará sin Cognito.');
  }
} catch (e) {
  // Si aws-amplify no está o algo falla, seguimos sin Auth.
  console.info('[Amplify] No se pudo inicializar (continuando sin Auth):', e?.message || e);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


