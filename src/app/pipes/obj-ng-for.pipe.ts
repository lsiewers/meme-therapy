import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'objNgFor'
})
export class ObjNgForPipe implements PipeTransform {
  transform(value: any): any {
    return value !== undefined && value !== null ? 
     Object.keys(value).map(key => value[key]) : null;
  }
}
