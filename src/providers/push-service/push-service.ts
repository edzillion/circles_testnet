import { Injectable, OnDestroy } from '@angular/core';
import { OneSignal, OSNotification } from '@ionic-native/onesignal';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise'


import { environment } from '../../environments/environment';
import { UserService } from '../../providers/user-service/user-service';
import { User } from '../../interfaces/user-interface';

@Injectable()
export class PushService implements OnDestroy {

  private user: User;

  constructor(private oneSignal: OneSignal, private userService: UserService) {

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

  public async initialise() {
    this.user = await this.userService.user$.take(1).toPromise();
    if (this.user.pushID)
      return;

    let ids = await this.oneSignal.getIds();
    let updateObject = {pushID: ids.userId};
    return await this.userService.update(updateObject);
  }

  public async push(message: String) {
    // if (user.
    // let ids = await this.oneSignal.getIds();
    //
    //   debugger;
    // let notificationObj = { contents: {en: message},
    //                         include_player_ids: [ids.userId]} as OSNotification;
    // let result = await this.oneSignal.postNotification(notificationObj);
    // debugger;
  }

  ngOnDestroy () {
    //this.dbNewsSub$.unsubscribe();
  }

}
