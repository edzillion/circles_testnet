import { Component, ViewChild } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Content , IonicPage, NavController, NavParams } from 'ionic-angular';

import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

import { UserService } from '../../providers/user-service/user-service';

@IonicPage()
@Component({
  selector: 'page-groups',
  templateUrl: 'groups.html',
  animations: [
    trigger('groupState', [
      state('inactive', style({
        color: '#eee'
      })),
      state('active',   style({
        color: '#cfd8dc'
      })),
      transition('inactive => active', animate('100ms ease-in')),
      transition('active => inactive', animate('100ms ease-out'))
    ])
  ]
})

export class GroupsPage {

  @ViewChild(Content) content: Content;

  private groups: FirebaseListObservable<any>;
  private allRequirements: FirebaseListObservable<any>;
  private user: any;

  contentHeight: number;

  constructor(private userService: UserService, private db: AngularFireDatabase, public navCtrl: NavController, public navParams: NavParams) {

    userService.userSubject.subscribe(
      user => this.user = user,
      err => console.error(err),
      () => {}
    );

    this.groups = db.list('/groups/')
      .map( groups => {
        for (let group of groups)
          group.state = 'inactive';
        return groups;
      }) as FirebaseListObservable<any>;

    this.allRequirements = db.list('static/groupRequirements')
  }

  enterGroup(group,elementIndex) {
    group.state = 'active';
    this.scrollToElem('groupCard'+elementIndex);
    this.contentHeight = this.content.contentHeight -76;
  }

  scrollToElem(elementId:string) {
    let yOffset = document.getElementById(elementId).offsetTop;
    this.content.scrollTo(0, yOffset, 500);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GroupsPage');
  }

}
