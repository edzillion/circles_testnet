
export interface IAppConfig {

  firebase: {
    host: string,
    apiKey: string,
    authDomain: string,
    databaseURL: string,
    projectId: string,
    storageBucket: string,
    messagingSenderId: string
  };
  googleAnalytics: {
    id: string
  };

}
