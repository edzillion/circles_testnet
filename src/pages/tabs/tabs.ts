import { Component, ViewChild, OnInit } from '@angular/core';
import { AfterViewInit } from '@angular/core';
import { Content, Events, Header, IonicPage, NavController, NavParams } from 'ionic-angular';

import { GroupsPage } from '../groups/groups';
import { SendPage } from '../send/send';
import { HomePage } from '../home/home';
import { LoginPage } from '../login/login';
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

  private _nav: any;

  private _pageTitle: string = "Home";

  constructor(private userService: UserService, public events: Events, public navParams: NavParams, private afAuth: AngularFireAuth, public navCtrl: NavController) {
    this._nav = this.navParams.get('nav');
  }

  onTabSelect(event) {
    this._pageTitle = event.id
  }

  ionViewDidLoad() {
    //this._marginTopOffset = this.header.getElementRef().nativeElement.offsetHeight + 'px';
  }
}
