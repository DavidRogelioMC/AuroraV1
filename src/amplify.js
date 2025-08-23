// src/amplify.js
import { Amplify } from 'aws-amplify';

const cfg = {
  region: import.meta.env.VITE_AWS_REGION,
  userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  userPoolWebClientId: import.meta.env.VITE_COGNITO_APP_CLIENT_ID,
  oauth: {
    domain: (import.meta.env.VITE_COGNITO_DOMAIN || '').replace(/^https?:\/\//, ''),
    scope: ['openid', 'email', 'profile'],
    redirectSignIn: import.meta.env.VITE_REDIRECT_SIGN_IN || `${window.location.origin}/`,
    redirectSignOut: import.meta.env.VITE_REDIRECT_SIGN_OUT || `${window.location.origin}/`,
    responseType: 'code',
  },
};

const missing = Object.entries({
  VITE_AWS_REGION: cfg.region,
  VITE_COGNITO_USER_POOL_ID: cfg.userPoolId,
  VITE_COGNITO_APP_CLIENT_ID: cfg.userPoolWebClientId,
  VITE_COGNITO_DOMAIN: cfg.oauth.domain,
}).filter(([, v]) => !v).map(([k]) => k);

if (missing.length) {
  // No detengas la app; solo avisa y permite el fallback manual del botón
  console.error('[Amplify] Faltan variables VITE_ requeridas: ', missing);
} else {
  Amplify.configure({ Auth: cfg });
}

export default Amplify;
