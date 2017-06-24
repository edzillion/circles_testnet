import { Component } from '@angular/core';
import { IonicPage, Loading, LoadingController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AnalyticsService } from '../../providers/analytics-service/analytics-service';

import { AngularFireAuth } from 'angularfire2/auth';

import { UserService } from '../../providers/user-service/user-service';

@IonicPage()
@Component({
  selector: 'page-login-email',
  templateUrl: 'login-email.html',
})
export class LoginEmailPage {

  private loginForm: FormGroup;
  private loading: Loading;
  private error: any;

  constructor(
    private userService: UserService,
    private loadingCtrl: LoadingController,
    private formBuilder: FormBuilder,
    private analytics: AnalyticsService
  ) {

    this.loginForm = formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  private onSubmit(formData, formValid) {
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
    )
    .then(
      (success) => {
      console.log('email auth success');
      this.loading.dismiss();
    }).catch(
    (err) => {
      this.error = err;
      console.error(err);
      this.loading.dismiss();
    });

  }

  ionViewDidLoad() {
    this.analytics.trackPageView('Login Email Page');
  }

}
