import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import 'rxjs/add/operator/map';

import { UserService } from '../../providers/user-service/user-service';

@Injectable()
export class DataService {

  private userList: FirebaseListObservable<any>;
  private user: any;

  constructor(private userService: UserService, private _db: AngularFireDatabase ) {

    userService.userSubject.subscribe(
      user => this.user = user,
      err => console.error(err),
      () => {}
    );

    this.userList = _db.list('/users/');
  }

  filterUsers(searchTerm) {
    if (!searchTerm)
      return false;
    return this.userList.map( (users) => {
      return users.filter( (user) => {
        if (user.$key == 'undefined' || (user.$key == this.user.$key))
          return false;
        let s = searchTerm.toLowerCase();
        let d = user.displayName.toLowerCase();
        return d.indexOf(s) > -1;
      });
    });
  }

}
