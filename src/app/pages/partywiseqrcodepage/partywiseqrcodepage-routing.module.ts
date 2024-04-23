import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PartywiseqrcodepagePage } from './partywiseqrcodepage.page';

const routes: Routes = [
  {
    path: '',
    component: PartywiseqrcodepagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PartywiseqrcodepagePageRoutingModule {}
