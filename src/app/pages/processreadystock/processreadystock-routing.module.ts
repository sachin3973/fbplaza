import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProcessreadystockPage } from './processreadystock.page';

const routes: Routes = [
  {
    path: '',
    component: ProcessreadystockPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProcessreadystockPageRoutingModule {}
