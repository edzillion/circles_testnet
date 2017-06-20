import { OnDestroy, ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/repeatWhen';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/takeWhile';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/of';

@Pipe({
  name: 'timeAgo',
  pure: false
})
export class TimeAgoPipe implements PipeTransform, OnDestroy {
  private readonly async: AsyncPipe;

  private isDestroyed = false;
  private time: number;
  private timer: Observable<string>;

  constructor(ref: ChangeDetectorRef) {
    this.async = new AsyncPipe(ref);
  }

  public transform(obj: any, ...args: any[]): any {
    if (obj == null) {
      return '';
    }

    // if (!(obj instanceof Date)) {
    //   throw new Error('TimeAgoPipe works only with Dates');
    // }

    this.time = obj as number;

    if (!this.timer) {
      this.timer = this.getObservable();
    }

    return this.async.transform(this.timer);
  }

  public now(): Date {
    return new Date();
  }

  public ngOnDestroy() {
    this.isDestroyed = true;
    // on next interval, will complete
  }

  private getObservable() {
    return Observable
      .of(1)
      .repeatWhen(notifications => {
        // for each next raised by the source sequence, map it to the result of the returned observable
        return notifications.mergeMap((x, i) => {
          const sleep = i < 60 ? 1000 : 30000;
          return Observable.timer(sleep);
        });
      })
      .takeWhile(_ => !this.isDestroyed)
      .map((x, i) => this.elapsed());
  };

  private elapsed(): string {
    let now = this.now().getTime();

    // time since message was sent in seconds
    let seconds = (now - this.time) / 1000;

    // format string
    // if (delta < 60) { // sent in last minute
    //   return `${Math.floor(delta)}s ago`;
    // } else if (delta < 3600) { // sent in last hour
    //   return `${Math.floor(delta / 60)}m ago`;
    // } else if (delta < 86400) { // sent on last day
    //   return `${Math.floor(delta / 3600)}h ago`;
    // } else { // sent more than one day ago
    //   return `${Math.floor(delta / 86400)}d ago`;
    // }

    
		let minutes = Math.round(Math.abs(seconds / 60));
		let hours = Math.round(Math.abs(minutes / 60));
		let days = Math.round(Math.abs(hours / 24));
		let months = Math.round(Math.abs(days/30.416));
		let years = Math.round(Math.abs(days/365));
		if (seconds <= 45) {
			return 'a few seconds ago';
		} else if (seconds <= 90) {
			return 'a minute ago';
		} else if (minutes <= 45) {
			return minutes + ' minutes ago';
		} else if (minutes <= 90) {
			return 'an hour ago';
		} else if (hours <= 22) {
			return hours + ' hours ago';
		} else if (hours <= 36) {
			return 'a day ago';
		} else if (days <= 25) {
			return days + ' days ago';
		} else if (days <= 45) {
			return 'a month ago';
		} else if (days <= 345) {
			return months + ' months ago';
		} else if (days <= 545) {
			return 'a year ago';
		} else { // (days > 545)
			return years + ' years ago';
		}
  }
}
