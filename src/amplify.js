// src/amplify.js
import { Amplify } from 'aws-amplify';

// TUS variables actuales (no cambies nombres en el panel):
const domainRaw  = import.meta.env.VITE_COGNITO_DOMAIN || '';          // puede venir con https://
const clientId   = import.meta.env.VITE_COGNITO_CLIENT_ID || '';       // tu nombre actual
const userPoolId =
  import.meta.env.VITE_COGNITO_USER_POOL_ID ||                         // si la tienes, mejor
  import.meta.env.VITE_USER_POOL_ID ||                                 // alternos por si existen
  '';

// Deriva región del dominio (foo.auth.us-east-1.amazoncognito.com → us-east-1)
const derivedRegion = (() => {
  const m = String(domainRaw).match(/auth\.([a-z0-9-]+)\.amazoncognito\.com/i);
  return m ? m[1] : undefined;
})();
const region = import.meta.env.VITE_AWS_REGION || derivedRegion || 'us-east-1';

// Redirects (usa testing si hostname incluye "test")
const redirectSignIn =
  (location.hostname.includes('test') && import.meta.env.VITE_REDIRECT_URI_TESTING) ||
  import.meta.env.VITE_REDIRECT_URI ||
  `${window.location.origin}/`;
const redirectSignOut = redirectSignIn;

// Normaliza dominio (sin protocolo)
const domain = String(domainRaw).replace(/^https?:\/\//, '');

// Validación suave (no rompe la app; el botón hará fallback manual)
const missing = [];
if (!domain)    missing.push('VITE_COGNITO_DOMAIN');
if (!clientId)  missing.push('VITE_COGNITO_CLIENT_ID');
if (!userPoolId) missing.push('VITE_COGNITO_USER_POOL_ID (recomendado)');

if (missing.length) {
  console.error('[Amplify] Faltan variables VITE_ requeridas/útiles:', missing);
} else {
  Amplify.configure({
    Auth: {
      region,
      userPoolId,
      userPoolWebClientId: clientId,
      oauth: {
        domain,
        scope: ['openid', 'email', 'profile'],
        redirectSignIn,
        redirectSignOut,
        responseType: 'code',
      },
    },
  });
}

// Exporta una URL de Hosted UI para el fallback manual del botón
export function hostedUiAuthorizeUrl() {
  if (!domain || !clientId) return null;
  const redirect = encodeURIComponent(redirectSignIn);
  const scope = encodeURIComponent('openid email profile');
  return `https://${domain}/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirect}&scope=${scope}`;
}

export default Amplify;

