import { Injectable, OnDestroy } from '@angular/core';

import { NotificationsService } from 'angular2-notifications';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import * as firebase from 'firebase/app';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/combineLatest';

import { UserService } from '../../providers/user-service/user-service';

@Injectable()
export class NewsService implements OnDestroy {

  private user: any;

  private dbNewsItems$: FirebaseListObservable<any>;
  private dbNewsSub$: Subscription;

  private newsItemsReversed$: BehaviorSubject<Array<string>> = new BehaviorSubject([]);
  private newsItems$: BehaviorSubject<Array<string>> = new BehaviorSubject([]);

  constructor(
    private userService: UserService,
    private notificationsService: NotificationsService,
    private db: AngularFireDatabase
  ) {

    //this needs to make sure we have the user key so we will instead get the Observable and sub to that
    this.userService.user$.take(1).subscribe(
      user => {
        this.user = user;
        this.setupDBQuery(user);
      },
      err => console.error(err),
      () => {}
    );
  }

  private setupDBQuery(user) {
    this.dbNewsItems$ = this.db.list('/users/' + user.$key + '/log/');
    let twoMinsAgo = Date.now() - 120000;
    this.dbNewsItems$.$ref
      .orderByChild('timestamp')
      .startAt(twoMinsAgo)
      .on('child_added', (firebaseObj,index) => {
        let latestNewsItem = firebaseObj.val();
        //receiving from someone
        if (latestNewsItem.type == 'transaction' && latestNewsItem.to == user.$key) {
          this.userService.keyToUser$(latestNewsItem.from).subscribe((fromUser) => {
            let msg = 'Receieved ' + latestNewsItem.amount + ' Circles from ' + fromUser.displayName;
            this.notificationsService.create('Transaction', msg, 'info');
          });
        }
        else if (latestNewsItem.type == 'sale') {
          this.userService.keyToUser$(latestNewsItem.from).subscribe((fromUser) => {
            let msg = fromUser.displayName+' has just bought ' + latestNewsItem.title + ' for '+latestNewsItem.amount+' Circles';
            this.notificationsService.create('Sale', msg, 'info');
          });
        }
      });

      this.dbNewsSub$ = this.dbNewsItems$.subscribe( (newsitems) => {
        let r = newsitems.sort((a,b) => a.timestamp < b.timestamp ? 1 : -1);
        this.newsItemsReversed$.next(r)
      });

      this.dbNewsItems$.subscribe(this.newsItems$);

  }

  public get allNewsItems$(): BehaviorSubject<any> {
    return this.newsItems$;
  }

  public get allnewsItemsReversed$(): BehaviorSubject<any> {
    return this.newsItemsReversed$;
  }

  public addTransaction(txItem) {
    //this will only be called for sending to someone else
    this.notificationsService.create('Send Success','','success');
    let msg = 'Sent ' + txItem.amount + ' Circles to ' + txItem.toUser.displayName;
    this.notificationsService.create('Transaction', msg, 'info');

    let newsItem = {
      timestamp: firebase.database['ServerValue']['TIMESTAMP'],
      amount: txItem.amount,
      to: txItem.to,
      type: 'transaction'
    };
    this.dbNewsItems$.push(newsItem);
  }

  public addPurchase(offer) {
    this.notificationsService.create('Purchase Success','','success');
    let msg = 'Bought ' + offer.title + ' from '+offer.sellerName+' for '+offer.price+' Circles';
    this.notificationsService.create('Purchase', msg, 'info');

    let newsItem = {
      timestamp: firebase.database['ServerValue']['TIMESTAMP'],
      title: offer.title,
      from: offer.seller,
      type: 'purchase'
    };
    this.dbNewsItems$.push(newsItem);
  }

  public addOfferListed(offer) {
    this.notificationsService.create('Listing Success','','success');
    let msg = 'Listed ' + offer.title + ' on market';
    this.notificationsService.create('Listing', msg, 'info');

    let newsItem = {
      timestamp: firebase.database['ServerValue']['TIMESTAMP'],
      title: offer.title,
      type: 'offerListed'
    };
    this.dbNewsItems$.push(newsItem);
  }

  public addGroupJoin(group) {
    this.notificationsService.create('Join Success','','success');
    let msg = 'You have joined the group: ' +group.displayName;
    this.notificationsService.create('Join', msg, 'info');

    let newsItem = {
      timestamp: firebase.database['ServerValue']['TIMESTAMP'],
      title: group.displayName,
      type: 'groupJoin'
    };
    this.dbNewsItems$.push(newsItem);
  };

  ngOnDestroy () {
    this.dbNewsSub$.unsubscribe();
  }

}
