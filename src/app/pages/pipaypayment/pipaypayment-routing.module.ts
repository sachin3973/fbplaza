import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PipaypaymentPage } from './pipaypayment.page';

const routes: Routes = [
  {
    path: '',
    component: PipaypaymentPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PipaypaymentPageRoutingModule {}
