import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Toast, ToastController } from 'ionic-angular';

import { Subscription } from 'rxjs/Subscription';

import { UserService } from '../../providers/user-service/user-service';
import { User } from '../../interfaces/user-interface';
import { NewsItem } from '../../interfaces/news-item-interface';

@Component({
  selector: 'news-card',
  templateUrl: 'news-card.html'
})
export class NewsCard implements OnDestroy, OnInit  {

  @Input('newsItem') newsItem: NewsItem;
  private user: User;
  private message: string;
  private subject: string;
  private userSub$: Subscription;

  private toast: Toast;

  constructor(private toastCtrl: ToastController, private userService: UserService) {

  }

  ngOnInit() {

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
      () => console.log('news-card ngOnInit userSub$ obs complete')
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
