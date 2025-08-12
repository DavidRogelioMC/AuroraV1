// src/aws-exports.js
const awsExports = {
  Auth: {
    region: 'us-east-1',
    userPoolId: 'us-east-1_B7QVvyDGp',
    userPoolWebClientId: '51g90km75579n83v2c763nk529o', // el que ya tienes en este archivo
    mandatorySignIn: true,
    authenticationFlowType: 'USER_SRP_AUTH',
    storage: window.localStorage,

    // 👇🏼 AÑADE ESTO
    oauth: {
      // Amplify espera el dominio SIN protocolo
      domain: (import.meta.env.VITE_COGNITO_DOMAIN
        ? import.meta.env.VITE_COGNITO_DOMAIN.replace(/^https?:\/\//, '')
        : 'us-east-1b7qvyydgp.auth.us-east-1.amazoncognito.com'),

      scope: ['email', 'openid', 'phone', 'profile'],
      redirectSignIn: (import.meta.env.VITE_REDIRECT_URI
        ? import.meta.env.VITE_REDIRECT_URI
        : 'https://testing.d28h59guct50tx.amplifyapp.com'),
      redirectSignOut: (import.meta.env.VITE_REDIRECT_URI
        ? import.meta.env.VITE_REDIRECT_URI
        : 'https://testing.d28h59guct50tx.amplifyapp.com'),
      responseType: 'code', // flujo Authorization Code
    },
  },
};

export default awsExports;
