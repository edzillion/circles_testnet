import { Component } from '@angular/core';
import { IonicPage, LoadingController, NavParams } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { FormBuilder, FormGroup, FormControl, Validators, } from '@angular/forms';

import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { NotificationsService } from 'angular2-notifications';
import { TransactionService } from '../../providers/transaction-service/transaction-service';
import { DataService } from '../../providers/data-service/data-service';
import { UserService } from '../../providers/user-service/user-service';

import 'rxjs/add/operator/debounceTime';

@IonicPage()
@Component({
  selector: 'page-send',
  templateUrl: 'send.html',
})
export class SendPage {

  private _searchTerm: string = '';
  private _searchUsers: any;
  private _searchControl: FormControl;

  private _sendForm: FormGroup;
  private _toUser: any;
  private user: any;

  private _error: string;

  loading: any;

  constructor(private userService: UserService, private _dataService: DataService, private _transactionService: TransactionService, private notificationsService: NotificationsService, private ga: GoogleAnalytics, private loadingCtrl: LoadingController, private formBuilder: FormBuilder, private _db: AngularFireDatabase, private navParams: NavParams) {

    userService.userSubject.subscribe(
      user => this.user = user,
      err => console.error(err),
      () => {}
    );

    this._searchControl = new FormControl();

    this._sendForm = formBuilder.group({
      toUserKey: ['',  Validators.required],
      amount: ['', Validators.required],
      message: ['']
    });

    //for form submit
    this.loading = loadingCtrl.create({
      content: 'Sending ...'
    });
  }

  setFilteredItems() {
      this._searchUsers = this._dataService.filterUsers(this._searchTerm);
   }

   clickUser(user) {
     this._toUser = user;
     this._sendForm.patchValue({toUserKey:user.$key});
     this._searchUsers = null;
   }

  onSubmit(formValues, formValid) {

    if (!formValid)
      return;

    if(this.user.balance < formValues.amount) {
      this._error = "Not enough circles";
      return;
    }
    this.loading.present();

    let transaction = {
      amount: <number>formValues.amount,
      to: formValues.toUserKey,
      from: this.user.$key,
      message: formValues.message,
      type: 'transaction'
    };

    if (this._transactionService.createTransactionIntent(formValues.toUserKey, formValues.amount, formValues.message)) {

      this.notificationsService.create('Send Success','','success');
      let msg = 'Sent ' + formValues.amount + ' Circles to ' + this._toUser.displayName;
      this.notificationsService.create('Transaction', msg, 'info');
    }
    else {
      return;
    }

    //reset the recipient field
    this._toUser = null;
    this._sendForm.reset();
    this.loading.dismiss();

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SendPage');
    this.setFilteredItems();
  }

}
