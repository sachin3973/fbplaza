import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PartwisecompletionpagePageRoutingModule } from './partwisecompletionpage-routing.module';

import { PartwisecompletionpagePage } from './partwisecompletionpage.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PartwisecompletionpagePageRoutingModule
  ],
  declarations: [PartwisecompletionpagePage]
})
export class PartwisecompletionpagePageModule {}
