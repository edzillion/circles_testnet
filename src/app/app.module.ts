
//core
import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';

//cordova
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { Camera } from '@ionic-native/camera';
import { Geolocation } from '@ionic-native/geolocation';

//app
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { GroupsPage } from '../pages/groups/groups';
import { SendPage } from '../pages/send/send';
import { OfferPage } from '../pages/offer/offer';
import { TabsPage } from '../pages/tabs/tabs';
import { LoginPage } from '../pages/login/login';
import { LoginEmailPage } from '../pages/login-email/login-email';
import { SignupEmailPage } from '../pages/signup-email/signup-email';
import { ProfilePage } from '../pages/profile/profile';

import { PurchaseModal } from '../pages/purchase-modal/purchase-modal'


import { DataService } from '../providers/data-service/data-service';
import { UserService } from '../providers/user-service/user-service';
import { TransactionService } from '../providers/transaction-service/transaction-service';
import { NewsService } from '../providers/news-service/news-service';

import { NewsCard } from '../components/news-card/news-card';
import { GroupCard } from '../components/group-card/group-card';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

//vendor
import { SuperTabsModule } from 'ionic2-super-tabs';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

//configs
import { environment } from '../environments/environment';
import { APP_CONFIG, APP_DI_CONFIG } from "./app-config.constants";

//pipes
import { KeyToUserPipe } from '../pipes/key-to-user/key-to-user';
import { KeyToUserNamePipe } from '../pipes/key-to-username/key-to-username';
import { TimeAgoPipe } from 'time-ago-pipe';


@NgModule({
  declarations: [
    MyApp,
    HomePage,
    GroupsPage,
    SendPage,
    OfferPage,
    TabsPage,
    LoginPage,
    LoginEmailPage,
    SignupEmailPage,
    ProfilePage,
    NewsCard,
    GroupCard,
    PurchaseModal,
    KeyToUserPipe,
    KeyToUserNamePipe,
    TimeAgoPipe
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    SimpleNotificationsModule.forRoot(),
    SuperTabsModule.forRoot(),
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    AngularFireAuthModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    GroupsPage,
    SendPage,
    OfferPage,
    TabsPage,
    LoginPage,
    LoginEmailPage,
    SignupEmailPage,
    ProfilePage,
    PurchaseModal
  ],
  providers: [
    TransactionService,
    Camera,
    Geolocation,
    StatusBar,
    SplashScreen,
    GoogleAnalytics,
    {provide: APP_CONFIG, useValue: APP_DI_CONFIG},
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    NewsService,
    KeyToUserPipe,
    KeyToUserNamePipe,
    TimeAgoPipe,
    DataService,
    UserService
  ]
})
export class AppModule {}
