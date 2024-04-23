import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrderreportPage } from './orderreport.page';

const routes: Routes = [
  {
    path: '',
    component: OrderreportPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrderreportPageRoutingModule {}
