import { Component } from '@angular/core';
import { IonicPage, Loading, LoadingController, NavParams, NavController } from 'ionic-angular';
import { GoogleAnalytics } from '@ionic-native/google-analytics';

import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase/app';

import { LoginEmailPage } from '../../pages/login-email/login-email';
import { SignupEmailPage } from '../../pages/signup-email/signup-email';
import { UserService } from '../../providers/user-service/user-service';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  private loading: Loading;

  constructor(
    private navCtrl: NavController,
    private userService: UserService,
    private loadingCtrl: LoadingController,
    private ga: GoogleAnalytics
  ) {

    this.loading = this.loadingCtrl.create({
      content: 'Please wait...',
      //dismissOnPageChange: true
    });
  }

  private loginFb() {

    this.loading.present();

    this.userService.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider())
    .then(
      (success) => {
        console.log('fb auth success');
        this.loading.dismiss();
      }).catch(
      (err) => {
        console.error(err);
      });
  }

  private loginGoogle() {
    this.loading.present();
    this.userService.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
    .then(
      (success) => {
        console.log('google auth success');
        this.loading.dismiss();
      }).catch(
      (err) => {
        console.error(err);
      });
  }

  private loginEmail() {
    this.navCtrl.push(LoginEmailPage);
  }

  private goSignup() {
    this.navCtrl.push(SignupEmailPage);
  }

  ionViewDidLoad() {
    this.ga.trackView('Login Page');
  }

}
