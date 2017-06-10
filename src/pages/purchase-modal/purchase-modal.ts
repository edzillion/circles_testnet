import { Component } from '@angular/core';
import { IonicPage, NavParams, ViewController, LoadingController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { TransactionService } from '../../providers/transaction-service/transaction-service';
import { NotificationsService } from 'angular2-notifications';

import { UserService } from '../../providers/user-service/user-service';
import { NewsService } from '../../providers/news-service/news-service';

import * as firebase from 'firebase/app';

import { KeyToUserNamePipe } from '../../pipes/key-to-username/key-to-username';

@IonicPage()
@Component({
  selector: 'page-purchase-modal',
  templateUrl: 'purchase-modal.html'
})
export class PurchaseModal {

  private _sellerName: string;
  private _offer: any;

  private user: any;
  private _error: any;

  private _formState = {
    submitAttempt: <boolean>false,
    loading: <any>{}
  };

  private _transactionForm: FormGroup;

  constructor(private newsService: NewsService, private _keyToUserNamePipe: KeyToUserNamePipe, private userService: UserService, private notificationsService: NotificationsService, private _transactionService: TransactionService, private _formBuilder: FormBuilder, private _loadingCtrl: LoadingController, private _navParams: NavParams, private _viewCtrl: ViewController) {

    userService.userSubject.subscribe(
      user => this.user = user.balance,
      err => console.error(err),
      () => {debugger}
    );

    this._offer = _navParams.get('offer');
    debugger;
    _keyToUserNamePipe.transform(this._offer.sellerKey).subscribe( (sellerName) => {
        this._sellerName = sellerName;
    });

    //for form submit
    //todo: really don't need this to be a form
    this._formState.loading = this._loadingCtrl.create({
      content: 'Saving Profile ...'
    });

    this._transactionForm = _formBuilder.group({
      to: ['', Validators.required]
    });
    this._transactionForm.patchValue({ to: this._offer.sellerKey });
  }

  onSubmit(formValues, formValid) {

    if(!formValid)
      return;

    if(this.user.balance < this._offer.price) {
      this._error = "Not enough circles";
      return;
    }

    //todo: sort out where we want users and where we want keys
    if (this._transactionService.createPurchaseIntent(this.user.$key, this._offer.sellerKey, this._offer)) {
      this._offer.timestamp = firebase.database['ServerValue']['TIMESTAMP'];
      this._offer.type = 'purchase';
      this.newsService.addNewsItem(this._offer);
      this.notificationsService.create('Purchase Success','','success');
      let msg = 'Bought ' + this._offer.title + ' from '+this._sellerName+' for '+this._offer.price+' Circles';
      this.notificationsService.create('Purchase', msg, 'info');
      this.closeModal();
    }
    else {
      return;
    }
  }

  closeModal() {
    this._viewCtrl.dismiss(false);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PurchaseModal');
  }

}
