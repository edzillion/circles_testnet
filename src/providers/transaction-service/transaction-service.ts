import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

import { KeyToUserPipe } from '../../pipes/key-to-user/key-to-user';

import { NewsService } from '../../providers/news-service/news-service';
import { UserService } from '../../providers/user-service/user-service';

import * as firebase from 'firebase/app';

@Injectable()
export class TransactionService {

  public transact: Subject<any> = new Subject<any>();

  private user: any;
  private transactionLog: FirebaseListObservable<any>;

  constructor(private userService: UserService, private newsService: NewsService, private db: AngularFireDatabase, private keyToUserPipe: KeyToUserPipe) {

    userService.userSubject.subscribe(
      user => this.user = user,
      err => console.error(err),
      () => {}
    );

    this.transactionLog = db.list('/transactions/');
  }


  transfer(toUser, amount) {
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

  logTransfer(toUser, offer, type, message?) {

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
    this.transactionLog.push(logItem);

    //add to other user's log
    logItem.to = '';
    if (logItem.type == 'purchase')
      logItem.type = 'sale';

    let toUserLog = this.db.list('/users/'+toUser.$key+'/log/');
    toUserLog.push(logItem);
  }

  createPurchaseIntent(sellerUserId, offer): Promise<boolean> {
    let p = new Promise( (resolve, reject) => {
      this.keyToUserPipe.transform(sellerUserId).subscribe( (sellerUser) => {
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

  createTransactionIntent(toUserId:string, amount:number, message?:string): Promise<boolean> {
    let p = new Promise( (resolve, reject) => {
      this.keyToUserPipe.transform(toUserId).subscribe( (toUser) => {
        if(this.transfer(toUserId, amount)) {
          let offerObj = {
            price:amount,
            title:'Transaction',
            to: toUserId,
            toUser: toUser
          };
          this.logTransfer(toUserId, offerObj, 'transfer', message);
          this.newsService.addTransaction(offerObj);
          resolve(true);
        }
        else
          reject(new Error("Purchase Failed"));
      });
    });

    return p;
  }
}
