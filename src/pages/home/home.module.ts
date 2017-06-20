import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HomePage } from './home';
import { NewsCardModule } from '../../components/news-card/news-card.module';

@NgModule({
  declarations: [
    HomePage
  ],
  imports: [
    NewsCardModule,
    IonicPageModule.forChild(HomePage)
  ],
  exports: [
    HomePage
  ]
})
export class HomeModule {}
