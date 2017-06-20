import { Component } from '@angular/core';
import { IonicPage, LoadingController, NavParams } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { FormBuilder, FormGroup, Validators, } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';

import { Camera } from '@ionic-native/camera';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { Geolocation } from '@ionic-native/geolocation';

import * as firebase from 'firebase';

import { UserService } from '../../providers/user-service/user-service';
import { NewsService } from '../../providers/news-service/news-service';
import { NotificationsService, SimpleNotificationsComponent } from 'angular2-notifications';

@IonicPage()
@Component({
  selector: 'page-offer',
  templateUrl: 'offer.html',
})
export class OfferPage {

  private user: any;
  private offerForm: FormGroup;
  private userOffers: FirebaseListObservable<any>;
  private base64ImageData: string;

  loading: any;
  loading2: any;

  constructor(private newsService: NewsService, private userService: UserService, private notificationsService: NotificationsService, private ds: DomSanitizer, private geo: Geolocation, private camera: Camera, private ga: GoogleAnalytics, private loadingCtrl: LoadingController, private formBuilder: FormBuilder, private db: AngularFireDatabase, private navParams: NavParams) {

    userService.userSubject.subscribe(
      user => {
        this.user = user;
        this.userOffers = db.list('users/' + this.user.$key + '/offers');
      },
      err => console.error(err)
    );

    this.offerForm = formBuilder.group({
      picURL: [''],
      title: ['', Validators.required],
      price: ['', Validators.required],
      priceDescription: ['', Validators.required],
      latitude: [],
      longitude: []
    });
  }

  getCurrentLocation() {

    this.loading2 = this.loadingCtrl.create({
      content: 'Saving Location ...'
    });

    this.loading2.present();

    this.geo.getCurrentPosition().then((geo) => {
      //todo:set a tick mark on the button on success
      this.offerForm.patchValue({ latitude: geo.coords.latitude });
      this.offerForm.patchValue({ longitude: geo.coords.longitude });
      this.offerForm.controls.latitude.markAsDirty();
      this.offerForm.controls.longitude.markAsDirty();
      this.loading2.dismiss();
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }

  onSubmit(formValues, formValid) {

    if (!formValid)
      return;

    let offer = {
      location: [formValues.latitude, formValues.longitude],
      picURL: '',
      price: formValues.price,
      priceDescription: formValues.priceDescription,
      seller: this.user.$key,
      timestamp: firebase.database['ServerValue']['TIMESTAMP'],
      title: formValues.title,
      type: 'offerListed'
    }

    //for form submit
    this.loading = this.loadingCtrl.create({
      content: 'Listing ...'
    });

    this.loading.present().then(() => {

      if (this.base64ImageData) {
        let filename = Date.now()+'-'+this.user.$key;
        let uploadTask = firebase.storage().ref('/tradepics').child(filename).putString(this.base64ImageData, 'base64', { contentType: 'image/jpg' });

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
          offer.picURL = uploadTask.snapshot.downloadURL;
          this.userOffers.push(offer);
          this.newsService.addOfferListed(offer);
          this.offerForm.reset();
          this.loading.dismiss();
        });
      }
      else {
        //generic profile pic
        offer.picURL = "https://firebasestorage.googleapis.com/v0/b/circles-testnet.appspot.com/o/profilepics%2Fgeneric-profile-pic.png?alt=media&token=d151cdb8-115f-483c-b701-e227d52399ef";
        this.userOffers.push(offer);
        this.newsService.addOfferListed(offer);
        this.offerForm.reset();
        this.loading.dismiss();
      }
    });
  }

  selectFromGallery(form) {
    var options = {
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.DATA_URL
    };
    this.camera.getPicture(options).then((imageData) => {
      // imageData is a base64 encoded string
      this.base64ImageData = imageData;
      form.patchValue({ picURL: "data:image/jpeg;base64," + imageData });
      form.controls.picURL.markAsDirty();
    }, (err) => {
      console.log(err);
    });
  }

  openCamera(form) {
    var options = {
      sourceType: this.camera.PictureSourceType.CAMERA,
      destinationType: this.camera.DestinationType.DATA_URL
    };
    this.camera.getPicture(options).then((imageData) => {
      // imageData is a base64 encoded string
      this.base64ImageData = imageData;
      form.patchValue({ picURL: "data:image/jpeg;base64," + imageData });
      form.controls.picURL.markAsDirty();
    }, (err) => {
      console.log(err);
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad OfferPage');
  }

}
