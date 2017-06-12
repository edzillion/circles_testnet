import { Component, OnInit, Input } from '@angular/core';
import { UserService } from '../../providers/user-service/user-service';

import { KeyToUserNamePipe } from '../../pipes/key-to-username/key-to-username';

@Component({
  selector: 'news-card',
  templateUrl: 'news-card.html'
})
export class NewsCard { // implements OnInit{

  @Input('newsItem') newsItem: any;
  private user: any;

  constructor(private _keyToUserNamePipe: KeyToUserNamePipe, private userService: UserService) {
    userService.userSubject.subscribe(
      user => this.user = user,
      err => console.error(err),
      () => {}
    )
  }
}
