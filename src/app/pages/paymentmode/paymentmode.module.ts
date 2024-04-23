import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PaymentmodePageRoutingModule } from './paymentmode-routing.module';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { PaymentmodePage } from './paymentmode.page';
import { SharedModule } from 'src/app/components/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    PaymentmodePageRoutingModule,
    Ng2SearchPipeModule
  ],
  declarations: [PaymentmodePage]
})
export class PaymentmodePageModule {}
