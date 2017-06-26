import { Component } from '@angular/core';
import { Events, IonicPage, Nav, NavController, NavParams, Toast, ToastController } from 'ionic-angular';

import { Subscription } from 'rxjs/Subscription';
import { AngularFireAuth } from 'angularfire2/auth';

import { GroupsPage } from '../groups/groups';
import { SendPage } from '../send/send';
import { HomePage } from '../home/home';
import { OfferPage } from '../offer/offer';
import { UserService } from '../../providers/user-service/user-service';
import { User } from '../../interfaces/user-interface';

@IonicPage()
@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  private user: User;
  private userSub$: Subscription;

  private toast: Toast

  private tab1Root = HomePage;
  private tab2Root = GroupsPage;
  private tab3Root = SendPage;
  private tab4Root = OfferPage;

  private nav: Nav;

  private pageTitle: string = "Home";

  constructor(
    private navParams: NavParams,
    private toastCtrl: ToastController,
    private userService: UserService
  ) {

    this.nav = this.navParams.get('nav');
  }

  private onTabSelect(event: any):void {
    this.pageTitle = event.id;
  }

  ionViewDidLoad() {

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
      () => console.log('tab ionViewDidLoad userSub$ obs complete')
    );
  }

  ionViewWillUnload () {
    this.userSub$.unsubscribe();
  }

}
