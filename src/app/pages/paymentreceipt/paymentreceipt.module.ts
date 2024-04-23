import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PaymentreceiptPageRoutingModule } from './paymentreceipt-routing.module';

import { PaymentreceiptPage } from './paymentreceipt.page';
import { SharedModule } from 'src/app/components/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    PaymentreceiptPageRoutingModule
  ],
  declarations: [PaymentreceiptPage]
})
export class PaymentreceiptPageModule {}
