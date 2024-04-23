import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VehiclerecosummaryPage } from './vehiclerecosummary.page';

const routes: Routes = [
  {
    path: '',
    component: VehiclerecosummaryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VehiclerecosummaryPageRoutingModule {}
