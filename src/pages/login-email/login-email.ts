import { Component } from '@angular/core';
import { IonicPage, LoadingController } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@IonicPage()
@Component({
  selector: 'page-login-email',
  templateUrl: 'login-email.html',
})
export class LoginEmailPage {

  private _loginForm: FormGroup;
  loading: any;
  error: any;

  constructor(private _loadingCtrl: LoadingController, private _formBuilder: FormBuilder, private _afAuth: AngularFireAuth) {

    this._loginForm = _formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(formData, formValid) {
    if (!formValid)
      return;

    this.loading = this._loadingCtrl.create({
      content: 'Logging In ...'
    });
    this.loading.present()

    this._afAuth.auth.signInWithEmailAndPassword(
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
    console.log('ionViewDidLoad LoginEmailPage');
  }

}
