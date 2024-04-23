import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VehiclerecosummaryPageRoutingModule } from './vehiclerecosummary-routing.module';

import { VehiclerecosummaryPage } from './vehiclerecosummary.page';
import { SharedModule } from 'src/app/components/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VehiclerecosummaryPageRoutingModule,
    SharedModule
  ],
  declarations: [VehiclerecosummaryPage]
})
export class VehiclerecosummaryPageModule {}
