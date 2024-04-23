import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LedgerPage } from './ledger.page';

const routes: Routes = [
  {
    path: '',
    component: LedgerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LedgerPageRoutingModule {}
