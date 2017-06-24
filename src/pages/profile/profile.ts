import { IonicPage, NavController, NavParams, Slides, LoadingController } from 'ionic-angular';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Camera } from '@ionic-native/camera';
import { GoogleAnalytics } from '@ionic-native/google-analytics';

import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase';

import { TabsPage } from '../tabs/tabs';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  private user: any;
  private balance: any;
  private createdAt: any;
  private UID: string;
  private base64ImageData: string;

  @ViewChild(Slides) profileSlider: Slides;

  private formGroups: Array<FormGroup>;
  private userTypeForm: FormGroup;
  private individualForm: FormGroup;
  private organisationForm: FormGroup;
  private picForm: FormGroup;
  private confirmForm: FormGroup;

  private formState = {
    type: <string>null,
    submitAttempt: <boolean>false,
    profilePicRequired: <boolean>false,
    loading: <any>{},
    refilling: <boolean>false
  };

  //todo: move literals
  private profilePageViewNames: Array<string> = ['Intro', 'User Type', 'User Info', 'Picture', 'Confirm'];
  private weeklyGrant: number = 100;

  constructor(
    private ga: GoogleAnalytics,
    private ds: DomSanitizer,
    private db: AngularFireDatabase,
    private camera: Camera,
    private formBuilder: FormBuilder,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private navParams: NavParams
  ) {

    this.formState.loading = this.loadingCtrl.create({
      content: 'Saving Profile ...',
      //dismissOnPageChange: true
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

    this.user = navParams.get('user');
    if (this.user.uid) { //firebase user
      this.formState.refilling = false;
      this.UID =  this.user.uid;
      this.initialiseFormFields(this.user);
    }
    else { //user object, therfore we are refilling out profile form
      this.formState.refilling = true;
      this.UID =  this.user.$key;
      this.user = this.user;
      this.balance = this.user.balance;
      this.createdAt = this.user.createdAt;
      this.initialiseFormFields(this.user);
    }
  }

  private initialiseFormFields(user) {

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

  private onFirstSlideSubmit() {
    if(this.userTypeForm.controls.type.value)
      this.setUserTypeSlides();
    this.profileSlider.slideNext();
  }

  private onSecondSlideSubmit() {
    this.setUserTypeSlides();
    this.profileSlider.lockSwipeToNext(false);
    this.profileSlider.slideNext();
  }

  private onSubmit(formValues, formValid) {
    if (!formValid)
      return;

    this.profileSlider.lockSwipeToNext(false);
    this.profileSlider.slideNext();
  }


  private setUserTypeSlides() {

    this.formState.type = this.userTypeForm.controls.type.value;

    //we have the user type so build the formgroup array to fit the form path
    if (this.formState.type == 'individual') {
      this.formGroups[2] = this.individualForm;
      //todo: fix this bug. setValidators is not setting the formControl valid = false
      this.picForm.controls.profilePicURL.setValidators([Validators.required, Validators.minLength(24)]);
      this.formState.profilePicRequired = true;
    }
    else {
      this.formGroups[2] = this.organisationForm;
      this.picForm.controls.profilePicURL.clearValidators();
      this.formState.profilePicRequired = false;
    }
    this.formGroups[3] = this.picForm;
  }

  private onSlideWillChange() {
    // this returns the slide we are going to
    let i = this.profileSlider.getActiveIndex();

    //this will stop users from swiping to the next slide if they have not completed the current one
    if (this.formGroups[i] && !this.formGroups[i].valid)
      this.profileSlider.lockSwipeToNext(true);
    else
      this.profileSlider.lockSwipeToNext(false);

  }

  private onSlideDidChange() {
    //add tracking here
  }

  private selectFromGallery(form) {
    var options = {
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.DATA_URL
    };
    this.camera.getPicture(options).then((imageData) => {
      // imageData is a base64 encoded string
      this.base64ImageData = imageData;
      form.patchValue({ profilePicURL: "data:image/jpeg;base64," + imageData });
      form.controls.profilePicURL.markAsDirty();
    }, (err) => {
      console.log(err);
    });
  }

  private openCamera(form) {
    var options = {
      sourceType: this.camera.PictureSourceType.CAMERA,
      destinationType: this.camera.DestinationType.DATA_URL
    };
    this.camera.getPicture(options).then((imageData) => {
      // imageData is a base64 encoded string
      this.base64ImageData = imageData;
      form.patchValue({ profilePicURL: "data:image/jpeg;base64," + imageData });
      form.controls.profilePicURL.markAsDirty();
    }, (err) => {
      console.log(err);
    });
  }

  private setInitialBalance() {
    var now = new Date(),
      day = now.getDay();
    var diff = (7 - 5 + day) % 7;
    var b = this.weeklyGrant - ((this.weeklyGrant / 7) * (diff));
    return Math.round(b);
  }

  private saveForm() {
    this.user = {};
    this.user.type = this.formState.type;

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

    if (!this.formState.refilling) {
      this.user.balance = this.setInitialBalance();
      this.user.createdAt = firebase.database['ServerValue']['TIMESTAMP'];

      this.user.log = [{
        timestamp:this.user.createdAt,
        type:'createProfile'
      }];
    }
    else {
      //todo: hacky
      this.user.balance = this.balance;
      this.user.createdAt = this.createdAt;
    }

    this.formState.loading.present().then(() => {

      if (this.base64ImageData) {

        let uploadTask = firebase.storage().ref('/profilepics').child(this.UID).putString(this.base64ImageData, 'base64', { contentType: 'image/jpg' });

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

          this.db.object(`users/${this.UID}`).set(this.user)
            .then((success) => {

              console.log('userData save success');
              this.formState.loading.dismiss();
              if (this.formState.refilling)
                this.navCtrl.setRoot(TabsPage);
              //we don't need to navigate here since our subscription to the user record will fire in app.component
              //this.navCtrl.setRoot(TabsPage, { user: this.user });
            })
            .catch((err) => { console.log(err) });
        });
      }
      else {
        //generic profile pic
        if (!this.formState.refilling) {
          this.user.profilePicURL = "https://firebasestorage.googleapis.com/v0/b/circles-testnet.appspot.com/o/profilepics%2Fgeneric-profile-pic.png?alt=media&token=d151cdb8-115f-483c-b701-e227d52399ef";
        }
        this.db.object(`users/${this.UID}`).set(this.user)
          .then((success) => {
            console.log('userData save success');
            this.formState.loading.dismiss();

            if (this.formState.refilling)
              this.navCtrl.setRoot(TabsPage);
            //we don't need to navigate here since our subscription to the user record will fire in app.component
            //this.navCtrl.setRoot(TabsPage, { user: this.user });
          })
          .catch((err) => { console.log(err) });
      }
    });
  }

  ionViewDidLoad() {
    this.ga.trackView('Profile Page');
    //we don't want to allow swiping across two slides
    this.profileSlider.longSwipes = false;
  }

}
