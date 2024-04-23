import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BlprinterPage } from './blprinter.page';

const routes: Routes = [
  {
    path: '',
    component: BlprinterPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BlprinterPageRoutingModule {}
