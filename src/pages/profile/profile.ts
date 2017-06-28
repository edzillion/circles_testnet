import { IonicPage, NavController, NavParams, Slides, Loading, LoadingController, Toast, ToastController } from 'ionic-angular';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Camera } from '@ionic-native/camera';
import { AnalyticsService } from '../../providers/analytics-service/analytics-service';

import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase';

import { TabsPage } from '../tabs/tabs';
import { PushService } from '../../providers/push-service/push-service';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  // not type User because it could be a firebase user or our user object
  private user: any;

  private toast: Toast;

  private balance: number;
  private createdAt: number;
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
    loading: <Loading>{},
    refilling: <boolean>false
  };

  //todo: move literals
  private profilePageViewNames: Array<string> = ['Intro', 'User Type', 'User Info', 'Picture', 'Confirm'];
  private weeklyGrant: number = 100;

  constructor(
    private analytics: AnalyticsService,
    private camera: Camera,
    private db: AngularFireDatabase,
    private ds: DomSanitizer,
    private formBuilder: FormBuilder,
    private loadingCtrl: LoadingController,
    private pushService: PushService,
    private navCtrl: NavController,
    private navParams: NavParams,
    private toastCtrl: ToastController
  ) {

    this.formState.loading = this.loadingCtrl.create({
      content: 'Saving Profile ...',
      //dismissOnPageChange: true
    });

    this.userTypeForm = formBuilder.group({
      type: [null, Validators.required],
    });

    this.individualForm = formBuilder.group({
      firstName: [null, Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
      lastName: [null, Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
      email: [null, Validators.email]
    });

    this.organisationForm = formBuilder.group({
      organisation: [null, Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z0-9 ]*'), Validators.required])],
      tagline: [null, Validators.compose([Validators.maxLength(60)])],
      website: [null],
      email: [null, Validators.email]
    });

    this.picForm = formBuilder.group({
      profilePicURL: [null],
    });

    this.confirmForm = formBuilder.group({
      confirmed: [false],
    });

    // Missing array elems are added based on setUserTypeSlides()
    this.formGroups = [null, this.userTypeForm, null, null, this.confirmForm];

    this.user = navParams.get('user');
    if (this.user.uid) { //firebase user
      this.formState.refilling = false;
      this.UID = this.user.uid;
      this.initialiseFormFields(this.user);
    }
    else { //user object, therfore we are refilling out profile form
      this.formState.refilling = true;
      this.UID = this.user.$key;
      this.user = this.user;
      this.balance = this.user.balance;
      this.createdAt = this.user.createdAt;
      this.initialiseFormFields(this.user);
    }
  }

  private initialiseFormFields(user: any): void {

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
    if (this.userTypeForm.controls.type.value)
      this.setUserTypeSlides();
    this.profileSlider.slideNext();
  }

  private onSecondSlideSubmit() {
    this.setUserTypeSlides();
    this.profileSlider.lockSwipeToNext(false);
    this.profileSlider.slideNext();
  }

  private onSubmit(formData: any, formValid: boolean): void {
    if (!formValid)
      return;

    this.profileSlider.lockSwipeToNext(false);
    this.profileSlider.slideNext();
  }


  private setUserTypeSlides(): void {

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

  private onSlideWillChange(): void {
    // this returns the slide we are going to
    let i = this.profileSlider.getActiveIndex();

    //this will stop users from swiping to the next slide if they have not completed the current one
    if (this.formGroups[i] && !this.formGroups[i].valid)
      this.profileSlider.lockSwipeToNext(true);
    else
      this.profileSlider.lockSwipeToNext(false);

  }

  private onSlideDidChange(): void {
    let i = this.profileSlider.getActiveIndex();
    let slideName = this.profilePageViewNames[i];
    this.analytics.trackPageView('Profile Page: ' + slideName);
  }

  private selectFromGallery(form: FormGroup): void {
    var options = {
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.DATA_URL
    };
    this.camera.getPicture(options).then(
      imageData => {
        // imageData is a base64 encoded string
        this.base64ImageData = imageData;
        form.patchValue({ profilePicURL: "data:image/jpeg;base64," + imageData });
        form.controls.profilePicURL.markAsDirty();
      },
      error => {
        this.toast = this.toastCtrl.create({
          message: 'Error selecting from gallery: ' + error,
          duration: 3000,
          position: 'middle'
        });
        console.error(error);
        this.toast.present();
      });
  }

  private openCamera(form: FormGroup): void {
    var options = {
      sourceType: this.camera.PictureSourceType.CAMERA,
      destinationType: this.camera.DestinationType.DATA_URL
    };
    this.camera.getPicture(options).then(
      imageData => {
        // imageData is a base64 encoded string
        this.base64ImageData = imageData;
        form.patchValue({ profilePicURL: "data:image/jpeg;base64," + imageData });
        form.controls.profilePicURL.markAsDirty();
      },
      error => {
        this.toast = this.toastCtrl.create({
          message: 'Error opening camera: ' + error,
          duration: 3000,
          position: 'middle'
        });
        console.error(error);
        this.toast.present();
      });
  }

  private calcInitialBalance(): number {
    var now = new Date(),
      day = now.getDay();
    var diff = (7 - 5 + day) % 7;
    var b = this.weeklyGrant - ((this.weeklyGrant / 7) * (diff));
    return Math.round(b);
  }

  private saveForm(): void {
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
      this.user.balance = this.calcInitialBalance();
      this.user.createdAt = firebase.database['ServerValue']['TIMESTAMP'];

      this.user.log = [{
        timestamp: this.user.createdAt,
        type: 'createProfile'
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
            this.toast = this.toastCtrl.create({
              message: 'Error uploading image: ' + error,
              duration: 3000,
              position: 'middle'
            });
            console.error(error);
            this.toast.present();
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
              this.pushService.initialise().then( () => {
                console.log('pushService initialised');
                this.formState.loading.dismiss();
                if (this.formState.refilling)
                  this.navCtrl.setRoot(TabsPage);
              });
            })
            .catch(
            error => {
              this.toast = this.toastCtrl.create({
                message: 'Error saving user: ' + error,
                duration: 3000,
                position: 'middle'
              });
              console.error(error);
              this.toast.present();
            });
        });
      }
      else {
        //generic profile pic
        if (!this.formState.refilling) {
          this.user.profilePicURL = "https://firebasestorage.googleapis.com/v0/b/circles-testnet.appspot.com/o/profilepics%2Fgeneric-profile-pic.png?alt=media&token=d151cdb8-115f-483c-b701-e227d52399ef";
        }
        this.db.object(`users/${this.UID}`).set(this.user).then(
          success => {
            console.log('userData save success');
            this.pushService.initialise().then( () => {
              console.log('pushService initialised');
              this.formState.loading.dismiss();
              if (this.formState.refilling)
                this.navCtrl.setRoot(TabsPage);
            });
          }).catch(
          error => {
            this.toast = this.toastCtrl.create({
              message: 'Error saving user: ' + error,
              duration: 3000,
              position: 'middle'
            });
            console.error(error);
            this.toast.present();
          });
      }
    });
  }

  ionViewDidLoad() {
    this.analytics.trackPageView('Profile Page');
    //we don't want to allow swiping across two slides
    this.profileSlider.longSwipes = false;
  }

}
