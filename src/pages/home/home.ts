import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { MenuController } from 'ionic-angular';
import { IonicPage, NavParams, ModalController } from 'ionic-angular';
import { AnalyticsService } from '../../providers/analytics-service/analytics-service';

import { Subscription } from 'rxjs/Subscription';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

import { NewsService } from '../../providers/news-service/news-service';
import { UserService } from '../../providers/user-service/user-service';
import { NewsCardModule } from '../../components/news-card/news-card.module';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  private userFirstName: string;
  private user: any;
  private userSub$: Subscription;

  constructor(
    private userService: UserService,
    private newsService: NewsService,
    private analytics: AnalyticsService
  ) { }

  ionViewDidLoad() {
    this.analytics.trackPageView('Home Page');

    this.userSub$ = this.userService.user$.subscribe(
      user => {
        this.user = user;
      },
      err => console.error(err),
      () => {}
    );
  }

  ionViewWillUnload () {
    this.userSub$.unsubscribe();
  }

}
