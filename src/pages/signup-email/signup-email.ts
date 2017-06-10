import { Component } from '@angular/core';
import { IonicPage, LoadingController } from 'ionic-angular';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

import { ProfilePage } from '../profile/profile';

import { AngularFireAuth } from 'angularfire2/auth';


@IonicPage()
@Component({
  selector: 'page-signup-email',
  templateUrl: 'signup-email.html',
})
export class SignupEmailPage {

  error: any;
  private _createUserForm: FormGroup;
  loading: any;

  constructor(private _loadingCtrl: LoadingController, private _formBuilder: FormBuilder, private _afAuth: AngularFireAuth) {

    this.loading = this._loadingCtrl.create({
      content: 'Saving User ...'
    });

    this._createUserForm = _formBuilder.group({
      email: ['', Validators.required],
      password1: ['', Validators.required],
      password2: ['', Validators.required],
    }, { validator: this.passwordsAreEqual.bind(this) });
  }

  onSubmit(formValues, formValid) {
    if (formValid) {

      this.loading.present();

      this._afAuth.auth.createUserWithEmailAndPassword(
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

  passwordsAreEqual(ctrl: FormControl) {
    if (this._createUserForm && this._createUserForm.controls.password1.value) {
      let valid = this._createUserForm.controls.password1.value == this._createUserForm.controls.password2.value;
      return valid ? null : { 'passwordsAreEqual': true };
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SignupEmailPage');
  }

}
