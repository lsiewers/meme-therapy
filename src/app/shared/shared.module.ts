import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObjNgForPipe } from '../pipes/obj-ng-for.pipe';
import { RangePipe } from '../pipes/range.pipe';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    ObjNgForPipe,
    RangePipe
  ],
  imports: [
    CommonModule,
    FormsModule,
  ],
  exports: [
    ObjNgForPipe,
    RangePipe,
    FormsModule,
  ]
})
export class SharedModule { }
