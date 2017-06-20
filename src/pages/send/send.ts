import { Component } from '@angular/core';
import { IonicPage, LoadingController, NavParams } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { FormBuilder, FormGroup, FormControl, Validators, } from '@angular/forms';

import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { NotificationsService, SimpleNotificationsComponent } from 'angular2-notifications';
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

  private searchTerm: string = '';
  private searchUsers: any;
  private searchControl: FormControl;

  private sendForm: FormGroup;
  private toUser: any;
  private user: any;

  private error: string;

  loading: any;

  constructor(
    private userService: UserService,
    private dataService: DataService,
    private transactionService: TransactionService,
    private notificationsService: NotificationsService,
    private ga: GoogleAnalytics,
    private loadingCtrl: LoadingController,
    private formBuilder: FormBuilder,
    private db: AngularFireDatabase,
    private navParams: NavParams
  ) {

    userService.userSubject.subscribe(
      user => this.user = user,
      err => console.error(err),
      () => {}
    );

    this.searchControl = new FormControl();

    this.sendForm = formBuilder.group({
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
      this.searchUsers = this.dataService.filterUsers(this.searchTerm);
   }

   clickUser(user) {
     this.toUser = user;
     this.sendForm.patchValue({toUserKey:user.$key});
     this.searchUsers = null;
   }

  onSubmit(formValues, formValid) {

    if (!formValid)
      return;

    if(this.user.balance < formValues.amount) {
      this.notificationsService.create('Send Fail','','error');
      let msg = "You don't have enough Circles!";
      this.notificationsService.create('Balance', msg, 'warn');
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

    if (this.transactionService.createTransactionIntent(formValues.toUserKey, formValues.amount, formValues.message)) {
      debugger
      this.notificationsService.create('Send Success','','success');
      let msg = 'Sent ' + formValues.amount + ' Circles to ' + this.toUser.displayName;
      this.notificationsService.create('Transaction', msg, 'info');
    }
    else {
      return;
    }

    //reset the recipient field
    this.toUser = null;
    this.sendForm.reset();
    this.loading.dismiss();

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SendPage');
    this.setFilteredItems();
  }

}
