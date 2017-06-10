import { InjectionToken } from "@angular/core";
import { IAppConfig } from "./app-config.interface";

export const APP_DI_CONFIG: IAppConfig = {

  firebase: {
    host: 'localhost',
    apiKey: 'AIzaSyD-qk6NzF4sTQwqvgTSzl6z-tUH4Wd7PXc',
    authDomain: 'circles-testnet.firebaseapp.com',
    databaseURL: 'https://circles-testnet.firebaseio.com',
    projectId: 'circles-testnet',
    storageBucket: 'circles-testnet.appspot.com',
    messagingSenderId: '551885395202'
  },
  googleAnalytics: {
    id: 'UA-80367144-2'
  }
};

export let APP_CONFIG = new InjectionToken< IAppConfig >( 'app.config' );
