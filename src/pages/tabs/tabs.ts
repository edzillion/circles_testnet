import { Component } from '@angular/core';
import { Events, IonicPage, Nav, NavController, NavParams } from 'ionic-angular';

import { Subscription } from 'rxjs/Subscription';
import { AngularFireAuth } from 'angularfire2/auth';

import { GroupsPage } from '../groups/groups';
import { SendPage } from '../send/send';
import { HomePage } from '../home/home';
import { OfferPage } from '../offer/offer';
import { UserService } from '../../providers/user-service/user-service';

@IonicPage()
@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  private user: any;
  private userSub$: Subscription;

  private tab1Root = HomePage;
  private tab2Root = GroupsPage;
  private tab3Root = SendPage;
  private tab4Root = OfferPage;

  private nav: Nav;

  private pageTitle: string = "Home";

  constructor(
    private userService: UserService,
    private navParams: NavParams
  ) {

    this.nav = this.navParams.get('nav');
  }

  private onTabSelect(event) {
    this.pageTitle = event.id
  }

  ionViewDidLoad() {

    this.userSub$ = this.userService.user$.subscribe(
      user => this.user = user,
      err => console.error(err),
      () => {}
    );
  }

  ionViewWillUnload () {
    this.userSub$.unsubscribe();
  }

}
