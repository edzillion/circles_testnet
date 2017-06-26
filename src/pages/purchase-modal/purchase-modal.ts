import { Component } from '@angular/core';
import { IonicPage, NavParams, ViewController, Loading, LoadingController, Toast, ToastController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AnalyticsService } from '../../providers/analytics-service/analytics-service';

import { Subscription } from 'rxjs/Subscription';
import { NotificationsService } from 'angular2-notifications';

import { TransactionService } from '../../providers/transaction-service/transaction-service';
import { UserService } from '../../providers/user-service/user-service';
import { User } from '../../interfaces/user-interface';
import { NewsService } from '../../providers/news-service/news-service';
import { Offer } from '../../interfaces/offer-interface';

@IonicPage()
@Component({
  selector: 'page-purchase-modal',
  templateUrl: 'purchase-modal.html'
})
export class PurchaseModal {

  private offer: Offer;
  private user: User;
  private userSub$: Subscription;
  private toast: Toast;
  private sellerName: string;

  private loading: Loading;

  private transactionForm: FormGroup;

  constructor(
    private analytics: AnalyticsService,
    private formBuilder: FormBuilder,
    private loadingCtrl: LoadingController,
    private navParams: NavParams,
    private notificationsService: NotificationsService,
    private toastCtrl: ToastController,
    private transactionService: TransactionService,
    private userService: UserService,
    private viewCtrl: ViewController
  ) {

    this.offer = navParams.get('offer');

    this.transactionForm = formBuilder.group({
      to: [null, Validators.required]
    });
    this.transactionForm.patchValue({ to: this.offer.seller });
  }

  private onSubmit(formData: any, formValid: boolean): void {

    if(!formValid)
      return;

    if(this.user.balance < this.offer.price) {
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
    intent.catch( error => {
      this.toast = this.toastCtrl.create({
        message: 'Error Puchase: '+error,
        duration: 3000,
        position: 'middle'
      });
      console.error(error);
      this.loading.dismiss();
      this.closeModal();
      this.toast.present();
    });
  }

  private closeModal(): void {
    this.viewCtrl.dismiss(false);
  }

  ionViewDidLoad() {
    this.analytics.trackPageView('Purchase Modal');

    this.userSub$ = this.userService.user$.subscribe(
      user => this.user = user,
      error => {
        this.toast = this.toastCtrl.create({
          message: 'Error getting user: '+error,
          duration: 3000,
          position: 'middle'
        });
        console.error(error);
        this.toast.present();
      },
      () => console.log('purchase-modal ionViewDidLoad userSub$ obs complete')
    );

    this.userService.keyToUserName$(this.offer.seller).take(1).subscribe( (sellerName) => {
        this.sellerName = sellerName;
    });
  }

  ionViewWillUnload () {
    this.userSub$.unsubscribe();
  }

}
