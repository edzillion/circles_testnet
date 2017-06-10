import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { AlertController, Content, Events, Header, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';


import { TabsPage } from '../pages/tabs/tabs';
import { LoginPage } from '../pages/login/login';
import { ProfilePage } from '../pages/profile/profile';
import { UserService } from '../providers/user-service/user-service';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  private rootPage: Component;
  @ViewChild('content') nav;

  private userAuth: Observable<firebase.User>;
  private contentOffset: number;



  public updateContentOffset: any;

  constructor(private alertController: AlertController, private userService: UserService, private ngZone:NgZone, public events: Events, public afAuth: AngularFireAuth, db: AngularFireDatabase, platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen) {

    platform.ready()

      .then(() => {
        statusBar.styleDefault();
        this.userService.initSubject.subscribe(
          noProfile => {
            if (noProfile)
              this.nav.setRoot(ProfilePage, { user: noProfile, nav: this.nav });
            else
              this.nav.setRoot(TabsPage, { nav: this.nav });
          },
          err => console.error(err),
          () => {debugger}
        )
      });

  }


  goToProfile() {
  //   let alert = this.alertController.create({
  //   title: 'Confirm Profie Change',
  //   message: 'This will reset your profile. Continue?',
  //   buttons: [
  //     {
  //       text: 'CANCEL',
  //       role: 'cancel',
  //       handler: () => {
  //         console.log('Cancel clicked');
  //       }
  //     },
  //     {
  //       text: 'OK',
  //       handler: () => {
  //         this.nav.setRoot(ProfilePage, { user: this.userService.user });
  //       }
  //     }
  //   ]
  // });
  // alert.present();
  }


  logout() {
    this.afAuth.auth.signOut().then((user) => {
      console.log('logout success');
      //this.sub.unsubscribe();
      this.nav.setRoot(LoginPage);
    }, function(error) {
      console.log('logout fail:', error);
    });
  }



}
