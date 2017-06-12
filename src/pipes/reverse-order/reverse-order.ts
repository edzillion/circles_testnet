import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'reverseorder',
})
export class ReverseOrderPipe implements PipeTransform {

   transform(ary: any, fn: Function = (a,b) => a.timestamp > b.timestamp ? 1 : -1): any {
     return ary.sort(fn);
   }
}
