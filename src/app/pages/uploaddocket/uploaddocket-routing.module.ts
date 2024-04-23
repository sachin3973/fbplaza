import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UploaddocketPage } from './uploaddocket.page';

const routes: Routes = [
  {
    path: '',
    component: UploaddocketPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UploaddocketPageRoutingModule {}
