import { Component, OnDestroy, NgZone, ViewChild } from '@angular/core';
import { AlertController, Loading, LoadingController, Events, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AnalyticsService } from '../providers/analytics-service/analytics-service';

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { Subscription } from 'rxjs/Subscription';

import { TabsPage } from '../pages/tabs/tabs';
import { LoginPage } from '../pages/login/login';
import { ProfilePage } from '../pages/profile/profile';
import { UserService } from '../providers/user-service/user-service';

@Component({
  templateUrl: 'app.html'
})
export class MyApp implements OnDestroy {

  private rootPage = LoginPage;
  @ViewChild('content') nav;

  private loading: Loading;

  private initSub$: Subscription;

  //todo: better way to do this?
  public updateContentOffset: any;

  constructor(
    private alertController: AlertController,
    private userService: UserService,
    private ngZone: NgZone,
    public events: Events,
    private afAuth: AngularFireAuth,
    private db: AngularFireDatabase,
    private platform: Platform,
    private statusBar: StatusBar,
    private splashScreen: SplashScreen,
    private analytics: AnalyticsService,
    private loadingCtrl: LoadingController
  ) {

    platform.ready()
      .then(() => {

        if (this.platform.is('cordova')) {

        }
        statusBar.styleDefault();
        this.initSub$ = this.userService.initSubject$.subscribe(
          noProfile => {

            if (noProfile)
              this.nav.setRoot(ProfilePage, { user: noProfile, nav: this.nav });
            else
              this.nav.setRoot(TabsPage, { nav: this.nav });
          },
          error => console.error(error),
          () => { }
        );

    

      });
  }

  private goToProfile() {
    let alert = this.alertController.create({
      title: 'Confirm Profile Change',
      message: 'This will reset your profile. Continue?',
      buttons: [
        {
          text: 'CANCEL',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'OK',
          handler: () => {
            this.userService.user$.take(1).subscribe(user => {
              this.nav.setRoot(ProfilePage, { user: user });
            });
          }
        }
      ]
    });
    alert.present();
  }

  private logout() {
    //close subscriptions?? close services??
    this.userService.auth.signOut().then((user) => {
      console.log('logout success');
      this.nav.setRoot(LoginPage);
    }, function(error) {
      console.log('logout fail:', error);
    });
  }

  ngOnDestroy() {

    this.initSub$.unsubscribe();
  }

}
