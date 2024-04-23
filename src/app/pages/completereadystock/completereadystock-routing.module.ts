import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CompletereadystockPage } from './completereadystock.page';

const routes: Routes = [
  {
    path: '',
    component: CompletereadystockPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CompletereadystockPageRoutingModule {}
