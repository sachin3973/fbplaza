import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrdersummaryPageRoutingModule } from './ordersummary-routing.module';

import { OrdersummaryPage } from './ordersummary.page';
import { SharedModule } from 'src/app/components/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OrdersummaryPageRoutingModule,
    SharedModule
  ],
  declarations: [OrdersummaryPage]
})
export class OrdersummaryPageModule {}
