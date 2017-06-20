import { Pipe, PipeTransform } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Pipe({
  name: 'keytousername',
  pure: false
})
export class KeyToUserNamePipe implements PipeTransform {

  constructor(private db: AngularFireDatabase) {
  }

  transform(key: string): Observable<any> {

    return this.db.object('/users/'+key).map( user => user.displayName);
  }
}
