import { Component } from '@angular/core';
import { IonicPage, Loading, LoadingController, Toast, ToastController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AnalyticsService } from '../../providers/analytics-service/analytics-service';

import { AngularFireAuth } from 'angularfire2/auth';

import { UserService } from '../../providers/user-service/user-service';
import { User } from '../../interfaces/user-interface';

@IonicPage()
@Component({
  selector: 'page-login-email',
  templateUrl: 'login-email.html',
})
export class LoginEmailPage {

  private loginForm: FormGroup;
  private loading: Loading;
  private toast: Toast;

  constructor(
    private analytics: AnalyticsService,
    private formBuilder: FormBuilder,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private userService: UserService
  ) {

    this.loginForm = formBuilder.group({
      email: [null,  Validators.compose([Validators.required, Validators.email])],
      password: [null, Validators.required]
    });
  }

  private onSubmit(formData: any, formValid: boolean): void {
    if (!formValid)
      return;

    this.loading = this.loadingCtrl.create({
      content: 'Logging In ...',
      //dismissOnPageChange: true
    });

    this.loading.present()

    this.userService.auth.signInWithEmailAndPassword(
      formData.email,
      formData.password
    ).then(
      success => {
        console.log('email auth success');
        this.loading.dismiss();
      }).catch(
      error => {
        this.toast = this.toastCtrl.create({
          message: error,
          duration: 3000,
          position: 'middle'
        });
        console.error(error);
        this.loading.dismiss();
        this.toast.present();
      });

  }

  ionViewDidLoad() {
    this.analytics.trackPageView('Login Email Page');
  }

}
