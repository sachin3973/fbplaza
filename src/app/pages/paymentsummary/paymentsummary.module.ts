import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PaymentsummaryPageRoutingModule } from './paymentsummary-routing.module';

import { PaymentsummaryPage } from './paymentsummary.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PaymentsummaryPageRoutingModule
  ],
  declarations: [PaymentsummaryPage]
})
export class PaymentsummaryPageModule {}
