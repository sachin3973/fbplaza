import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UpdateversionPage } from './updateversion.page';

const routes: Routes = [
  {
    path: '',
    component: UpdateversionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UpdateversionPageRoutingModule {}
