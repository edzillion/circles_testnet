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

  private user: FirebaseObjectObservable<any>;


  constructor(public afAuth: AngularFireAuth, private db: AngularFireDatabase, @Inject( APP_CONFIG ) private config: IAppConfig) {


    this.authSub = afAuth.authState.subscribe(
      auth => {
        debugger;
        if (auth) {
          let userSub = this.db.object('/users/' + auth.uid).first().subscribe(
            user => {
              if (user.$exists()) {
                this.user = user;
                this.authSub.unsubscribe();
              }
              else {
                this.initSubject.next(auth);
                console.error('this shouldnt happen? user.$exists() false')
              }
            },
            err => console.error(err),
            () => {
              userSub.unsubscribe();
              this.db.object('/users/' + auth.uid).subscribe(
                user => {
                  this.userSubject = new BehaviorSubject(user);
                  this.initSubject.next(false);
                }
              );
            }
          )
        }
      },
      err => console.error(err),
      () => {}
    )
  }

}
