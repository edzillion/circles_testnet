import { Component } from '@angular/core';
import { IonicPage, Loading, LoadingController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { FormBuilder, FormGroup, FormControl, Validators, } from '@angular/forms';
import { AnalyticsService } from '../../providers/analytics-service/analytics-service';

import { Subscription } from 'rxjs/Subscription';
import { NotificationsService } from 'angular2-notifications';

import { TransactionService } from '../../providers/transaction-service/transaction-service';
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
  private userSub$: Subscription;

  private loading: Loading;

  constructor(
    private userService: UserService,
    private transactionService: TransactionService,
    private notificationsService: NotificationsService,
    private analytics: AnalyticsService,
    private loadingCtrl: LoadingController,
    private formBuilder: FormBuilder
  ) {

    this.searchControl = new FormControl();

    this.sendForm = formBuilder.group({
      toUserKey: ['', Validators.required],
      amount: ['', Validators.required],
      message: ['']
    });
  }

  private clickUser(user) {
    this.toUser = user;
    this.sendForm.patchValue({ toUserKey: user.$key });
    this.searchUsers = null;
  }

  private onSubmit(formValues, formValid) {

    //for form submit
    this.loading = this.loadingCtrl.create({
      content: 'Sending ...'
    });

    this.loading.present();

    if (!formValid)
      return;

    if (this.user.balance < formValues.amount) {
      this.notificationsService.create('Send Fail', '', 'error');
      let msg = "You don't have enough Circles!";
      this.notificationsService.create('Balance', msg, 'warn');
      this.loading.dismiss();
      return;
    }

    if (this.transactionService.createTransactionIntent(formValues.toUserKey, formValues.amount, formValues.message)) {
      //reset the recipient field
      this.toUser = null;
      this.sendForm.reset();
      this.loading.dismiss();
      return;
    }
    else {
      this.loading.dismiss();
      return;
    }
  }

  private setFilteredItems() {
    this.searchUsers = this.userService.filterUsers$(this.searchTerm);
  }

  ionViewDidLoad() {
    this.analytics.trackPageView('Send Page');

    this.userSub$ = this.userService.user$.subscribe(
      user => this.user = user,
      err => console.error(err),
      () => { }
    );
  }

  ionViewWillUnload() {
    this.userSub$.unsubscribe();
  }

}
