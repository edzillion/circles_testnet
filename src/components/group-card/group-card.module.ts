import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GroupCard } from './group-card';

@NgModule({
  declarations: [
    GroupCard,
  ],
  imports: [
    IonicPageModule.forChild(GroupCard),
  ],
  exports: [
    GroupCard
  ]
})
export class GroupCardModule {}
