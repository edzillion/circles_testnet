import { Component } from '@angular/core';
import { IonicPage, Loading, LoadingController, NavParams, NavController } from 'ionic-angular';
import { AnalyticsService } from '../../providers/analytics-service/analytics-service';

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
  private loading2: Loading;

  constructor(
    private navCtrl: NavController,
    private userService: UserService,
    private loadingCtrl: LoadingController,
    private analytics: AnalyticsService
  ) {

  }

  private loginFB() {

    this.loading = this.loadingCtrl.create({
      content: 'Logging in ...',
      dismissOnPageChange: true,
    });
    this.loading.present();

    var provider = new firebase.auth.FacebookAuthProvider();
    provider.addScope('public_profile');
    provider.addScope('email');

    this.userService.auth.signInWithRedirect(provider);
  }

  private loginGoogle() {
    this.loading = this.loadingCtrl.create({
      content: 'Logging in ...',
      dismissOnPageChange: true
    });
    var provider = new firebase.auth.GoogleAuthProvider();
    this.userService.auth.signInWithRedirect(provider);
  }

  private loginEmail() {
    this.navCtrl.push(LoginEmailPage);
  }

  private goSignup() {
    this.navCtrl.push(SignupEmailPage);
  }

  ionViewDidLoad() {
    this.analytics.trackPageView('Login Page');
  }

}
