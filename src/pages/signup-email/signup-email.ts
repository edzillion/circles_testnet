import { Component } from '@angular/core';
import { IonicPage, Loading, LoadingController, Toast, ToastController } from 'ionic-angular';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { AnalyticsService } from '../../providers/analytics-service/analytics-service';

import { AngularFireAuth } from 'angularfire2/auth';

import { UserService } from '../../providers/user-service/user-service';
import { User } from '../../interfaces/user-interface';
import { ProfilePage } from '../profile/profile';

@IonicPage()
@Component({
  selector: 'page-signup-email',
  templateUrl: 'signup-email.html',
})
export class SignupEmailPage {

  private toast: Toast;
  private createUserForm: FormGroup;
  private loading: Loading;

  constructor(
    private analytics: AnalyticsService,
    private formBuilder: FormBuilder,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private userService: UserService
  ) {

    this.createUserForm = formBuilder.group({
      email: [null,  Validators.compose([Validators.required, Validators.email])],
      password1: [null, Validators.required],
      password2: [null, Validators.required],
    }, { validator: this.passwordsAreEqual.bind(this) });
  }

  private onSubmit(formData: any, formValid: boolean): void {
    if (!formValid)
      return;

    this.loading = this.loadingCtrl.create({
      content: 'Saving User ...',
      //dismissOnPageChange: true
    });

    this.loading.present();

    this.userService.auth.createUserWithEmailAndPassword(
      formData.email,
      formData.password1
    ).then(
      user => {
        this.loading.dismiss();
        console.log("Email auth success: " + JSON.stringify(user));
      }).catch(
      error => {
        console.log("Email auth failure: " + JSON.stringify(error));
        this.toast = this.toastCtrl.create({
          message: 'Email auth failure: ' + error,
          duration: 3000,
          position: 'middle'
        });
        this.loading.dismiss();
        this.toast.present();
      });
  }

  private passwordsAreEqual(ctrl: FormControl): any {
    if (this.createUserForm && this.createUserForm.controls.password1.value) {
      let valid = this.createUserForm.controls.password1.value == this.createUserForm.controls.password2.value;
      return valid ? null : { 'passwordsAreEqual': true };
    }
  }

  ionViewDidLoad() {
    this.analytics.trackPageView('Signup Email Page');
  }

}
