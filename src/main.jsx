// main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import App from './App.jsx';
import './index.css';

import awsExports from './aws-exports';

Amplify.configure({
  ...awsExports,
  Auth: {
    ...awsExports.Auth,
    storage: window.localStorage, // (ya lo tienes, aquí queda dentro de Auth)
    oauth: {
      ...(awsExports.Auth?.oauth || {}),
      // Quita el protocolo del dominio
      domain: import.meta.env.VITE_COGNITO_DOMAIN.replace(/^https?:\/\//, ''),

      // 👇 Fuerza el App Client ID correcto
      clientId: import.meta.env.VITE_COGNITO_CLIENT_ID,

      // URLs registradas en Cognito
      redirectSignIn: import.meta.env.VITE_REDIRECT_URI,
      redirectSignOut: import.meta.env.VITE_REDIRECT_URI,

      // Ámbitos y tipo de respuesta
      scope: ['email', 'openid', 'phone', 'profile'],
      responseType: 'code', // si sigues usando flujo implícito, cambia a 'token'/'id_token token'
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
