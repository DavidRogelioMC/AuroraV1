const awsExports = {
  Auth: {
    region: 'us-east-1',
    userPoolId: 'us-east-1_B7QVYyDGp',
    userPoolWebClientId: '51g99km7557n98v3c763nk529o',
    mandatorySignIn: true,
    authenticationFlowType: 'USER_SRP_AUTH',
    storage: window.localStorage,

    oauth: {
      domain: 'us-east-1b7qvyydgp.auth.us-east-1.amazoncognito.com',
      scope: ['email', 'openid', 'profile'],
      redirectSignIn: 'https://testing.d28h59guct50tx.amplifyapp.com',
      redirectSignOut: 'https://testing.d28h59guct50tx.amplifyapp.com',
      responseType: 'code'
    }
  }
};

export default awsExports;
