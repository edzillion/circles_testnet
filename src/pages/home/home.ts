import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { MenuController } from 'ionic-angular';
import { IonicPage, NavParams, ModalController, Toast, ToastController } from 'ionic-angular';
import { AnalyticsService } from '../../providers/analytics-service/analytics-service';

import { Subscription } from 'rxjs/Subscription';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

import { NewsCardModule } from '../../components/news-card/news-card.module';
import { NewsService } from '../../providers/news-service/news-service';
import { UserService } from '../../providers/user-service/user-service';
import { PushService } from '../../providers/push-service/push-service';
import { User } from '../../interfaces/user-interface';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  private userFirstName: string;
  private user: User;
  private userSub$: Subscription;

  private toast: Toast;

  constructor(
    private analytics: AnalyticsService,
    private newsService: NewsService,
    private toastCtrl: ToastController,
    private userService: UserService,
    private pushService: PushService
  ) { }

  ionViewDidLoad() {
    this.analytics.trackPageView('Home Page');

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
      () => console.log('home ionViewDidLoad userSub$ obs complete')
    );
  }

  ionViewWillUnload () {
    this.userSub$.unsubscribe();
  }

}
