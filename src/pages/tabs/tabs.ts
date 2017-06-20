import { Component } from '@angular/core';
import { Events, IonicPage, NavController, NavParams } from 'ionic-angular';

import { GroupsPage } from '../groups/groups';
import { SendPage } from '../send/send';
import { HomePage } from '../home/home';
import { OfferPage } from '../offer/offer';

import { AngularFireAuth } from 'angularfire2/auth';

import { UserService } from '../../providers/user-service/user-service';

@IonicPage()
@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  private user: any;

  tab1Root = HomePage;
  tab2Root = GroupsPage;
  tab3Root = SendPage;
  tab4Root = OfferPage;

  private nav: any;

  private pageTitle: string = "Home";

  constructor(private userService: UserService, public events: Events, public navParams: NavParams, private afAuth: AngularFireAuth, public navCtrl: NavController) {
    this.nav = this.navParams.get('nav');

    userService.userSubject.subscribe(
      user => this.user = user,
      err => console.error(err),
      () => {}
    );
  }

  onTabSelect(event) {
    this.pageTitle = event.id
  }

  ionViewDidLoad() {
    //this._marginTopOffset = this.header.getElementRef().nativeElement.offsetHeight + 'px';
  }
}
