import { Component, Input } from '@angular/core';
import { UserService } from '../../providers/user-service/user-service';

@Component({
  selector: 'news-card',
  templateUrl: 'news-card.html'
})
export class NewsCard {

  @Input('newsItem') newsItem: any;
  private user: any;

  constructor(private userService: UserService) {
    userService.userSubject.subscribe(
      user => this.user = user,
      err => console.error(err),
      () => {}
    )
  }
}
