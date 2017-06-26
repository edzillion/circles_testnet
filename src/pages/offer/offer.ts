import { Component } from '@angular/core';
import { IonicPage, Loading, LoadingController, NavParams, Toast, ToastController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Camera } from '@ionic-native/camera';
import { AnalyticsService } from '../../providers/analytics-service/analytics-service';
import { Geolocation } from '@ionic-native/geolocation';

import { Subscription } from 'rxjs/Subscription';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import * as firebase from 'firebase';

import { UserService } from '../../providers/user-service/user-service';
import { User } from '../../interfaces/user-interface';
import { NewsService } from '../../providers/news-service/news-service';
import { Offer } from '../../interfaces/offer-interface';

@IonicPage()
@Component({
  selector: 'page-offer',
  templateUrl: 'offer.html',
})
export class OfferPage {

  private user: User;
  private userSub$: Subscription;
  private offerForm: FormGroup;
  private userOffers$: FirebaseListObservable<Offer[]>;
  private base64ImageData: string;

  private loading: Loading;
  private loading2: Loading;
  private toast: Toast;

  constructor(
    private analytics: AnalyticsService,
    private camera: Camera,
    private db: AngularFireDatabase,
    private ds: DomSanitizer,
    private formBuilder: FormBuilder,
    private geo: Geolocation,
    private loadingCtrl: LoadingController,
    private newsService: NewsService,
    private toastCtrl: ToastController,
    private userService: UserService
  ) {

    this.offerForm = formBuilder.group({
      picURL: [null],
      title: [null, Validators.required],
      price: [null, Validators.required],
      priceDescription: [null, Validators.required],
      latitude: [null],
      longitude: [null]
    });
  }

  private getCurrentLocation():void {

    this.loading2 = this.loadingCtrl.create({
      content: 'Saving Location ...',
      //dismissOnPageChange: true
    });

    this.loading2.present();

    this.geo.getCurrentPosition().then(
      geo => {
        //todo:set a tick mark on the button on success
        this.offerForm.patchValue({ latitude: geo.coords.latitude });
        this.offerForm.patchValue({ longitude: geo.coords.longitude });
        this.offerForm.controls.latitude.markAsDirty();
        this.offerForm.controls.longitude.markAsDirty();
        this.loading2.dismiss();
      }).catch(
      error => {
        this.toast = this.toastCtrl.create({
          message: 'Error getting location: '+error,
          duration: 3000,
          position: 'middle'
        });
        this.loading2.dismiss();
        console.error(error);
        this.toast.present();
      }
    );
  }

  private onSubmit(formData: any, formValid: boolean): void {

    if (!formValid)
      return;

    let offer = {
      location: [formData.latitude, formData.longitude],
      picURL: '',
      price: formData.price,
      priceDescription: formData.priceDescription,
      seller: this.user.$key,
      timestamp: firebase.database['ServerValue']['TIMESTAMP'],
      title: formData.title,
      type: 'offerListed'
    }

    //for form submit
    this.loading = this.loadingCtrl.create({
      content: 'Listing ...',
      //dismissOnPageChange: true
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
            this.toast = this.toastCtrl.create({
              message: 'Error uploading image: '+error,
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
          offer.picURL = uploadTask.snapshot.downloadURL;
          this.userOffers$.push(offer);
          this.newsService.addOfferListed(<any>offer);//todo: fix types issue here
          this.offerForm.reset();
          this.loading.dismiss();
        });
      }
      else {
        //generic profile pic
        offer.picURL = "https://firebasestorage.googleapis.com/v0/b/circles-testnet.appspot.com/o/profilepics%2Fgeneric-profile-pic.png?alt=media&token=d151cdb8-115f-483c-b701-e227d52399ef";
        this.userOffers$.push(offer);
        this.newsService.addOfferListed(<any>offer);//todo: fix types issue here
        this.offerForm.reset();
        this.loading.dismiss();
      }
    });
  }

  private selectFromGallery(form: FormGroup):void {
    var options = {
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.DATA_URL
    };
    this.camera.getPicture(options).then(
      imageData => {
        // imageData is a base64 encoded string
        this.base64ImageData = imageData;
        form.patchValue({ picURL: "data:image/jpeg;base64," + imageData });
        form.controls.picURL.markAsDirty();
      },
      error => {
        this.toast = this.toastCtrl.create({
          message: 'Error selecting from gallery: '+error,
          duration: 3000,
          position: 'middle'
        });
        console.error(error);
        this.toast.present();
      }
    );
  }

  private openCamera(form: FormGroup):void {
    var options = {
      sourceType: this.camera.PictureSourceType.CAMERA,
      destinationType: this.camera.DestinationType.DATA_URL
    };
    this.camera.getPicture(options).then(
      imageData => {
        // imageData is a base64 encoded string
        this.base64ImageData = imageData;
        form.patchValue({ picURL: "data:image/jpeg;base64," + imageData });
        form.controls.picURL.markAsDirty();
      },
      error => {
        this.toast = this.toastCtrl.create({
          message: 'Error opening camera: '+error,
          duration: 3000,
          position: 'middle'
        });
        console.error(error);
        this.toast.present();
      }
    );
  }

  ionViewDidLoad() {
    this.analytics.trackPageView('Offer Page');

    this.userSub$ = this.userService.user$.subscribe(
      user => {
        this.user = user;
        this.userOffers$ = this.db.list('users/' + this.user.$key + '/offers');
      },
      error => {
        this.toast = this.toastCtrl.create({
          message: 'DB error: '+error,
          duration: 3000,
          position: 'middle'
        });
        console.error(error);
        this.toast.present();
      },
      () => console.log('offer ionViewDidLoad userSub$ obs complete')
    );
  }

  ionViewWillUnload () {
    this.userSub$.unsubscribe();
    this.userOffers$.subscribe().unsubscribe();
  }

}
