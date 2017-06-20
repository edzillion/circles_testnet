import { Inject, Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { APP_CONFIG } from '../../app/app-config.constants';
import { IAppConfig } from '../../app/app-config.interface';

@Injectable()
export class UserService {

  public userSubject: BehaviorSubject<any>;
  public initSubject: ReplaySubject<any> = new ReplaySubject<any>(1);

  public authSub: Subscription;
  public auth: any;

  private user: any;

  constructor(public afAuth: AngularFireAuth, private db: AngularFireDatabase, @Inject( APP_CONFIG ) private config: IAppConfig) {

    this.auth = afAuth.auth;
    this.authSub = afAuth.authState.subscribe(
      auth => {
        if (auth) {
          let userSub = this.db.object('/users/' + auth.uid).subscribe(
            user => {
              if (user.$exists()) {
                this.user = user;
                // at this point the user has a login and a user profile.
                // set up this service's user subscrioption and then called
                // this.initSubject.next(false); to end the initialisation process
                userSub.unsubscribe();
                this.userSubject = new BehaviorSubject(user);
                //this.userSubject is our app wide user Subscription
                userSub = this.db.object('/users/' + auth.uid).subscribe(
                  user => this.userSubject.next(user)
                );
                this.initSubject.next(false);
              }
              else {
                this.initSubject.next(auth);
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

  keyToUser(key: string): Observable<any> {
    return this.db.object('/users/'+key).take(1);
  }

  keyToUserName(key: string): Observable<any> {
    return this.db.object('/users/'+key).take(1).map( (user) => user.displayName);
  }

  save(user) {
    this.user.set(user);
  }

  ngOnDestroy () {
    this.authSub.unsubscribe();
  }
}
