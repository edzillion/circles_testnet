import { Component } from '@angular/core';
import { IonicPage, NavController, LoadingController, NavParams } from 'ionic-angular';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuth } from 'angularfire2/auth';

import { Observable } from 'rxjs/Observable';

import { LoginEmailPage } from '../../pages/login-email/login-email';
import { SignupEmailPage } from '../../pages/signup-email/signup-email';

import * as firebase from 'firebase/app';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  loading: any;
  user: Observable<firebase.User>;

  constructor(private navCtrl: NavController, public af: AngularFireModule, public afAuth: AngularFireAuth, public loadingCtrl: LoadingController, public navParams: NavParams) {
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
  }

  loginFb() {

    this.loading.present();

    this.afAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider())
    .then(
      (success) => {
        console.log('fb auth success');
        this.loading.dismiss();
      }).catch(
      (err) => {
        console.error(err);
      });
  }

  loginGoogle() {
    this.loading.present();
    this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
    .then(
      (success) => {
        console.log('google auth success');
        this.loading.dismiss();
      }).catch(
      (err) => {
        console.error(err);
      });
  }

  loginEmail() {
    this.navCtrl.push(LoginEmailPage);
  }

  goSignup() {
    this.navCtrl.push(SignupEmailPage);
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
    //this.ga.trackView('Login Page');
  }

}
