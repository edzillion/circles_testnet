import { NgModule } from '@angular/core';
import { KeyToUserPipe } from './key-to-user/key-to-user';
import { KeyToUserNamePipe } from './key-to-username/key-to-username';
import { TimeAgoPipe } from './time-ago/time-ago';
import { ReverseOrderPipe } from './reverse-order/reverse-order';

@NgModule({
  declarations: [
    KeyToUserPipe,
    KeyToUserNamePipe,
    TimeAgoPipe,
    ReverseOrderPipe
  ],
  imports: [

  ],
  exports: [
    KeyToUserPipe,
    KeyToUserNamePipe,
    TimeAgoPipe,
    ReverseOrderPipe
  ]
})
export class PipesModule { }
