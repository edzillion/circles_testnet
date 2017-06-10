import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

import { KeyToUserPipe } from '../../pipes/key-to-user/key-to-user';

import { NewsService } from '../../providers/news-service/news-service';

import * as firebase from 'firebase/app';

@Injectable()
export class TransactionService {

  public transact: Subject<any> = new Subject<any>();

  private _transactionIntent = {
    fromUser: <string> null,
    toUser: <string> null,
    item: <any> {title:null},
    amount:<number>100
  }

  private _transactionLog: FirebaseListObservable<any>;

  constructor(private newsService: NewsService, private _db: AngularFireDatabase, private _keyToUserPipe: KeyToUserPipe) {

    this._transactionLog = _db.list('/transactions/');
  }


  //todo: why is amount a string here?!!?!?!
  transfer(fromUser, toUser, amount, message?) {

    //todo: replace all this with a user interface (model)
    let fromUserBalance: number = +fromUser.balance;
    let toUserBalance: number = +toUser.balance;
    let txAmount: number = +amount;

    if (fromUserBalance < txAmount)
      return false;

    fromUserBalance -= txAmount;
    toUserBalance += txAmount;
    this._db.object('/users/'+fromUser.$key).update({balance: fromUserBalance});
    this._db.object('/users/'+toUser.$key).update({balance: toUserBalance});

    let logItem = {
      "from" : fromUser.$key,
      "to" : toUser.$key,
      "timestamp" : firebase.database['ServerValue']['TIMESTAMP'],
      "amount" : <number>amount,
      "type": 'transaction',
      "message": message || ''
    };

    //add to the main t log
    this._transactionLog.push(logItem);
    // add to my log
    this.newsService.addNewsItem(logItem);
    //add to other user's log
    let toUserLog = this._db.list('/users/'+toUser.$key+'/log/');
    toUserLog.push(logItem);
  }

  createPurchaseIntent(buyerUserId, sellerUserId, offer): boolean {

    let buyerUser = this._keyToUserPipe.transform(buyerUserId);
    let sellerUser = this._keyToUserPipe.transform(sellerUserId);

    Observable.forkJoin(buyerUser,sellerUser).subscribe( (res) => {
      this.transfer(res[0], res[1], offer.price);
    });
    return true;
  }

  createTransactionIntent(fromUserId:string, toUserId:string, amount:number, message?:string): boolean {

    let fUserId = this._keyToUserPipe.transform(fromUserId);
    let tUserId = this._keyToUserPipe.transform(toUserId);

    Observable.forkJoin(fUserId,tUserId).subscribe( (res) => {
      this.transfer(res[0], res[1], amount, message);
    });
    return true;
  }
}
