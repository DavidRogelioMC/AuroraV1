const awsExports = {
  Auth: {
    region: 'us-east-1',
    userPoolId: 'us-east-1_B7QVYyDGp',
    userPoolWebClientId: '51g99km7557n98v3c763nk529o',
    mandatorySignIn: true,
    authenticationFlowType: 'USER_SRP_AUTH',

    // ✅ Esto mejora la persistencia de sesión
    storage: window.localStorage,

    // ✅ (Opcional) Usa cookies si estás en dominio propio y HTTPS
    // cookieStorage: {
    //   domain: 'tudominio.com', // tu dominio
    //   path: '/',
    //   expires: 365,
    //   secure: true,
    // },
  }
};

export default awsExports;
