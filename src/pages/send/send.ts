import { Component } from '@angular/core';
import { IonicPage, Loading, LoadingController, Toast, ToastController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { FormBuilder, FormGroup, FormControl, Validators, } from '@angular/forms';


import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { NotificationsService } from 'angular2-notifications';
import 'rxjs/add/operator/debounceTime';

import { TransactionService } from '../../providers/transaction-service/transaction-service';
import { UserService } from '../../providers/user-service/user-service';
import { User } from '../../interfaces/user-interface';
import { AnalyticsService } from '../../providers/analytics-service/analytics-service';

@IonicPage()
@Component({
  selector: 'page-send',
  templateUrl: 'send.html',
})
export class SendPage {

  private searchTerm: string = '';
  private searchUsers$: Observable<User[]> | boolean;
  private searchControl: FormControl;

  private sendForm: FormGroup;
  private toUser: User;
  private user: User;
  private userSub$: Subscription;

  private loading: Loading;
  private toast: Toast;

  constructor(
    private analytics: AnalyticsService,
    private formBuilder: FormBuilder,
    private loadingCtrl: LoadingController,
    private notificationsService: NotificationsService,
    private toastCtrl: ToastController,
    private transactionService: TransactionService,
    private userService: UserService
  ) {

    this.searchControl = new FormControl();

    this.sendForm = formBuilder.group({
      toUserKey: [null, Validators.required],
      amount: [null, Validators.required],
      message: [null]
    });
  }

  private clickUser(user: User):void {
    this.toUser = user;
    this.sendForm.patchValue({ toUserKey: user.$key });
    this.searchUsers$ = null;
  }

  private onSubmit(formData: any, formValid: boolean): void {

    if (!formValid)
      return;

    this.loading = this.loadingCtrl.create({
      content: 'Sending ...'
    });
    this.loading.present();

    if (this.user.balance < formData.amount) {
      this.notificationsService.create('Send Fail', '', 'error');
      let msg = "You don't have enough Circles!";
      this.notificationsService.create('Balance', msg, 'warn');
      this.loading.dismiss();
      return;
    }

    if (this.transactionService.createTransactionIntent(formData.toUserKey, formData.amount, formData.message)) {
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

  private setFilteredItems(): void {
    this.searchUsers$ = this.userService.filterUsers$(this.searchTerm);
  }

  ionViewDidLoad() {
    this.analytics.trackPageView('Send Page');

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
      () => console.log('send ionViewDidLoad userSub$ obs complete')
    );
  }

  ionViewWillUnload() {
    this.userSub$.unsubscribe();
    if (this.searchUsers$ && typeof this.searchUsers$ !== "boolean")
      this.searchUsers$.subscribe().unsubscribe();
  }

}
