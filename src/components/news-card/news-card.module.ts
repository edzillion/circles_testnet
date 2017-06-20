import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NewsCard } from './news-card';
import { PipesModule } from '../../pipes/pipes'

@NgModule({
  declarations: [
    NewsCard,
  ],
  imports: [
    PipesModule,
    IonicPageModule.forChild(NewsCard)
  ],
  exports: [
    NewsCard
  ]
})
export class NewsCardModule {}
