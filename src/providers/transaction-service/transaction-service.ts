import { Injectable, OnDestroy } from '@angular/core';

import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import * as firebase from 'firebase/app';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/map';

import { NewsService } from '../../providers/news-service/news-service';
import { UserService } from '../../providers/user-service/user-service';
import { User } from '../../interfaces/user-interface';
import { NewsItem } from '../../interfaces/news-item-interface';
import { LogItem } from '../../interfaces/log-item-interface';
import { Offer } from '../../interfaces/offer-interface';

@Injectable()
export class TransactionService implements OnDestroy {

  public transact: Subject<any> = new Subject<any>();

  private user: User;
  private userSub$: Subscription;
  private toUserLog$: FirebaseListObservable<NewsItem[]>;
  private transactionLog$: FirebaseListObservable<LogItem[]>;

  constructor(
    private db: AngularFireDatabase,
    private newsService: NewsService,
    private userService: UserService
  ) {

    this.userSub$ = this.userService.user$.subscribe(
      user => this.user = user,
      error => console.error(error),
      () => console.log('transaction-service constructor userSub$ obs complete')
    );

    this.transactionLog$ = this.db.list('/transactions/');
  }

  private  async transfer(toUser:User, amount:number) {
    if (this.user.balance < amount)
      return false;
    let myBalance: number = +this.user.balance;
    let toUserBalance: number = +toUser.balance;
    let txAmount: number = +amount;
    myBalance -= txAmount;
    toUserBalance += txAmount;
    //todo: add error handling here
    try {
      let a = await this.db.object('/users/'+this.user.$key).update({balance: myBalance});
      let b = await this.db.object('/users/'+toUser.$key).update({balance: toUserBalance});
    }
    catch (error) {
      console.error(error);
      throw new Error("Purchase fail");
    }
    return true;
  }

  private logTransfer(toUser: User, offer: Offer, type: string, message?: string):void {

    let logItem = {
      "from" : this.user.$key,
      "to" : toUser.$key,
      "timestamp" : firebase.database['ServerValue']['TIMESTAMP'],
      "amount" : <number>offer.price,
      "message": message || '',
      "title": offer.title,
      "type": type
    } as LogItem;

    //add to the main transaction log
    this.transactionLog$.push(logItem);

    //add to other user's log
    logItem.to = '';
    if (logItem.type == 'purchase')
      logItem.type = 'sale';

    this.toUserLog$ = this.db.list('/users/'+toUser.$key+'/log/');
    this.toUserLog$.push(logItem);

  }

  public createPurchaseIntent(sellerUserId:string, offer: Offer): Promise<any> {
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

  public createTransactionIntent(toUserId:string, amount:number, message?:string): Promise<any> {
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
          this.logTransfer(toUser, <any>offerObj, 'transfer', message);
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
    this.toUserLog$.subscribe().unsubscribe();
  }

}
