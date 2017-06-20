import { Component } from '@angular/core';
import { IonicPage, NavParams, ViewController, LoadingController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { TransactionService } from '../../providers/transaction-service/transaction-service';
import { NotificationsService } from 'angular2-notifications';

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
  private error: any;

  private loading: any;

  private transactionForm: FormGroup;

  constructor(private newsService: NewsService, private userService: UserService, private notificationsService: NotificationsService, private transactionService: TransactionService, private formBuilder: FormBuilder, private loadingCtrl: LoadingController, private navParams: NavParams, private viewCtrl: ViewController) {

    userService.userSubject.subscribe(
      user => this.user = user,
      err => console.error(err),
      () => {}
    );

    this.offer = navParams.get('offer');
    userService.keyToUserName(this.offer.seller).subscribe( (sellerName) => {
        this.offer.sellerName = sellerName;
    });

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
      content: 'Purchasing ...'
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
    console.log('ionViewDidLoad PurchaseModal');
  }

}
