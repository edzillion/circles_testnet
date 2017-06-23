import { Pipe, PipeTransform } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Pipe({
  name: 'keytouser',
  pure: false
})
export class KeyToUserPipe implements PipeTransform {

  // private fetchedPromise: Promise<Object>;
  // private userName: string;

  constructor(private db: AngularFireDatabase) {

  }

  transform(key: string): Observable<any> {
    console.log('KeyToUserPipe called');
    return this.db.object('/users/'+key).take(1);
  }
}
