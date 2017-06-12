import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';

import { IonicPage, NavController, NavParams, Slides, LoadingController } from 'ionic-angular';

import { Camera } from '@ionic-native/camera';
import { GoogleAnalytics } from '@ionic-native/google-analytics';

import { Observable, Subscription } from 'rxjs';

import { LoginPage } from '../login/login';
import { TabsPage } from '../tabs/tabs';

import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  authSubscription: Subscription;

  private user: any;
  private _balance: any;
  private _createdAt: any;
  private _UID: string;
  private _base64ImageData: string;

  @ViewChild(Slides) profileSlider: Slides;

  formGroups: Array<FormGroup>;
  userTypeForm: FormGroup;
  individualForm: FormGroup;
  organisationForm: FormGroup;
  picForm: FormGroup;
  confirmForm: FormGroup;

  private _formState = {
    type: <string>null,
    submitAttempt: <boolean>false,
    profilePicRequired: <boolean>false,
    loading: <any>{},
    refilling: <boolean>false
  };

  //todo: move literals
  profilePageViewNames: Array<string> = ['Intro', 'User Type', 'User Info', 'Picture', 'Confirm'];
  weeklyGrant: number = 100;

  constructor(private ga: GoogleAnalytics, private _ds: DomSanitizer, private _db: AngularFireDatabase, private _camera: Camera, private formBuilder: FormBuilder, private loadingCtrl: LoadingController, private _navCtrl: NavController, private _navParams: NavParams) {



    this._formState.loading = this.loadingCtrl.create({
      content: 'Saving Profile ...'
    });

    this.userTypeForm = formBuilder.group({
      type: ['', Validators.required],
    });

    this.individualForm = formBuilder.group({
      firstName: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
      lastName: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
      email: ['']
    });

    this.organisationForm = formBuilder.group({
      organisation: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z0-9 ]*'), Validators.required])],
      tagline: ['', Validators.compose([Validators.maxLength(60)])],
      website: [''],
      email: ['']
    });

    this.picForm = formBuilder.group({
      profilePicURL: [''],
    });

    this.confirmForm = formBuilder.group({
      confirmed: [false],
    });

    // Missing array elems are added based on setUserTypeSlides()
    this.formGroups = [null, this.userTypeForm, null, null, this.confirmForm];

    this.user = _navParams.get('user');
    if (this.user.uid) { //firebase user
      this._formState.refilling = false;
      this._UID =  this.user.uid;
      this.initialiseFormFields(this.user);
    }
    else { //user object, therfore we are refilling out profile form
      this._formState.refilling = true;
      this.user.subscribe( (user) => {
        this._UID =  user.$key;
        this.user = user;
        this._balance = user.balance;
        this._createdAt = user.createdAt;
        this.initialiseFormFields(this.user);
      });
    }
  }

  initialiseFormFields(user) {

    if (user.type)
      this.userTypeForm.patchValue({ type: user.type });

    var fname = '';
    var lname = '';
    if (user.displayName) {
      var names = user.displayName.split(' ');
      fname = names[0];
      lname = names[1];
    }
    this.individualForm.patchValue({ email: user.email });
    this.individualForm.patchValue({ firstName: fname });
    this.individualForm.patchValue({ lastName: lname });

    this.organisationForm.patchValue({ organisation: user.displayName });
    this.organisationForm.patchValue({ email: user.email });

    if (user.photoURL) {
      this.picForm.patchValue({ profilePicURL: user.photoURL });
      this.picForm.controls.profilePicURL.markAsDirty();
    }
    else if (user.profilePicURL) {
      this.picForm.patchValue({ profilePicURL: user.profilePicURL });
      this.picForm.controls.profilePicURL.markAsDirty();
    }
  }


  onFirstSlideSubmit() {
    if(this.userTypeForm.controls.type.value)
      this.setUserTypeSlides();
    this.profileSlider.slideNext();
  }

  onSecondSlideSubmit() {
    this.setUserTypeSlides();
    this.profileSlider.lockSwipeToNext(false);
    this.profileSlider.slideNext();
  }

  onSubmit(formValues, formValid) {
    if (!formValid)
      return;

    this.profileSlider.lockSwipeToNext(false);
    this.profileSlider.slideNext();
  }


  setUserTypeSlides() {

    this._formState.type = this.userTypeForm.controls.type.value;

    //we have the user type so build the formgroup array to fit the form path
    if (this._formState.type == 'individual') {
      this.formGroups[2] = this.individualForm;
      //todo: fix this bug. setValidators is not setting the formControl valid = false
      this.picForm.controls.profilePicURL.setValidators([Validators.required, Validators.minLength(24)]);
      this._formState.profilePicRequired = true;
    }
    else {
      this.formGroups[2] = this.organisationForm;
      this.picForm.controls.profilePicURL.clearValidators();
      this._formState.profilePicRequired = false;
    }
    this.formGroups[3] = this.picForm;
  }

  onSlideWillChange() {
    // this returns the slide we are going to
    let i = this.profileSlider.getActiveIndex();

    //this will stop users from swiping to the next slide if they have not completed the current one
    if (this.formGroups[i] && !this.formGroups[i].valid)
      this.profileSlider.lockSwipeToNext(true);
    else
      this.profileSlider.lockSwipeToNext(false);

  }

  onSlideDidChange() {
    //add tracking here
  }

  selectFromGallery(form) {
    var options = {
      sourceType: this._camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this._camera.DestinationType.DATA_URL
    };
    this._camera.getPicture(options).then((imageData) => {
      // imageData is a base64 encoded string
      this._base64ImageData = imageData;
      form.patchValue({ profilePicURL: "data:image/jpeg;base64," + imageData });
      form.controls.profilePicURL.markAsDirty();
    }, (err) => {
      console.log(err);
    });
  }

  openCamera(form) {
    var options = {
      sourceType: this._camera.PictureSourceType.CAMERA,
      destinationType: this._camera.DestinationType.DATA_URL
    };
    this._camera.getPicture(options).then((imageData) => {
      // imageData is a base64 encoded string
      this._base64ImageData = imageData;
      form.patchValue({ profilePicURL: "data:image/jpeg;base64," + imageData });
      form.controls.profilePicURL.markAsDirty();
    }, (err) => {
      console.log(err);
    });
  }

  setInitialBalance() {
    var now = new Date(),
      day = now.getDay();
    var diff = (7 - 5 + day) % 7;
    var b = this.weeklyGrant - ((this.weeklyGrant / 7) * (diff));
    return Math.round(b);
  }

  saveForm() {
    this.user = {};
    this.user.type = this._formState.type;

    if (this.user.type === 'individual') {
      this.user.firstName = this.individualForm.get('firstName').value;
      this.user.lastName = this.individualForm.get('lastName').value;
      this.user.displayName = this.user.firstName + ' ' + this.user.lastName;
      this.user.email = this.individualForm.get('email').value || '';
      this.user.profilePicURL = this.picForm.get('profilePicURL').value;
    }
    else {
      this.user.organisation = this.organisationForm.get('organisation').value;
      this.user.displayName = this.user.organisation;
      this.user.email = this.organisationForm.get('email').value || '';
      this.user.tagline = this.organisationForm.get('tagline').value || '';
      this.user.website = this.organisationForm.get('website').value || '';
      this.user.profilePicURL = this.picForm.get('profilePicURL').value;
    }

    if (!this._formState.refilling) {
      this.user.balance = this.setInitialBalance();
      this.user.createdAt = firebase.database['ServerValue']['TIMESTAMP'];

      this.user.log = [{
        timestamp:this.user.createdAt,
        type:'createProfile'
      }];
    }
    else {
      //todo: hacky
      this.user.balance = this._balance;
      this.user.createdAt = this._createdAt;
    }

    this._formState.loading.present().then(() => {

      if (this._base64ImageData) {

        let uploadTask = firebase.storage().ref('/profilepics').child(this._UID).putString(this._base64ImageData, 'base64', { contentType: 'image/jpg' });

        uploadTask.on(
          firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
          function(snapshot) {
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            switch (snapshot.state) {
              case firebase.storage.TaskState.PAUSED: // or 'paused'
                console.log('Upload is paused');
                break;
              case firebase.storage.TaskState.RUNNING: // or 'running'
                console.log('Upload is running');
                break;
            }
          },
          function(error) {
            console.log(error);
          },
          function() {
            // Upload completed successfully, now we can get the download URL
            console.log('Upload Complete');
          });

        uploadTask.then((obj) => {
          this.user.profilePicURL = uploadTask.snapshot.downloadURL;

          this._db.object(`users/${this._UID}`).set(this.user)
            .then((success) => {

              console.log('userData save success');
              this._formState.loading.dismiss();
              if (this._formState.refilling)
                this._navCtrl.setRoot(TabsPage);
              //we don't need to navigate here since our subscription to the user record will fire in app.component
              //this.navCtrl.setRoot(TabsPage, { user: this.user });
            })
            .catch((err) => { console.log(err) });
        });
      }
      else {
        //generic profile pic
        if (!this._formState.refilling) {
          this.user.profilePicURL = "https://firebasestorage.googleapis.com/v0/b/circles-testnet.appspot.com/o/profilepics%2Fgeneric-profile-pic.png?alt=media&token=d151cdb8-115f-483c-b701-e227d52399ef";
        }
        this._db.object(`users/${this._UID}`).set(this.user)
          .then((success) => {
            console.log('userData save success');
            this._formState.loading.dismiss();

            if (this._formState.refilling)
              this._navCtrl.setRoot(TabsPage);
            //we don't need to navigate here since our subscription to the user record will fire in app.component
            //this.navCtrl.setRoot(TabsPage, { user: this.user });
          })
          .catch((err) => { console.log(err) });
      }
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfilePage');
    this.ga.trackView('Profile Page');
  }

}
