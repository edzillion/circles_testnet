import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { MenuController } from 'ionic-angular';

import { Subject } from 'rxjs/Subject';

import { IonicPage, NavParams, ModalController } from 'ionic-angular';

import { GoogleAnalytics } from '@ionic-native/google-analytics';

import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

import { NewsService } from '../../providers/news-service/news-service';
import { UserService } from '../../providers/user-service/user-service';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  private userFirstName: string;
  private userBalance: string;
  private user: any;

  members: Array<any>;
  circles: FirebaseListObservable<any>;
  transactions: FirebaseListObservable<any>;

  transactionsSubject: Subject<any>;

  constructor(private userService: UserService, private newsService: NewsService, private ga: GoogleAnalytics) {

    userService.userSubject.subscribe(
      user => this.user = user,
      err => console.error(err),
      () => {}
    );
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Home');
    this.ga.trackView('Home Page');
  }

}
