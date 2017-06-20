import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GroupsPage } from './groups';
import { GroupCardModule } from '../../components/group-card/group-card.module';

@NgModule({
  declarations: [
    GroupsPage
  ],
  imports: [
    GroupCardModule,
    IonicPageModule.forChild(GroupsPage)
  ],
  exports: [
    GroupsPage
  ]
})
export class GroupsPageModule {}
