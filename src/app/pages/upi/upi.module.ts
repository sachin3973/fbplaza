import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UpiPageRoutingModule } from './upi-routing.module';

import { UpiPage } from './upi.page';
import { SharedModule } from 'src/app/components/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    UpiPageRoutingModule
  ],
  declarations: [UpiPage]
})
export class UpiPageModule {}
