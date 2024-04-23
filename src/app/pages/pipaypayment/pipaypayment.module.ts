import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PipaypaymentPageRoutingModule } from './pipaypayment-routing.module';

import { PipaypaymentPage, SafePipe } from './pipaypayment.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipaypaymentPageRoutingModule
  ],
  declarations: [PipaypaymentPage, SafePipe]
})
export class PipaypaymentPageModule {}
