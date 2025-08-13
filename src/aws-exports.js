// src/aws-exports.js
// Lee configuración desde variables VITE_* (no hay secretos aquí).
const rawDomain = import.meta.env.VITE_COGNITO_DOMAIN || '';
const domain = rawDomain.replace(/^https?:\/\//, '').replace(/\/$/, ''); // sin https:// ni slash final

const awsmobile = {
  aws_project_region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  aws_cognito_region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  aws_user_pools_id: import.meta.env.VITE_COGNITO_USER_POOL_ID,        // ej: us-east-1_XXXXXX
  aws_user_pools_web_client_id: import.meta.env.VITE_COGNITO_CLIENT_ID, // App client ID
  oauth: {
    domain, // ej: your-domain.auth.us-east-1.amazoncognito.com (sin https://)
    scope: ['email', 'openid', 'profile'],
    redirectSignIn: import.meta.env.VITE_REDIRECT_URI_TESTING,
    redirectSignOut: import.meta.env.VITE_REDIRECT_URI_TESTING,
    responseType: 'token'
  }
};

export default awsmobile;
