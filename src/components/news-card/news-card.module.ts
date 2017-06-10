import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NewsCard } from './news-card';

@NgModule({
  declarations: [
    NewsCard,
  ],
  imports: [
    IonicPageModule.forChild(NewsCard),
  ],
  exports: [
    NewsCard
  ]
})
export class NewsCardComponentModule {}
