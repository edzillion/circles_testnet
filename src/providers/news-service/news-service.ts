import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs';

import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

import { KeyToUserPipe } from '../../pipes/key-to-user/key-to-user';

import { NotificationsService } from 'angular2-notifications';
import { UserService } from '../../providers/user-service/user-service';

import * as firebase from 'firebase/app';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/combineLatest';

import { Subscription } from 'rxjs/Subscription';

@Injectable()
export class NewsService {

  private userSub: Subscription;

  private user: any;

  private _dbNewsItems: FirebaseListObservable<any>;
  private _newsItems: BehaviorSubject<Array<string>> = new BehaviorSubject([]);

  constructor(private userService: UserService, private notificationsService: NotificationsService, private _db: AngularFireDatabase, private _keyToUserPipe: KeyToUserPipe) {

    //this needs to make sure we have the user key so we will instead get the Observable and sub to that
    userService.userSubject.subscribe(
      user => {
        this.user = user;
        this.setupDBQuery(user);
      },
      err => console.error(err),
      () => {}
    );
  }

  setupDBQuery(user) {

    this._dbNewsItems = this._db.list('/users/' + user.$key + '/log/');
    let twoMinsAgo = Date.now() - 120000;
    this._dbNewsItems.$ref
      .orderByChild('timestamp')
      .startAt(twoMinsAgo)
      .on('child_added', (firebaseObj) => {
        let latestNewsItem = firebaseObj.val();

        //receiving from someone
        if (latestNewsItem.type == 'transaction' && latestNewsItem.to == user.$key) {
          this._keyToUserPipe.transform(latestNewsItem.from).subscribe((fromUser) => {
            let msg = 'Receieved ' + latestNewsItem.amount + ' Circles from ' + fromUser.displayName;
            this.notificationsService.create('Transaction', msg, 'info');
          });
        }
      });
          //sending to someone else
      //     if (latestNewsItem.to != user.key) {
      //       this._keyToUserPipe.transform(latestNewsItem.to).subscribe((toUser) => {
      //         let msg = 'Sent ' + latestNewsItem.amount + ' Circles to ' + toUser.displayName;
      //         this.notificationsService.create('Transaction', msg, 'info');
      //       });
      //     }
      //     else { //receiving from someone
      //       this._keyToUserPipe.transform(latestNewsItem.from).subscribe((fromUser) => {
      //         let msg = 'Receieved ' + latestNewsItem.amount + ' Circles from ' + fromUser.displayName;
      //         this.notificationsService.create('Transaction', msg, 'info');
      //       });
      //     }
      //   }
      //   else if (latestNewsItem.type == 'offerListed') {
      //     let msg = 'Listed ' + latestNewsItem.title + ' on market';
      //     this.notificationsService.create('Listing', msg, 'info');
      //   }
      //   else if (latestNewsItem.type == 'purchase') {
      //     let msg = 'Bought ' + latestNewsItem.title + ' from '+latestNewsItem.seller+' for '+latestNewsItem.price+' Circles';
      //     this.notificationsService.create('Purchase', msg, 'info');
      //   }
      //   else if (latestNewsItem.type == 'groupJoin') {
      //     let msg = 'You have joined the group: ' +latestNewsItem.title;
      //     this.notificationsService.create('Join', msg, 'info');
      //   }
      // });

    this._newsItems = Observable.combineLatest(this._dbNewsItems) as BehaviorSubject<any>;

  }

  public get allNewsItems(): Observable<any> {
    return this._newsItems;
  }

  public addNewsItem(newsItem) {
    this._dbNewsItems.push(newsItem);
  }

  public addPurchase(newsItem) {
    this._dbNewsItems.push(newsItem);
  }

  public addOffer(offerItem) {
    offerItem.type = 'offerListed';
    this._dbNewsItems.push(offerItem);
  }

  public addGroupJoin(group) {
    let newsItem = {
      timestamp: firebase.database['ServerValue']['TIMESTAMP'],
      title: group.displayName,
      type: 'groupJoin'
    };
    this._dbNewsItems.push(newsItem);
  };

}
