import { Component, ViewChild } from '@angular/core';
import { Content , IonicPage, Toast, ToastController } from 'ionic-angular';
import { AnalyticsService } from '../../providers/analytics-service/analytics-service';

import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { Subscription } from 'rxjs/Subscription';

import { UserService } from '../../providers/user-service/user-service';
import { User } from '../../interfaces/user-interface';
import { Group } from '../../interfaces/group-interface';

@IonicPage()
@Component({
  selector: 'page-groups',
  templateUrl: 'groups.html'
})

export class GroupsPage {

  @ViewChild(Content) content: Content;

  private user: User;
  private userSub$: Subscription;

  private groups$: FirebaseListObservable<Group[]>;
  private allRequirements$: FirebaseListObservable<string[]>;

  private contentHeight: number;

  private toast: Toast;

  constructor(
    private analytics: AnalyticsService,
    private db: AngularFireDatabase,
    private toastCtrl: ToastController,
    private userService: UserService
  ) { }

  //currently unused but was prev used for centering the group
  private enterGroup(group: Group, elementIndex: number): void {
    this.scrollToElem('groupCard'+elementIndex);
    this.contentHeight = this.content.contentHeight -76;
  }

  private scrollToElem(elementId:string): void {
    let yOffset = document.getElementById(elementId).offsetTop;
    this.content.scrollTo(0, yOffset, 500);
  }

  ionViewDidLoad() {

    this.analytics.trackPageView('Groups Page');

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
      () => console.log('groups ionViewDidLoad userSub$ obs complete')
    );

    this.groups$ = this.db.list('/groups/');

    this.allRequirements$ = this.db.list('static/groupRequirements');
  }

  ionViewWillUnload () {
    this.userSub$.unsubscribe();
    this.groups$.subscribe().unsubscribe();
    this.allRequirements$.subscribe().unsubscribe();
  }

}
