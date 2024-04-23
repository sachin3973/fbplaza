import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PaymentsummaryPage } from './paymentsummary.page';

const routes: Routes = [
  {
    path: '',
    component: PaymentsummaryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaymentsummaryPageRoutingModule {}
