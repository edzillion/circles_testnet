import { Inject, Injectable, OnDestroy } from '@angular/core';

import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import 'rxjs/add/operator/find';

import { APP_CONFIG } from '../../app/app-config.constants';
import { IAppConfig } from '../../app/app-config.interface';

@Injectable()
export class UserService implements OnDestroy {

  public initSubject$: ReplaySubject<any> = new ReplaySubject<any>(1);

  private userSubject$: BehaviorSubject<any>;
  private usersSubject$: ReplaySubject<any> = new ReplaySubject<any>(1);

  public user$: Observable<any>;
  public users$ = this.usersSubject$.asObservable();
  public auth: any;

  private authSub$: Subscription;
  private userSub$: Subscription;
  private usersSub$: Subscription;

  private user: any;

  constructor(
    private afAuth: AngularFireAuth,
    private db: AngularFireDatabase
  ) {

    this.auth = this.afAuth.auth;
    this.authSub$ = this.afAuth.authState.subscribe(
      auth => {
        if (auth) {
          let userSub = this.db.object('/users/' + auth.uid).subscribe(
            user => {
              if (user.$exists()) {

                // at this point the user has a login and has a user profile.
                // set up this service's user subscrioption and then called
                // this.initSubject.next(false); to end the initialisation process
                userSub.unsubscribe();
                this.userSubject$ = new BehaviorSubject(user);
                this.user$ = this.userSubject$.asObservable();
                // this.userSubject$ is our app wide current user Subscription
                this.userSub$ = this.db.object('/users/' + auth.uid).subscribe(
                  user => {
                    this.user = user;
                    this.userSubject$.next(user);
                  },
                  error => console.log('Could not load current user record.')
                );
                // is it worth having a separate subscription for the current user & all users?
                this.usersSub$ = this.db.list('/users/').subscribe(
                  users => {
                    //clone the users array so that we don't change a user accidentally
                    //Object.assign(this.dataStore.users, users);
                    this.usersSubject$.next(users);
                  },
                  error => console.log('Could not load users.')
                );

                this.initSubject$.next(false);
              }
              else {
                this.initSubject$.next(auth);
              }
            },
            err => console.error(err),
            () => {}
          )
        }
      },
      err => console.error(err),
      () => {}
    )
  }

  public keyToUser$(key: string): Observable<any> {
    return this.users$.map(
      users => users.find(user => user.$key === key)
    );
  }

  public keyToUserName$(key: string): Observable<any> {
    return this.users$.map(users => {
      let u = users.find( user => user.$key === key);
      return u.displayName;
    });
  }

  public filterUsers$(searchTerm: string) {
    if (!searchTerm)
      return false; //todo: should this return an observable(false) or something?
    return this.users$.map( (users) => {
      return users.filter( (user) => {
        if (user.$key == 'undefined' || (user.$key == this.user.$key))
          return false;
        let s = searchTerm.toLowerCase();
        let d = user.displayName.toLowerCase();
        return d.indexOf(s) > -1;
      });
    });
  }

  public save(user) {
    this.user.set(user);
  }

  ngOnDestroy () {
    this.authSub$.unsubscribe();
    this.userSub$.unsubscribe();
    this.usersSub$.unsubscribe();
  }
}
