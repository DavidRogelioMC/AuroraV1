// src/aws-exports.js
// Config de Amplify Auth tomada de variables VITE_* (no hay secretos aquí)

const rawDomain = import.meta.env.VITE_COGNITO_DOMAIN || "";
const domain = rawDomain.replace(/^https?:\/\//, "").replace(/\/$/, ""); // sin https:// ni / final

const awsExports = {
  Auth: {
    region: import.meta.env.VITE_AWS_REGION || "us-east-1",
    userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,          // p.ej: us-east-1_XXXXXXX
    userPoolWebClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,    // p.ej: 67qhvmo...
    oauth: {
      domain,                              // p.ej: us-east-1xxxx.auth.us-east-1.amazoncognito.com
      scope: ["email", "openid", "profile"],
      redirectSignIn: import.meta.env.VITE_REDIRECT_URI_TESTING,    // tu URL de Amplify (testing/main)
      redirectSignOut: import.meta.env.VITE_REDIRECT_URI_TESTING,
      responseType: "token",               // flujo implícito (usa id_token en hash)
    },
  },
};

export default awsExports;
