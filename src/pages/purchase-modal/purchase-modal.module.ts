import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PurchaseModal } from './purchase-modal';

@NgModule({
  declarations: [
    PurchaseModal,
  ],
  imports: [
    IonicPageModule.forChild(PurchaseModal),
  ],
  exports: [
    PurchaseModal
  ]
})
export class PurchaseModalModule {}
