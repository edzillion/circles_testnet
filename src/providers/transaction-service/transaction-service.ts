import { Injectable, OnDestroy } from '@angular/core';

import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import * as firebase from 'firebase/app';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/map';

import { NewsService } from '../../providers/news-service/news-service';
import { UserService } from '../../providers/user-service/user-service';

@Injectable()
export class TransactionService implements OnDestroy {

  public transact: Subject<any> = new Subject<any>();

  private user: any;
  private userSub$: Subscription;
  private transactionLog$: FirebaseListObservable<any>;

  constructor(
    private userService: UserService,
    private newsService: NewsService,
    private db: AngularFireDatabase
  ) {

    this.userSub$ = this.userService.user$.subscribe(
      user => this.user = user,
      err => console.error(err),
      () => {}
    );

    this.transactionLog$ = this.db.list('/transactions/');
  }

  private transfer(toUser, amount) {
    let myBalance: number = +this.user.balance;
    let toUserBalance: number = +toUser.balance;
    let txAmount: number = +amount;

    if (myBalance < txAmount)
      return false;

    myBalance -= txAmount;
    toUserBalance += txAmount;
    this.db.object('/users/'+this.user.$key).update({balance: myBalance});
    this.db.object('/users/'+toUser.$key).update({balance: toUserBalance});
    return true;
  }

  private logTransfer(toUser, offer, type, message?) {

    let logItem = {
      "from" : this.user.$key,
      "to" : toUser.$key,
      "timestamp" : firebase.database['ServerValue']['TIMESTAMP'],
      "amount" : <number>offer.price,
      "message": message || '',
      "title": offer.title,
      "type": type
    };

    //add to the main transaction log
    this.transactionLog$.push(logItem);

    //add to other user's log
    logItem.to = '';
    if (logItem.type == 'purchase')
      logItem.type = 'sale';

    let toUserLog = this.db.list('/users/'+toUser.$key+'/log/');
    toUserLog.push(logItem);
  }

  public createPurchaseIntent(sellerUserId, offer) {
    let p = new Promise( (resolve, reject) => {
      this.userService.keyToUser$(sellerUserId).take(1).subscribe( (sellerUser) => {
        if (this.transfer(sellerUser, offer.price)) {
          this.logTransfer(sellerUser, offer, 'purchase');
          this.newsService.addPurchase(offer);
          resolve(true);
        }
        else
          reject(new Error("Purchase Failed"));
      });
    });

    return p;
  }

  public createTransactionIntent(toUserId:string, amount:number, message?:string) {
    let p = new Promise( (resolve, reject) => {
      this.userService.keyToUser$(toUserId).take(1).subscribe( (toUser) => {
        if(this.transfer(toUser, amount)) {
          let offerObj = {
            amount: amount,
            price: amount,
            title:'Transaction',
            to: toUserId,
            toUser: toUser
          };
          this.logTransfer(toUser, offerObj, 'transfer', message);
          this.newsService.addTransaction(offerObj);
          resolve(true);
        }
        else
          reject(new Error("Purchase Failed"));
      });
    });

    return p;
  }

  ngOnDestroy() {
    this.userSub$.unsubscribe();
  }

}
