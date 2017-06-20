import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TabsPage } from './tabs';

import { SuperTabsModule } from 'ionic2-super-tabs';

@NgModule({
  declarations: [
    TabsPage,
  ],
  imports: [
    SuperTabsModule,
    IonicPageModule.forChild(TabsPage),
  ],
  exports: [
    TabsPage
  ]
})
export class TabsPageModule {}
