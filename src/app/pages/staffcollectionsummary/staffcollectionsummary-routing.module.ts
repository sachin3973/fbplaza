import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StaffcollectionsummaryPage } from './staffcollectionsummary.page';

const routes: Routes = [
  {
    path: '',
    component: StaffcollectionsummaryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StaffcollectionsummaryPageRoutingModule {}
