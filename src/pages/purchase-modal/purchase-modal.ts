import { Component } from '@angular/core';
import { IonicPage, NavParams, ViewController, Loading, LoadingController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GoogleAnalytics } from '@ionic-native/google-analytics';

import { Subscription } from 'rxjs/Subscription';
import { NotificationsService } from 'angular2-notifications';

import { TransactionService } from '../../providers/transaction-service/transaction-service';
import { UserService } from '../../providers/user-service/user-service';
import { NewsService } from '../../providers/news-service/news-service';

@IonicPage()
@Component({
  selector: 'page-purchase-modal',
  templateUrl: 'purchase-modal.html'
})
export class PurchaseModal {

  private offer: any;
  private user: any;
  private userSub$: Subscription;
  private error: any;
  private sellerName: string;

  private loading: Loading;

  private transactionForm: FormGroup;

  constructor(
    private userService: UserService,
    private notificationsService: NotificationsService,
    private transactionService: TransactionService,
    private formBuilder: FormBuilder,
    private loadingCtrl: LoadingController,
    private navParams: NavParams,
    private viewCtrl: ViewController,
    private ga: GoogleAnalytics
  ) {

    this.offer = navParams.get('offer');


    this.transactionForm = formBuilder.group({
      to: ['', Validators.required]
    });
    this.transactionForm.patchValue({ to: this.offer.seller });
  }

  onSubmit(formValues, formValid) {

    if(!formValid)
      return;

    if(this.user.balance < this.offer.price) {
      this.error = "Not enough circles";
      this.notificationsService.create('Purchase Fail','','error');
      let msg = "You don't have enough Circles!";
      this.notificationsService.create('Balance', msg, 'warn');
      this.viewCtrl.dismiss(false);
      return;
    }

    this.loading = this.loadingCtrl.create({
      content: 'Purchasing ...',
      //dismissOnPageChange: true
    });

    this.loading.present();

    let intent = this.transactionService.createPurchaseIntent(this.offer.seller, this.offer);
    intent.then( res => {
      this.loading.dismiss();
      this.closeModal();
    });
    intent.catch( err => {
      console.error(err);
      this.error = err;
      this.loading.dismiss();
      this.closeModal();
    });
  }

  closeModal() {
    this.viewCtrl.dismiss(false);
  }

  ionViewDidLoad() {
    this.ga.trackView('Purchase Modal');

    this.userSub$ = this.userService.user$.subscribe(
      user => this.user = user,
      err => console.error(err),
      () => {}
    );

    this.userService.keyToUserName$(this.offer.seller).take(1).subscribe( (sellerName) => {
        this.sellerName = sellerName;
    });
  }

  ionViewWillUnload () {
    this.userSub$.unsubscribe();
  }

}
