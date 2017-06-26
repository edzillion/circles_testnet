import { Injectable, OnDestroy } from '@angular/core';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { Platform } from 'ionic-angular';

import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subscription } from 'rxjs/Subscription';

import { environment } from '../../environments/environment';

// override for browser google analytics ga.js
declare var ga: any;

@Injectable()
export class AnalyticsService implements OnDestroy {

  private pageViewsSubject$: ReplaySubject<string>;
  private pageViewsSub$: Subscription;

  constructor(private platform: Platform, private gaCordova: GoogleAnalytics) {
    this.platform.ready().then(() => {

      if (this.platform.is("ios") || this.platform.is("android")) {
        this.gaCordova.startTrackerWithId(environment.googleAnalytics.id).then(
          res => {

            console.log("startTrackerWithId res", res);
            this.trackPageView('Circles Bootup');

            // now that we are sure the tracker has started lets connect our ReplaySubject
            // so that it can send any previous pageviews.
            this.pageViewsSub$ = this.pageViewsSubject$.subscribe(
              pageName => {
                if (this.platform.is("ios") || this.platform.is("android")) {
                  this.gaCordova.trackView(pageName).then(
                    success => {
                      console.log("GoogleAnalytics: Tracked view for mobile: " + pageName);
                    }).catch(
                    error => {
                      console.log("GoogleAnalytics error tracking view: " + error);
                    });
                }
                else { //we are on web - todo: this code is currently never reached
                  ga('set', 'page', pageName);
                  ga('send', 'pageview');
                  console.log("GoogleAnalytics: Tracked pageview for web: " + pageName);
                }
              },
              error => {
                console.log("GoogleAnalytics: pageView Subject fail: " + error);
              },
              () => console.log('analytics-service constructor pageViewsSub$ obs complete')

            );

          },
          error => console.log("startTrackerWithId error", error)
        );
      }

    });

    this.pageViewsSubject$ = new ReplaySubject<string>(10);
  }

  public trackPageView(pageName: string):void {
    this.pageViewsSubject$.next(pageName);
  }

  ngOnDestroy() {
    this.pageViewsSub$.unsubscribe();
  }
}
