
//core
import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';

//cordova
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { Camera } from '@ionic-native/camera';
import { Geolocation } from '@ionic-native/geolocation';
import { OneSignal } from '@ionic-native/onesignal';

//app
import { MyApp } from './app.component';
import { HomePageModule } from '../pages/home/home.module';
import { GroupsPageModule } from '../pages/groups/groups.module';
import { SendPageModule } from '../pages/send/send.module';
import { OfferPageModule } from '../pages/offer/offer.module';
import { TabsPageModule } from '../pages/tabs/tabs.module';
import { TabsPage } from '../pages/tabs/tabs';
import { LoginPageModule } from '../pages/login/login.module';
import { LoginEmailPageModule } from '../pages/login-email/login-email.module';
import { SignupEmailPageModule } from '../pages/signup-email/signup-email.module';
import { ProfilePageModule } from '../pages/profile/profile.module';
import { PurchaseModalModule } from '../pages/purchase-modal/purchase-modal.module'

import { UserService } from '../providers/user-service/user-service';
import { TransactionService } from '../providers/transaction-service/transaction-service';
import { NewsService } from '../providers/news-service/news-service';
import { AnalyticsService } from '../providers/analytics-service/analytics-service';
import { PushService } from '../providers/push-service/push-service';

import { NewsCardModule } from '../components/news-card/news-card.module';
import { GroupCardModule } from '../components/group-card/group-card.module';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

//vendor
import { SuperTabsModule } from 'ionic2-super-tabs';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { TagInputModule } from 'ng2-tag-input';

//configs
import { environment } from '../environments/environment';
import { APP_CONFIG, APP_DI_CONFIG } from "./app-config.constants";


@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    NewsCardModule,
    GroupCardModule,
    BrowserModule,
    BrowserAnimationsModule,
    TagInputModule,
    SimpleNotificationsModule.forRoot(),
    SuperTabsModule.forRoot(),
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    HomePageModule,
    SendPageModule,
    OfferPageModule,
    GroupsPageModule,
    LoginPageModule,
    LoginEmailPageModule,
    SignupEmailPageModule,
    ProfilePageModule,
    TabsPageModule,
    PurchaseModalModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    TabsPage
  ],
  providers: [
    TransactionService,
    Camera,
    OneSignal,
    Geolocation,
    StatusBar,
    SplashScreen,
    GoogleAnalytics,
    {provide: APP_CONFIG, useValue: APP_DI_CONFIG},
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    NewsService,
    UserService,
    AnalyticsService,
    PushService
  ]
})
export class AppModule {}
