import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RequisitionPage } from './requisition.page';

const routes: Routes = [
  {
    path: '',
    component: RequisitionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RequisitionPageRoutingModule {}
