import { Component, ViewChild } from '@angular/core';
import { Content , IonicPage } from 'ionic-angular';
import { GoogleAnalytics } from '@ionic-native/google-analytics';

import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { Subscription } from 'rxjs/Subscription';

import { UserService } from '../../providers/user-service/user-service';

@IonicPage()
@Component({
  selector: 'page-groups',
  templateUrl: 'groups.html'
})

export class GroupsPage {

  @ViewChild(Content) content: Content;

  private user: any;
  private userSub$: Subscription;

  private groups$: FirebaseListObservable<any>;
  private allRequirements$: FirebaseListObservable<any>;

  private contentHeight: number;

  constructor(
    private userService: UserService,
    private db: AngularFireDatabase,
    private ga: GoogleAnalytics
  ) { }

  private enterGroup(group,elementIndex) {
    group.state = 'active';
    this.scrollToElem('groupCard'+elementIndex);
    this.contentHeight = this.content.contentHeight -76;
  }

  private scrollToElem(elementId:string) {
    let yOffset = document.getElementById(elementId).offsetTop;
    this.content.scrollTo(0, yOffset, 500);
  }

  ionViewDidLoad() {

    this.ga.trackView('Groups Page');

    this.userSub$ = this.userService.user$.subscribe(
      user => this.user = user,
      err => console.error(err),
      () => {}
    );

    this.groups$ = this.db.list('/groups/')
      .map( groups => {
        for (let group of groups)
          group.state = 'inactive';
        return groups;
      }) as FirebaseListObservable<any>;

    this.allRequirements$ = this.db.list('static/groupRequirements');
  }

  ionViewWillUnload () {
    this.userSub$.unsubscribe();
  }

}
