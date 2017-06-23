import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { UserService } from '../../providers/user-service/user-service';

@Component({
  selector: 'news-card',
  templateUrl: 'news-card.html'
})
export class NewsCard implements OnDestroy, OnInit  {

  @Input('newsItem') newsItem: any;
  private user: any;
  private message: string;
  private subject: string;

  private userSub$: Subscription;

  constructor(private userService: UserService) {

  }

  ngOnInit() {

    this.userSub$ = this.userService.user$.subscribe(
      user => this.user = user,
      err => console.error(err),
      () => { }
    );

    if (this.newsItem.type == 'createProfile') {
      this.message = "Your Circles account was created!";
    }
    else if (this.newsItem.type == 'transaction' && !this.newsItem.from) {
      this.userService.keyToUserName$(this.newsItem.to).subscribe( userName => {
        this.message = `You sent ${this.newsItem.amount} Circles to ${userName}`;
      });
    }
    else if (this.newsItem.type == 'transaction' && this.user.$key == this.newsItem.to) {
      this.userService.keyToUserName$(this.newsItem.from).subscribe( userName => {
        this.message = `You received ${this.newsItem.amount} Circles from ${userName}`;
      });
    }
    else if (this.newsItem.type == 'offerListed') {
      this.message = `You have listed ${this.newsItem.title} for sale on the market.`;
    }
    else if (this.newsItem.type == 'groupJoin') {
      this.message = `You have successfully joined the group: ${this.newsItem.title}`;
    }
    else if (this.newsItem.type == 'purchase') {
      this.userService.keyToUserName$(this.newsItem.from).subscribe( userName => {
        this.message = `You have bought ${this.newsItem.title} from ${userName}`;
      });
    }
    else if (this.newsItem.type == 'sale') {
      this.message = `Sold ${this.newsItem.title} to ${this.subject}`;
    }
  }

  ngOnDestroy () {
    this.userSub$.unsubscribe();
  }
}
