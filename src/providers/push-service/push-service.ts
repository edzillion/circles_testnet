import { Injectable, OnDestroy } from '@angular/core';
import { OneSignal } from '@ionic-native/onesignal';

import 'rxjs/add/operator/map';

import { environment } from '../../environments/environment';

@Injectable()
export class PushService implements OnDestroy {

  constructor(private oneSignal: OneSignal) {
    debugger;
    // Enable to debug issues.
    // window.plugins.OneSignal.setLogLevel({logLevel: 4, visualLevel: 4});

    this.oneSignal.startInit(environment.cloudSettings.push.app_id, environment.cloudSettings.push.sender_id);

    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.InAppAlert);

    this.oneSignal.handleNotificationReceived().subscribe(() => {
     console.log('handleNotificationReceived()');
    });

    this.oneSignal.handleNotificationOpened().subscribe(() => {
      console.log('handleNotificationOpened()');
    });

    this.oneSignal.endInit();

  }

  ngOnDestroy () {
    //this.dbNewsSub$.unsubscribe();
  }

}
