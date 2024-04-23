import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrderreportPageRoutingModule } from './orderreport-routing.module';

import { OrderreportPage } from './orderreport.page';
import { SharedModule } from 'src/app/components/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OrderreportPageRoutingModule,
    SharedModule,
  ],
  declarations: [OrderreportPage]
})
export class OrderreportPageModule {}
