import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PendingdeliveryreportPage } from './pendingdeliveryreport.page';

const routes: Routes = [
  {
    path: '',
    component: PendingdeliveryreportPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PendingdeliveryreportPageRoutingModule {}
