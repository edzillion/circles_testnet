import { Injectable, OnDestroy } from '@angular/core';

import { NotificationsService } from 'angular2-notifications';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import * as firebase from 'firebase/app';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/combineLatest';

import { UserService } from '../../providers/user-service/user-service';
import { User } from '../../interfaces/user-interface';
import { NewsItem } from '../../interfaces/news-item-interface';
import { Offer } from '../../interfaces/offer-interface';
import { Group } from '../../interfaces/group-interface';

@Injectable()
export class NewsService implements OnDestroy {

  private user: User;

  private dbNewsItems$: FirebaseListObservable<NewsItem[]>;
  private dbNewsSub$: Subscription;

  private newsItemsReversed$: BehaviorSubject<NewsItem[]> = new BehaviorSubject([]);
  private newsItems$: BehaviorSubject<NewsItem[]> = new BehaviorSubject([]);

  constructor(
    private userService: UserService,
    private notificationsService: NotificationsService,
    private db: AngularFireDatabase
  ) {

    this.userService.user$.take(1).subscribe(
      user => {
        this.user = user;
        this.setupDBQuery(user);
      },
      error => console.error(error),
      () => console.log('news-service constructor user$ obs complete')
    );
  }

  private setupDBQuery(user: User):void {

    // sets up a db list binding that will initially return all messages from the last
    // two minutes and then any added to the list after that.
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

      this.dbNewsSub$ = this.dbNewsItems$.subscribe(
        newsitems => {
          let r = newsitems.sort((a,b) => a.timestamp < b.timestamp ? 1 : -1);
          this.newsItemsReversed$.next(r)
        },
        error => {
          console.log("Firebase Error: " + error);
        },
        () => console.log('news-service setupDBQuery dbNewsSub$ obs complete')
      );

      this.dbNewsItems$.subscribe(this.newsItems$);

  }

  public get allNewsItems$(): BehaviorSubject<NewsItem[]> {
    return this.newsItems$;
  }

  public get allnewsItemsReversed$(): BehaviorSubject<NewsItem[]> {
    return this.newsItemsReversed$;
  }

  public addTransaction(txItem: any):void {
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

  public addPurchase(offer: Offer):void {
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

  public addOfferListed(offer: Offer):void {
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

  public addGroupJoin(group: Group):void {
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
