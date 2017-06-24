import { Component } from '@angular/core';
import { IonicPage, Loading, LoadingController } from 'ionic-angular';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { AnalyticsService } from '../../providers/analytics-service/analytics-service';

import { AngularFireAuth } from 'angularfire2/auth';

import { UserService } from '../../providers/user-service/user-service';
import { ProfilePage } from '../profile/profile';

@IonicPage()
@Component({
  selector: 'page-signup-email',
  templateUrl: 'signup-email.html',
})
export class SignupEmailPage {

  private error: any;
  private createUserForm: FormGroup;
  private loading: Loading;

  constructor(
    private loadingCtrl: LoadingController,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private analytics: AnalyticsService
  ) {

    this.createUserForm = formBuilder.group({
      email: ['', Validators.required],
      password1: ['', Validators.required],
      password2: ['', Validators.required],
    }, { validator: this.passwordsAreEqual.bind(this) });
  }

  private onSubmit(formValues, formValid) {
    if (formValid) {

      this.loading = this.loadingCtrl.create({
        content: 'Saving User ...',
        //dismissOnPageChange: true
      });

      this.loading.present();

      this.userService.auth.createUserWithEmailAndPassword(
        formValues.email,
        formValues.password1
      ).then(
        (user) => {
          this.loading.dismiss();
          console.log("Email auth success: " + JSON.stringify(user));
        }).catch(
        (err) => {
          this.loading.dismiss();
          console.log("Email auth failure: " + JSON.stringify(err));
          this.error = err;
        })
    }
  }

  private passwordsAreEqual(ctrl: FormControl) {
    if (this.createUserForm && this.createUserForm.controls.password1.value) {
      let valid = this.createUserForm.controls.password1.value == this.createUserForm.controls.password2.value;
      return valid ? null : { 'passwordsAreEqual': true };
    }
  }

  ionViewDidLoad() {
    this.analytics.trackPageView('Signup Email Page');
  }

}
